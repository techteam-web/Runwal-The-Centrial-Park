"use client";

import dynamic from "next/dynamic";
import { getTour } from "@/lib/tours";

// Marzipano is browser-only, so the viewer is never prerendered — `ssr: false`
// keeps it out of the server render entirely. That option is only allowed in
// a Client Component, which is why the page goes through this wrapper rather
// than importing the viewer itself.
const PanoViewer = dynamic(() => import("@/components/tour/PanoViewer"), {
  ssr: false,
});

// The page hands over just the slug: passing the tour itself would serialise
// its whole Marzipano export into the page payload, on top of the bundle.
export default function TourClient({ unit }) {
  const tour = getTour(unit);

  // Keyed by unit, so moving between units builds a fresh viewer instead of
  // reusing one built on the other tour's scenes.
  return <PanoViewer key={tour.slug} tour={tour} />;
}
