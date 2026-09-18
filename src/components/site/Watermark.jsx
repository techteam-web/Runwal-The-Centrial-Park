// The "powered by" mark, pinned bottom-right on every page.
//
// z-40 deliberately sits below the intro loader (70) and the page-transition
// panel (90), so it stays hidden while either of those is covering the screen
// and only reappears once the page is actually settled.
export default function Watermark() {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/brainwing-420.webp"
        alt="Powered by Brainwing Innovations"
        width={420}
        height={112}
        // The shadow is what keeps a white lockup legible when it lands on a
        // pale part of the photograph rather than the dark panel.
        className="h-auto w-24 opacity-60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)] sm:w-28 lg:w-32"
      />
    </div>
  );
}
