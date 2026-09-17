"use client";

export default function AutorotateToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Stop auto rotation" : "Start auto rotation"}
      className={`flex h-10 items-center gap-2 rounded-full border px-4 backdrop-blur-md transition-colors duration-300 ${
        active
          ? "border-gold/60 bg-gold/15 text-gold-light"
          : "border-gold/25 bg-panel-deep/60 text-gold/70 hover:border-gold/50 hover:text-gold-light"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        {active ? (
          <path
            d="M9.5 8.5v7M14.5 8.5v7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M9.5 7.8l7 4.2-7 4.2V7.8z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        )}
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeDasharray="3 3"
          opacity="0.55"
        />
      </svg>
      <span className="hidden font-body text-[10px] tracking-[0.25em] uppercase sm:inline">
        Auto
      </span>
    </button>
  );
}
