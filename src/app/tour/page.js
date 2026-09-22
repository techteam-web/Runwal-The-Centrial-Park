import { redirect } from "next/navigation";
import { DEFAULT_TOUR } from "@/lib/tours";

// There's a tour per unit now, under /tour/<unit>. The old single-tour
// address still lands somewhere rather than on a 404.
export default function TourIndex() {
  redirect(`/tour/${DEFAULT_TOUR}`);
}
