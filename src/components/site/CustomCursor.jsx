"use client";

import { useEffect, useRef } from "react";

// A gold dot that sits exactly on the pointer and a ring that trails it. The
// ring opens out over anything clickable and shows a pair of arrows over the
// panorama, where the whole surface is "drag to look around".
//
// Only ever switched on for a real mouse. Touch screens have no pointer to
// replace, so on those the markup stays invisible and the native cursor is
// never hidden — .has-custom-cursor on <html> is what hides it, and it's only
// added once the check below has passed.
//
// Everything per-frame is written straight to the DOM: a React render on
// every mouse move would be far too slow for something that must never lag.

// Anything that should read as clickable. `data-cursor="link"` is the escape
// hatch for a clickable element that isn't one of these.
const INTERACTIVE =
  'a[href], button, [role="button"], label, select, summary, [data-cursor="link"]';

// Share of the remaining distance the ring closes each 60Hz frame. Lower
// trails further behind.
const FOLLOW = 0.2;

export default function CustomCursor() {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    html.classList.add("has-custom-cursor");

    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;
    let last = 0;
    let seen = false;
    let state = "default";

    const place = (el, px, py) => {
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };

    // The ring eases toward the pointer, corrected for frame time so it
    // trails the same distance on a 60Hz laptop and a 144Hz monitor. The loop
    // stops once the ring has caught up and restarts on the next move.
    const tick = (now) => {
      const dt = last ? Math.min(now - last, 64) : 16.7;
      last = now;
      const k = reduced ? 1 : 1 - Math.pow(1 - FOLLOW, dt / 16.7);
      ringX += (x - ringX) * k;
      ringY += (y - ringY) * k;
      place(ring, ringX, ringY);

      if (Math.abs(x - ringX) + Math.abs(y - ringY) > 0.1) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        last = 0;
      }
    };

    const setState = (next) => {
      if (next === state) return;
      state = next;
      root.dataset.state = next;
    };

    const onMove = (event) => {
      // A touch or a pen on a hybrid laptop: step out of the way until the
      // mouse comes back.
      if (event.pointerType !== "mouse") {
        root.dataset.visible = "false";
        return;
      }

      x = event.clientX;
      y = event.clientY;
      place(dot, x, y);

      // The very first move lands the ring on the pointer instead of flying
      // it in from the top-left corner.
      if (!seen) {
        seen = true;
        ringX = x;
        ringY = y;
        place(ring, x, y);
      }
      root.dataset.visible = "true";

      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest(INTERACTIVE);
      if (link && !link.matches(":disabled")) setState("link");
      else if (target?.closest('[data-cursor="drag"]')) setState("drag");
      else setState("default");

      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onDown = (event) => {
      if (event.pointerType === "mouse") root.dataset.pressed = "true";
    };
    const onUp = () => {
      root.dataset.pressed = "false";
    };
    const onLeave = () => {
      root.dataset.visible = "false";
    };

    // Capture phase, so nothing further down — the panorama's own drag
    // handling included — can swallow a move before it gets here.
    const opts = { capture: true, passive: true };
    window.addEventListener("pointermove", onMove, opts);
    window.addEventListener("pointerdown", onDown, opts);
    window.addEventListener("pointerup", onUp, opts);
    window.addEventListener("pointercancel", onUp, opts);
    html.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      html.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove, opts);
      window.removeEventListener("pointerdown", onDown, opts);
      window.removeEventListener("pointerup", onUp, opts);
      window.removeEventListener("pointercancel", onUp, opts);
      html.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="cursor"
      aria-hidden="true"
      data-state="default"
      data-visible="false"
      data-pressed="false"
    >
      {/* Each part is split in two: the outer element is moved to the pointer
          by the code above, the inner one is what CSS sizes and scales. Doing
          both on one element would scale about the wrong point. */}
      <div ref={ringRef} className="cursor-follow">
        <div className="cursor-ring">
          <svg className="cursor-arrow cursor-arrow-left" viewBox="0 0 8 12" fill="none">
            <path d="M6.5 1 1.5 6l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="cursor-arrow cursor-arrow-right" viewBox="0 0 8 12" fill="none">
            <path d="m1.5 1 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div ref={dotRef} className="cursor-follow">
        <div className="cursor-dot" />
      </div>
    </div>
  );
}
