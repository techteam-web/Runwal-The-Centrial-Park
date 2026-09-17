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
      {/* The warm side. Sits behind everything and fills whatever the dark
          column doesn't take. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200" />

      {/* A little depth on the warm side so it isn't a flat wash. */}
      <div
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(70% 55% at 78% 30%, rgba(255,255,255,0.75) 0%, transparent 60%), radial-gradient(60% 50% at 88% 88%, rgba(201,168,103,0.28) 0%, transparent 65%)",
        }}
      />

      {/* ---- the dark column: 55% on desktop, full width on mobile ---- */}
      <section
        data-hero-panel
        className="panel-gradient relative flex w-full flex-col justify-center px-8 py-20 sm:px-14 lg:w-[55%] lg:px-20"
      >
        {/* A hairline of gold down the seam where the two halves meet. */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent lg:block" />

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
          <div className="mt-9 h-px w-16 bg-gold/50" />

          <h1 className="mt-7 font-display text-4xl leading-[1.12] text-cream sm:text-5xl lg:text-[3.4rem]">
            Runwal
            <br />
            The Central Park
          </h1>

          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-gold-light/70">
            Step inside every room in full 360°. Move between the living spaces,
            the bedrooms and the balconies exactly as you would on a site visit.
          </p>

          <div className="mt-11">
            <EnterButton />
          </div>

          <p className="mt-8 font-body text-[11px] tracking-[0.3em] text-gold/45 uppercase">
            17 Spaces · Interactive Walkthrough
          </p>
        </div>
      </section>
    </main>
  );
}
