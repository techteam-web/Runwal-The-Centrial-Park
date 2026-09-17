"use client";

import { useTransition } from "@/app/components/transition/TransitionProvider";

export default function TourPage() {
  const { coverAndNavigate } = useTransition();

  return (
    <main className="flex min-h-screen items-center justify-center bg-panel-deep">
      <div className="text-center">
        <p className="font-body text-cream">
          The real Marzipano viewer arrives in Phase 5 — this page just
          proves the transition works both ways.
        </p>
        <button
          onClick={() => coverAndNavigate("/")}
          className="mt-6 rounded border border-gold px-6 py-2 font-body text-gold"
        >
          Close
        </button>
      </div>
    </main>
  );
}