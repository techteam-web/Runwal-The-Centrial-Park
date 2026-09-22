"use client";

import { useEffect, useRef } from "react";
import { formatSceneName } from "@/lib/marzipano-helpers";

// Bottom-centre scene nav. 17 scenes never fit on a phone, so the rail
// scrolls horizontally and keeps the active chip dragged into view.
export default function SceneSwitcher({ tour, currentId, onSelect }) {
  const railRef = useRef(null);

  useEffect(() => {
    const active = railRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentId]);

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-4xl pr-24 sm:pr-28 lg:pr-0">
      <div
        ref={railRef}
        className="flex gap-2 overflow-x-auto rounded-full border border-gold/20 bg-panel-deep/65 p-2 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tour.data.scenes.map((scene) => {
          const active = scene.id === currentId;
          return (
            <button
              key={scene.id}
              type="button"
              data-active={active}
              onClick={() => onSelect(scene.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-body text-[11px] tracking-wide whitespace-nowrap capitalize transition-colors duration-300 ${
                active
                  ? "bg-gold/85 text-panel-deep"
                  : "text-gold-light/60 hover:bg-gold/10 hover:text-gold-light"
              }`}
            >
              {formatSceneName(scene.name)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
