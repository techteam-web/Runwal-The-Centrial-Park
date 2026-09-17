"use client";

import dynamic from "next/dynamic";

// Marzipano is browser-only, so the viewer is never prerendered — `ssr: false`
// keeps it out of the server render entirely.
const PanoViewer = dynamic(() => import("@/components/tour/PanoViewer"), {
  ssr: false,
});

export default function TourPage() {
  return <PanoViewer />;
}
