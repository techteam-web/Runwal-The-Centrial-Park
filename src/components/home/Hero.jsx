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
      {/* Phones and tablets: no photograph at all, just the palette. The
          panel below covers this once it fills the screen — this is here so
          a short viewport never shows a bare strip underneath. */}
      <div className="home-gradient absolute inset-0 -z-10 lg:hidden" />

      {/* Desktop: the photograph. The background-image itself lives behind a
          min-width media query, so this file is never fetched on the sizes
          that hide it. */}
      <div className="hero-photo absolute inset-0 -z-10 hidden lg:block" />

      {/* Carries the panel's teal a little way across the photo so the column
          doesn't end in a hard vertical cut against the sky. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, rgba(6,56,47,0.92) 0%, rgba(6,56,47,0.45) 10%, rgba(6,56,47,0.12) 24%, transparent 42%)",
        }}
      />

      {/* ---- the teal column: a narrow 26% on desktop, the whole screen on
           phones. flex-1 is what makes it fill a short mobile viewport. ---- */}
      <section
        data-hero-panel
        className="panel-gradient relative flex w-full flex-1 flex-col justify-center px-8 py-20 sm:px-14 lg:w-[26%] lg:min-w-90 lg:flex-none lg:px-9 xl:px-12"
      >
        {/* A hairline down the seam where the column meets the photo. */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-mint/45 to-transparent lg:block" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          data-hero-logo
          src="/runwalLogo.svg"
          alt="Runwal The Central Park"
          width={72}
          height={93}
          className="opacity-0"
        />

        <div ref={copyRef}>
          <div className="mt-8 h-px w-14 bg-mint/60" />

          <h1 className="mt-6 font-display text-4xl leading-[1.12] text-sand-light sm:text-5xl lg:text-[2.6rem] xl:text-[3rem] pointer-events-none">
            Runwal
            <br />
            The Central Park
          </h1>

          {/* The long copy would crowd a 26% column, so it's for phones and
              tablets only — the desktop gets the photograph instead. */}
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-sand/75 lg:hidden pointer-events-none">
            Step inside every room in full 360°. Move between the living spaces,
            the bedrooms and the balconies exactly as you would on a site visit.
          </p>

          <p className="mt-5 hidden font-body text-sm leading-relaxed text-sand/75 lg:block pointer-events-none">
            Step inside every room in full 360°.
          </p>

          {/* One way in per unit. Stacked in the narrow desktop column, where
              side by side they'd overflow it, and side by side on a tablet,
              where the panel is the whole screen. w-fit keeps a stack only as
              wide as its widest button, which the other stretches to. */}
          <div className="mt-9 flex w-fit flex-col gap-3 sm:flex-row lg:flex-col">
            <EnterButton href="/tour/3-bhk">View 3 BHK</EnterButton>
            <EnterButton href="/tour/4-5-bhk">View 4.5 BHK</EnterButton>
          </div>

          <p className="mt-8 font-body text-[10px] tracking-[0.28em] text-mint/60 uppercase pointer-events-none">
            17 Spaces · 360° Walkthrough
          </p>
        </div>
      </section>
    </main>
  );
}
