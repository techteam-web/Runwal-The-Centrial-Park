"use client";

import { useTransition } from "@/components/transition/TransitionProvider";

// The sweep itself lives in globals.css under .shine-btn — a pseudo-element
// band and a keyframe, neither of which a utility class can express.
export default function EnterButton() {
  const { coverAndNavigate } = useTransition();

  return (
    <button
      onClick={() => coverAndNavigate("/tour")}
      className="shine-btn group inline-flex items-center gap-4 rounded-full border border-gold/30 bg-panel-deep/60 px-9 py-4 font-body text-sm tracking-[0.18em] text-cream uppercase hover:border-gold/70 hover:bg-panel/80 hover:text-gold-light focus-visible:outline-none"
    >
      <span>Enter The Virtual Tour</span>

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
