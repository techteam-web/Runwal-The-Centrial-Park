// Every unit the site can walk through. The slug is the URL segment
// (/tour/<slug>), and everything a tour needs travels with it — its Marzipano
// export, where its tiles live on disk, its floor plan, and the scene it opens
// on — so no component has to know which unit it's showing.
//
// `firstScene` is set here rather than taken from the export's order: the
// export numbers scenes by file name, which says nothing about where a visit
// should start.

import { tourData } from "./tourData";
import { tourData3BHK } from "./3BHk_TourData";
import { minimap3BHK, minimap45 } from "./minimapData";

export const TOURS = {
  "3-bhk": {
    slug: "3-bhk",
    label: "3 BHK",
    data: tourData3BHK,
    tiles: "/tour/tiles3BHK",
    // Shot from the entrance foyer, looking down into the living room — the
    // view a visitor gets walking in through the front door.
    firstScene: "5-livingroom_3",
    minimap: minimap3BHK,
  },
  "4-5-bhk": {
    slug: "4-5-bhk",
    label: "4.5 BHK",
    data: tourData,
    tiles: "/tour/tiles",
    firstScene: "0-living-cam_2",
    minimap: minimap45,
  },
};

export const TOUR_SLUGS = Object.keys(TOURS);

// Where the old single-tour /tour link lands.
export const DEFAULT_TOUR = "4-5-bhk";

export function getTour(slug) {
  return TOURS[slug] ?? null;
}
