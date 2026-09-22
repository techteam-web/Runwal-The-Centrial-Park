"use client";

import { useTransition } from "@/components/transition/TransitionProvider";

// The sweep itself lives in globals.css under .shine-btn — a pseudo-element
// band and a keyframe, neither of which a utility class can express.
//
// Sized to sit in a pair, side by side. The tightest spots are a 320px phone
// and the 26% desktop column at 1280px, where each button gets ~125px — so
// the padding is lean there, and only opens up on a tablet, where the panel
// is the whole screen.
//
// justify-between only shows when a button is stretched wider than its label —
// the shorter one in a pair is — and keeps both arrows on the right edge.
export default function EnterButton({ href, children }) {
  const { coverAndNavigate } = useTransition();

  return (
    <button
      type="button"
      onClick={() => coverAndNavigate(href)}
      className="shine-btn group inline-flex items-center justify-between gap-3 rounded-none border border-sand/35 bg-forest-deep/50 px-4 py-4 font-body text-xs tracking-[0.18em] text-sand uppercase hover:border-sand/70 hover:bg-forest-deep/80 hover:text-sand-light focus-visible:outline-none sm:gap-4 sm:px-7 sm:text-sm lg:gap-2.5 lg:px-4 lg:py-3.5 lg:text-[11px] lg:tracking-[0.14em]"
    >
      <span>{children}</span>

      {/* The arrow nudges forward on hover — a small second motion so the
          button doesn't rely on the border glow alone. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-1"
      >
        <path
          d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
