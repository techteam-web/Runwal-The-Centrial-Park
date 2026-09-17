"use client";

// One link hotspot: a dark gold-rimmed core with rings breathing out of it,
// and the destination's name sliding out on hover. The pulse keyframes live
// in globals.css because they run continuously — handing that to GSAP would
// mean a live tween per hotspot, and a scene can hold eight of them.
export default function CustomHotspot({ label, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Go to ${label}`}
      className="group relative flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
    >
      {/* the expanding rings */}
      <span className="hotspot-ring absolute h-12 w-12 rounded-full border-2 border-gold/80" />
      <span className="hotspot-ring-delayed absolute h-12 w-12 rounded-full border-2 border-gold/80" />

      {/* The core is deliberately dark with a gold rim rather than solid gold:
          a gold dot vanishes against a sunlit window or a pale wall, which is
          most of what these sit on top of. */}
      <span className="hotspot-core relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold bg-panel-deep/85 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,103,0.9)]" />
      </span>

      {/* the name — collapsed until hover so the view stays uncluttered */}
      <span className="pointer-events-none absolute top-1/2 left-1/2 ml-7 -translate-y-1/2 translate-x-1 rounded-full border border-gold/30 bg-panel-deep/90 px-3.5 py-1.5 font-body text-xs whitespace-nowrap text-cream capitalize opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
