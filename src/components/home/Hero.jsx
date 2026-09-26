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

      {/* ---- the teal column: about a third of a desktop, the whole screen
           on phones. The percentage is what keeps it in proportion on a wide
           monitor; the min and max stop it turning into a slot on a small
           laptop or a half-page slab on an ultrawide. flex-1 is what makes it
           fill a short mobile viewport. ---- */}
      <section
        data-hero-panel
        className="panel-gradient @container relative flex w-full flex-1 flex-col justify-center px-8 py-20 sm:px-14 sm:py-24 lg:w-[32%] lg:max-w-[600px] lg:min-w-[440px] lg:flex-none lg:px-10 lg:py-16 xl:px-12 2xl:px-14"
      >
        {/* A hairline down the seam where the column meets the photo. */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-mint/45 to-transparent lg:block" />

        {/* Carries the panel's teal a little way across the photo so the column
            doesn't end in a hard vertical cut against the sky. It hangs off the
            panel's own right edge, so it follows the column at every width. */}
        <div className="pointer-events-none absolute inset-y-0 left-full hidden w-[45%] bg-gradient-to-r from-forest-deep/85 via-forest-deep/25 to-transparent lg:block" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          data-hero-logo
          src="/runwalLogo.svg"
          alt="Runwal The Central Park"
          width={72}
          height={93}
          className="h-auto w-[68px] opacity-0 sm:w-20 lg:w-[84px] xl:w-[92px]"
        />

        <div ref={copyRef}>
          <div className="mt-8 h-px w-16 bg-mint/60 lg:w-20" />

          <h1 className="pointer-events-none mt-6 font-display text-[clamp(2.05rem,12.5cqw,4rem)] leading-[1.1] text-sand-light">
            Runwal
            <br />
            The Central Park
          </h1>

          {/* The long copy would crowd a 26% column, so it's for phones and
              tablets only — the desktop gets the photograph instead. */}
          <p className="pointer-events-none mt-6 max-w-lg font-body text-base leading-relaxed text-sand/75 sm:text-lg lg:hidden">
            Step inside every room in full 360°. Move between the living spaces,
            the bedrooms and the balconies exactly as you would on a site visit.
          </p>

          <p className="pointer-events-none mt-5 hidden font-body text-[0.95rem] leading-relaxed text-sand/75 lg:block xl:mt-6 xl:text-base">
            Step inside every room in full 360°.
          </p>

          {/* One way in per unit, side by side. Two equal columns sized to the
              wider label, so the pair reads as a set rather than two buttons
              that happen to be neighbours.

              "View" is for screen readers only: with it showing, a pair of
              these is ~340px wide, and the desktop column has 264px at 1280. */}
          <div className="mt-9 grid w-full max-w-[420px] grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:max-w-[460px]">
            <EnterButton href="/tour/3-bhk">
              <span className="sr-only">View </span>3 BHK
            </EnterButton>
            <EnterButton href="/tour/4-5-bhk">
              <span className="sr-only">View </span>4.5 BHK
            </EnterButton>
          </div>

          <p className="pointer-events-none mt-8 font-body text-[11px] tracking-[0.28em] text-mint/60 uppercase sm:mt-10 sm:text-xs">
           Virtual Walkthrough
          </p>
        </div>
      </section>
    </main>
  );
}
