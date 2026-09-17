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

export function TransitionProvider({ children }) {
  const overlayRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname(); // the current URL path, e.g. "/" or "/tour"
  const previousPathname = useRef(pathname); // remembers the path we last reacted to

  // REVEAL — runs automatically whenever the route actually changes.
  useEffect(() => {
    // If the path is the same as last time, there's nothing to reveal —
    // this also quietly protects us from React 19's habit of running
    // effects twice in development mode.
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    // The overlay is currently sitting at yPercent: 0 (fully covering the
    // new page). Slide it the rest of the way up and off the top.
    gsap.to(overlayRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      onComplete: () => {
        // Snap it back below the screen with NO animation, ready for
        // the next time someone navigates.
        gsap.set(overlayRef.current, { yPercent: 100 });
      },
    });
  }, [pathname]);

  // COVER + NAVIGATE — call this instead of a plain <Link> or router.push.
  const coverAndNavigate = useCallback(
    (href) => {
      gsap.to(overlayRef.current, {
        yPercent: 0, // slides up from below until it fills the whole screen
        duration: 0.7,
        ease: "power4.inOut",
        onComplete: () => {
          router.push(href); // swap the page — invisible, since it's covered
        },
      });
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ coverAndNavigate }}>
      <TransitionOverlay ref={overlayRef} />
      {children}
    </TransitionContext.Provider>
  );
}