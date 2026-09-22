import TourClient from "@/components/tour/TourClient";
import { TOUR_SLUGS } from "@/lib/tours";

// One prerendered page per unit. Anything else 404s rather than opening an
// empty viewer.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOUR_SLUGS.map((unit) => ({ unit }));
}

export default async function TourPage({ params }) {
  const { unit } = await params;
  return <TourClient unit={unit} />;
}
