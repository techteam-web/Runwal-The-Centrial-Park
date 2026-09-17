"use client";

// A plain full-screen panel. TransitionProvider decides *when* it moves —
// this file only knows how it looks.
//
// Since Next 16 ships with React 19, a component can accept "ref" as a
// normal prop now — the older forwardRef() wrapper isn't needed anymore.
function TransitionOverlay({ ref }) {
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-50 bg-panel-deep"
      style={{ transform: "translateY(100%)" }} // parked just below the screen, invisible
    />
  );
}

export default TransitionOverlay;