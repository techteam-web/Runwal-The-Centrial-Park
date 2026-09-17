"use client";

// A full-screen panel with the mark at its centre. TransitionProvider decides
// *when* it moves and when the mark appears — this file only knows how it
// looks.
//
// Since Next 16 ships with React 19, a component can accept "ref" as a
// normal prop now — the older forwardRef() wrapper isn't needed anymore.
//
// z-90 puts the panel above the intro loader (z-70): coming back from the
// tour the loader mounts again, and at a lower index its plate would paint
// over this panel for a frame before its own effect hides it.
function TransitionOverlay({ ref, markRef }) {
  return (
    <div
      ref={ref}
      className="panel-gradient pointer-events-none fixed inset-0 z-90 flex items-center justify-center"
      style={{ transform: "translateY(100%)" }} // parked just below the screen, invisible
    >
      {/* Initial state is set inline, not with Tailwind's scale-95 / opacity-0:
          v4 compiles those to the standalone `scale` property, which would
          multiply against the `transform` GSAP writes instead of being
          replaced by it. */}
      <div
        ref={markRef}
        className="flex flex-col items-center"
        style={{ transform: "scale(0.92)", opacity: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/runwalLogo.svg" alt="" width={62} height={80} />
        <div className="mt-5 h-px w-12 bg-gold/60" />
      </div>
    </div>
  );
}

export default TransitionOverlay;
