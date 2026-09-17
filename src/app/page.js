"use client"; // needs this because it uses the useTransition hook + an onClick

import { useTransition } from "@/app/components/transition/TransitionProvider";

export default function HomePage() {
  const { coverAndNavigate } = useTransition();

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-r from-orange-100 via-amber-100 to-orange-200">
      <div className="rounded-lg bg-panel px-10 py-8 text-center">
        <h1 className="font-display text-4xl text-cream">
          Runwal The Central Park
        </h1>
        <p className="mt-2 font-body text-gold-light">
          Phase 3 test — click below to try the transition.
        </p>
        <button
          onClick={() => coverAndNavigate("/tour")}
          className="mt-6 rounded border border-gold px-6 py-2 font-body text-gold"
        >
          Enter Panoramic View
        </button>
      </div>
    </main>
  );
}