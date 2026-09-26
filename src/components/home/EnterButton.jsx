"use client";

import { useTransition } from "@/components/transition/TransitionProvider";

// The sweep itself lives in globals.css under .shine-btn — a pseudo-element
// band and a keyframe, neither of which a utility class can express.
//
// Sized to sit in a pair, side by side, and to stay a comfortable target at
// every width. The tightest spot is a 320px phone; the desktop column is wide
// enough now that the pair can carry real padding there too.
//
// justify-between only shows when a button is stretched wider than its label —
// the shorter one in a pair is — and keeps both arrows on the right edge.
export default function EnterButton({ href, children }) {
  const { coverAndNavigate } = useTransition();

  return (
    <button
      type="button"
      onClick={() => coverAndNavigate(href)}
      className="shine-btn group inline-flex items-center justify-between gap-2.5 rounded-none border border-sand/35 bg-forest-deep/50 px-4 py-[1.05rem] font-body text-[0.8rem] tracking-[0.16em] text-sand uppercase hover:border-sand/70 hover:bg-forest-deep/80 hover:text-sand-light focus-visible:outline-none sm:gap-4 sm:px-8 sm:py-[1.15rem] sm:text-base lg:gap-3 lg:px-6 lg:py-[1.05rem] lg:text-[0.82rem] lg:tracking-[0.15em] xl:px-7 xl:py-[1.15rem] xl:text-[0.9rem]"
    >
      <span className="whitespace-nowrap">{children}</span>

      {/* The arrow nudges forward on hover — a small second motion so the
          button doesn't rely on the border glow alone. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-1 sm:h-[18px] sm:w-[18px]"
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
