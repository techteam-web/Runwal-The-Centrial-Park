"use client";

import { createContext, useContext, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation"; // App Router hooks —
// note this is "next/navigation", not the older "next/router" you'll see
// in Pages Router tutorials.
import { gsap } from "gsap";
import TransitionOverlay from "./TransitionOverlay";

// Context = a way to make coverAndNavigate() callable from ANY component
// (the Enter button, the Close button...) without passing it down as a
// prop through every layer in between.
const TransitionContext = createContext(null);

export function useTransition() {
  return useContext(TransitionContext);
}

// Cover and reveal share a duration and an ease so the two halves read as
// one continuous motion rather than two separate animations.
const SLIDE_DURATION = 0.8;
const SLIDE_EASE = "power4.inOut";
// A beat at full cover: gives the incoming route time to mount and paint
// before it gets uncovered, and leaves the gold line a moment fully drawn
// on a route that resolves instantly.
const HOLD = 0.4;

export function TransitionProvider({ children }) {
  const overlayRef = useRef(null);
  const markRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname(); // the current URL path, e.g. "/" or "/tour"
  const previousPathname = useRef(pathname); // remembers the path we last reacted to
  const isAnimating = useRef(false);

  // The reveal needs BOTH of these before it may run. Firing on the route
  // alone is what makes a transition look half-played: the new page can
  // commit while the panel is still sliding, and the reveal then starts a
  // second yPercent tween that fights the cover for the same property.
  const coverDone = useRef(false);
  const routeDone = useRef(false);

  // The panel is parked off-screen by an inline `translateY(100%)` so it's
  // already hidden on the very first paint, before any JS runs. But GSAP
  // reads the *computed* transform, which is a matrix — and a matrix can't
  // say whether that 100% was a percentage or a pixel count. It decomposes
  // to `y: <height>px, yPercent: 0`, so the first tween to `yPercent: 0`
  // animates 0 → 0 and leaves the stale pixel offset in place. Restating the
  // parked position through GSAP puts its cache and the DOM back in sync.
  useEffect(() => {
    gsap.set(overlayRef.current, { yPercent: 100, y: 0 });
  }, []);

  const revealIfReady = useCallback(() => {
    if (!coverDone.current || !routeDone.current) return;
    coverDone.current = false;
    routeDone.current = false;

    const tl = gsap.timeline({
      delay: HOLD,
      onComplete: () => {
        // Snap the panel back below the screen and reset the mark, both with
        // NO animation, ready for the next time someone navigates.
        gsap.set(overlayRef.current, {
          yPercent: 100,
          y: 0,
          pointerEvents: "none",
        });
        gsap.set(markRef.current, { scale: 0.92, opacity: 0 });
        isAnimating.current = false;
      },
    });

    // The mark dissolves just before the panel starts moving, so the two
    // overlap instead of waiting on each other.
    tl.to(markRef.current, {
      scale: 1.04,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
    }).to(
      overlayRef.current,
      {
        yPercent: -100, // the rest of the way up and off the top
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
      },
      "-=0.15"
    );
  }, []);

  // The route arriving is only half of the rendezvous — it may well land
  // before the panel has finished covering.
  useEffect(() => {
    // If the path is the same as last time, there's nothing to reveal —
    // this also quietly protects us from React 19's habit of running
    // effects twice in development mode.
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    // A route change we never covered for — the browser's back/forward
    // buttons, or a plain <Link>. The new page is already on screen, so
    // sweeping the panel across it now would play the move backwards.
    // Leave it parked instead.
    if (!isAnimating.current) return;

    routeDone.current = true;
    revealIfReady();
  }, [pathname, revealIfReady]);

  // COVER + NAVIGATE — call this instead of a plain <Link> or router.push.
  const coverAndNavigate = useCallback(
    (href) => {
      // A second click mid-transition would restart the panel from wherever
      // it happens to be and fire a duplicate navigation.
      if (isAnimating.current) return;
      isAnimating.current = true;
      coverDone.current = false;
      routeDone.current = false;

      const tl = gsap.timeline();

      // Catching pointer events stops anyone clicking the outgoing page
      // through the panel once it's on its way in.
      tl.set(overlayRef.current, { pointerEvents: "auto" })
        .to(overlayRef.current, {
          yPercent: 0, // slides up from below until it fills the whole screen
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
          // Navigate the moment the screen is covered, not once the mark has
          // finished — the route then loads *underneath* the mark animation
          // rather than only starting after it.
          onComplete: () => router.push(href),
        })
        .to(
          markRef.current,
          { scale: 1, opacity: 1, duration: 0.55, ease: "power2.out" },
          "-=0.35"
        )
        // The whole cover is done here, mark included. Only now may the
        // reveal go — and if the route already arrived, it goes immediately.
        .call(() => {
          coverDone.current = true;
          revealIfReady();
        });
    },
    [router, revealIfReady]
  );

  return (
    <TransitionContext.Provider value={{ coverAndNavigate }}>
      <TransitionOverlay ref={overlayRef} markRef={markRef} />
      {children}
    </TransitionContext.Provider>
  );
}