"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import EnterButton from "./EnterButton";

// `revealed` flips once the intro loader has handed the logo over. Until
// then everything except the logo slot stays hidden, so nothing pops in
// behind the loader.
export default function Hero({ revealed }) {
  const copyRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (!revealed) return;

    const ctx = gsap.context(() => {
      // Normally the loader has already lit the logo as part of its handoff.
      // On a repeat visit there was no loader, so make sure it's visible.
      gsap.set(logoRef.current, { opacity: 1 });

      gsap.fromTo(
        gsap.utils.toArray(copyRef.current.children),
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
        }
      );
    }, copyRef);

    return () => ctx.revert();
  }, [revealed]);

  return (
    <main className="relative flex min-h-screen flex-col lg:flex-row">
      {/* The palette, full bleed. Sits behind everything and fills whatever
          the teal column doesn't take. */}
      <div className="home-gradient absolute inset-0 -z-10" />

      {/* ---- the teal column: 55% on desktop, full width on mobile ---- */}
      <section
        data-hero-panel
        className="panel-gradient relative flex w-full flex-col justify-center px-8 py-20 sm:px-14 lg:w-[55%] lg:px-20"
      >
        {/* A hairline down the seam where the two halves meet, picking up the
            mint from the middle of the gradient. */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-mint/45 to-transparent lg:block" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          data-hero-logo
          src="/runwalLogo.svg"
          alt="Runwal The Central Park"
          width={84}
          height={109}
          className="opacity-0"
        />

        <div ref={copyRef}>
          <div className="mt-9 h-px w-16 bg-mint/60" />

          <h1 className="mt-7 font-display text-4xl leading-[1.12] text-sand-light sm:text-5xl lg:text-[3.4rem]">
            Runwal
            <br />
            The Central Park
          </h1>

          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-sand/75">
            Step inside every room in full 360°. Move between the living spaces,
            the bedrooms and the balconies exactly as you would on a site visit.
          </p>

          <div className="mt-11">
            <EnterButton />
          </div>

          <p className="mt-8 font-body text-[11px] tracking-[0.3em] text-mint/60 uppercase">
            17 Spaces · Interactive Walkthrough
          </p>
        </div>
      </section>
    </main>
  );
}
