"use client";

import { useTransition } from "@/components/transition/TransitionProvider";

export default function CloseButton() {
  const { coverAndNavigate } = useTransition();

  return (
    <button
      type="button"
      onClick={() => coverAndNavigate("/")}
      aria-label="Close the tour"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 bg-panel-deep/60 text-gold backdrop-blur-md transition-colors duration-300 hover:border-gold/60 hover:text-gold-light"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
