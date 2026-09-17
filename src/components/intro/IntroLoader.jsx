"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Deliberately a module variable and NOT sessionStorage. The intro should
// play on every real visit — a fresh load, a refresh, a new tab — and only be
// skipped when you come back from the tour, which is a client-side navigation
// that never re-runs this module. sessionStorage outlives the page load, so it
// made the intro play once per tab and then never again, which looks exactly
// like the loader being broken.
//
// Set when the intro *finishes*, not when it starts: React's dev-mode double
// mount would otherwise flip it on the first pass and make the second pass
// skip, so the intro would never play while you're working on it.
let introPlayed = false;

// The mark's own proportions, from the SVG's viewBox.
const LOGO_WIDTH = 190;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 131) / 101);

export default function IntroLoader({ onFinish }) {
  const rootRef = useRef(null);
  const plateRef = useRef(null);
  const logoRef = useRef(null);
  const fillRef = useRef(null);
  const outlineRef = useRef(null);
  const strokeRef = useRef(null);
  const counterRef = useRef(null);
  const meterRef = useRef(null);
  const metaRef = useRef(null);

  // Held in a ref so the intro effect below can stay on an empty dependency
  // list. The parent re-renders the moment we call this, and if the callback
  // were a dependency that re-render would restart the whole intro.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    // Returning from the tour. This runs while the transition panel still
    // covers the screen, so dropping the loader outright is never seen.
    if (introPlayed) {
      gsap.set(rootRef.current, { display: "none" });
      onFinishRef.current();
      return;
    }

    const ctx = gsap.context(() => {
      // Held as locals, not read as refs.current inside the callbacks below.
      // ctx.revert() rewinds the count tween, which fires its onUpdate one
      // last time — and React detaches refs BEFORE it runs passive effect
      // cleanups, so by then every .current is already null. The nodes
      // themselves stay perfectly valid to write to.
      const root = rootRef.current;
      const plate = plateRef.current;
      const logo = logoRef.current;
      const fill = fillRef.current;
      const outline = outlineRef.current;
      const stroke = strokeRef.current;
      const counter = counterRef.current;
      const meter = meterRef.current;
      const meta = metaRef.current;

      // The outline is drawn by walking a dash the length of the whole path
      // back to zero, so the stroke appears to be traced on.
      const length = stroke.getTotalLength();
      gsap.set(stroke, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      const progress = { value: 0 };

      const intro = gsap.timeline({ onComplete: runHandoff });

      intro
        .fromTo(
          meta,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          0.2
        )
        // Everything the count drives is written from this one tween's
        // onUpdate. Separate tweens per property would let the number, the
        // meter, the outline and the fill drift apart from each other.
        .to(
          progress,
          {
            value: 100,
            duration: 2.6,
            ease: "power1.inOut",
            onUpdate: () => {
              const value = progress.value;

              counter.textContent = String(Math.round(value)).padStart(3, "0");

              gsap.set(meter, { scaleX: value / 100 });
              gsap.set(stroke, {
                strokeDashoffset: length * (1 - value / 100),
              });
              // Clipping from the top edge downward means the solid mark
              // fills up from its base as the number climbs.
              gsap.set(fill, {
                clipPath: `inset(${100 - value}% 0 0 0)`,
              });
            },
          },
          0
        )
        // A slow swell across the whole draw, so the mark feels alive rather
        // than static while the stroke travels.
        .fromTo(
          logo,
          { scale: 0.94 },
          { scale: 1, duration: 2.6, ease: "power1.inOut" },
          0
        )
        .to({}, { duration: 0.4 }) // a beat at 100 before anything moves
        .to(meta, {
          opacity: 0,
          y: -12,
          duration: 0.45,
          ease: "power2.in",
        });

      // THE SHIFT — the full-bleed plate contracts into the hero's left
      // column while the mark travels to its resting slot inside it. Both
      // targets are measured now rather than at build time, because the
      // column's width depends on the viewport.
      function runHandoff() {
        const heroPanel = document.querySelector("[data-hero-panel]");
        const heroLogo = document.querySelector("[data-hero-logo]");

        // Hidden rather than unmounted at the end: unmounting would mean
        // setState from inside an effect, and there's nothing to reclaim
        // here beyond one empty fixed layer.
        const handoff = gsap.timeline({
          onComplete: () => {
            introPlayed = true;
            gsap.set(root, { display: "none" });
          },
        });

        // The traced outline is an intro flourish; the hero's mark has no
        // such rim, so it has to be gone before the two are swapped.
        handoff.to(outline, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });

        // No hero to hand off to (a layout change, or this loader reused
        // somewhere else) — just get out of the way.
        if (!heroPanel || !heroLogo) {
          handoff.add(() => onFinishRef.current()).to(root, {
            opacity: 0,
            duration: 0.6,
          });
          return;
        }

        const from = logo.getBoundingClientRect();
        const to = heroLogo.getBoundingClientRect();

        handoff
          .to(
            plate,
            {
              width: heroPanel.getBoundingClientRect().width,
              duration: 1.15,
              ease: "power4.inOut",
            },
            // Overlaps the tail of the rim fade rather than queueing behind
            // it, so the shift doesn't feel like it stalls first.
            "-=0.25"
          )
          .to(
            logo,
            {
              // Centre-to-centre, so the two marks line up whatever their
              // box sizes happen to be.
              x: to.left + to.width / 2 - (from.left + from.width / 2),
              y: to.top + to.height / 2 - (from.top + from.height / 2),
              scale: to.width / from.width,
              duration: 1.15,
              ease: "power4.inOut",
            },
            "<"
          )
          .add(() => {
            // The real hero logo is now exactly under ours: light it up and
            // let the hero start its own reveal, so the copy is already
            // arriving as this layer dissolves. Set straight on the style
            // rather than through gsap — it belongs to the hero, and this
            // context's cleanup would otherwise revert it back to invisible.
            heroLogo.style.opacity = "1";
            onFinishRef.current();
          })
          .to(rootRef.current, { opacity: 0, duration: 0.5 }, "+=0.05");
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // pointer-events-none on the root: it's purely a visual layer, and without
  // it the loader would still be swallowing clicks on the hero underneath
  // during its half-second fade out.
  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-70 overflow-hidden"
    >
      {/* The plate. Anchored left and full height so that shrinking its width
          lands it exactly on the hero's left column. */}
      <div
        ref={plateRef}
        className="panel-gradient absolute inset-y-0 left-0 w-full"
      />

      {/* Centred on the viewport, and deliberately NOT a child of the plate —
          otherwise the plate contracting would drag the mark along with it
          and fight the flight we animate by hand. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          ref={logoRef}
          className="relative"
          style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
        >
          {/* The solid mark, clipped away to start and uncovered as the
              count climbs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={fillRef}
            src="/runwalLogo.svg"
            alt="Runwal"
            className="absolute inset-0 h-full w-full"
            style={{ clipPath: "inset(100% 0 0 0)" }}
          />

          {/* The rim that traces itself around the mark. It matches the
              plate in the artwork: 101 x 131 with an 8.5 corner radius. */}
          <svg
            ref={outlineRef}
            viewBox="0 0 101 131"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            {/* The inline dash hides the rim from the very first paint —
                without it the stroke shows fully drawn until JS runs and
                dashes it off. The measured path length replaces this
                immediately; 460 only has to exceed the real ~445. */}
            <rect
              ref={strokeRef}
              x="0.7"
              y="0.7"
              width="99.6"
              height="129.6"
              rx="8.2"
              stroke="var(--color-gold)"
              strokeWidth="1.1"
              style={{ strokeDasharray: 460, strokeDashoffset: 460 }}
            />
          </svg>
        </div>

        {/* opacity 0 inline to match where the fade-in starts. Without it the
            counter and rule render fully visible in the server HTML, then
            snap to invisible the moment GSAP takes over. */}
        <div
          ref={metaRef}
          className="mt-12 flex flex-col items-center"
          style={{ opacity: 0 }}
        >
          <div className="flex items-baseline gap-1 font-display text-cream">
            <span
              ref={counterRef}
              className="text-3xl tabular-nums tracking-wider"
            >
              000
            </span>
            <span className="text-sm text-gold">%</span>
          </div>

          <div className="mt-4 h-px w-40 overflow-hidden bg-gold/20">
            <div
              ref={meterRef}
              className="h-full w-full origin-left bg-gold"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <p className="mt-5 font-body text-[11px] tracking-[0.35em] text-gold-light/60 uppercase">
            The Central Park
          </p>
        </div>
      </div>
    </div>
  );
}
