// Where each panorama sits on its unit's floor plan, and which way its yaw=0
// points.
//
// `x`/`y` are percentages of the source image, not of the cropped frame — the
// crop is applied to the plan and the markers together, so both stay in the
// image's own coordinate space.
//
// `north` is the compass bearing, in degrees clockwise from the top of the
// plan, that the panorama's yaw=0 faces. The radar rotation is simply
// north + yaw, which is what keeps the cone pointing where the visitor is
// actually looking.
//
// These were not guessed: each scene's cube-map preview was unwrapped into a
// yaw-labelled strip, a landmark with a known place on the plan was read off
// it (a balcony's glazing, a door, a window, the utility's louvre) and the
// bearing solved from there, then checked against the direction of that
// scene's own link hotspots.
//
// Every unit's panoramas were exported with their own arbitrary yaw origin,
// so a re-export of any scene means re-reading its `north`.

// `crop` is the drawing's own bounding box as fractions of the image,
// measured off the file with a little breathing room added — both exports
// carry a white margin that would otherwise waste the frame.
function buildMinimap({ image, title, source, crop, points }) {
  // Position inside the cropped frame, 0..1. Used to decide which way a
  // marker's name should hang so it doesn't get clipped by the frame edge.
  const framePos = (point) => ({
    fx: (point.x / 100 - crop.x) / crop.w,
    fy: (point.y / 100 - crop.y) / crop.h,
  });

  return {
    image,
    title,
    width: source.width,
    height: source.height,

    // What the frame's box has to be for the cropped plan to fill it exactly.
    aspect: (source.width * crop.w) / (source.height * crop.h),

    // The plane holding the plan and the markers is oversized and pulled up
    // and left, so the frame's own bounds do the cropping.
    plane: {
      width: `${(100 / crop.w).toFixed(3)}%`,
      height: `${(100 / crop.h).toFixed(3)}%`,
      left: `${((-crop.x / crop.w) * 100).toFixed(3)}%`,
      top: `${((-crop.y / crop.h) * 100).toFixed(3)}%`,
    },

    points: points.map((point) => {
      const { fx, fy } = framePos(point);
      return {
        ...point,
        // Markers in the top strip hang their name below instead of above,
        // and the ones near a side edge hang it inward.
        tipBelow: fy < 0.24,
        tipAlign: fx < 0.22 ? "start" : fx > 0.78 ? "end" : "center",
      };
    }),
  };
}

// ---- 4.5 BHK ----
//
// Two scenes only agree to about 20° — the small bathrooms, where the
// author's hotspots don't sit on the door — everything else lands inside 10°.
export const minimap45 = buildMinimap({
  image: "/images/floorplan_4.5-BHK.webp",
  title: "4.5 BHK Floor Plan",
  source: { width: 1491, height: 1055 },
  crop: { x: 0.0604, y: 0.1081, w: 0.8786, h: 0.7479 },
  points: [
    { id: "0-living-cam_2", x: 53.65, y: 55.92, north: 165 },
    { id: "1-living-cam_1", x: 50.17, y: 67.49, north: 92 },
    { id: "2-masterbedroom_02-_bathroom", x: 79.01, y: 39.34, north: 8 },
    { id: "3-master-bedroom-01", x: 15.56, y: 57.82, north: 215 },
    { id: "4-master-bedroom-01_balcony", x: 15.56, y: 76.97, north: 220 },
    { id: "5-master-bedroom-02", x: 85.31, y: 62.09, north: 102 },
    { id: "6-master-bedroom-02_balcony", x: 84.37, y: 76.97, north: 72 },
    { id: "7-master_bathroom_01", x: 26.49, y: 40.95, north: 116 },
    { id: "8-servant-room", x: 52.18, y: 20.66, north: 95 },
    { id: "9-servant_bathroom", x: 46.48, y: 23.22, north: 146 },
    { id: "10-uility", x: 39.71, y: 19.91, north: 176 },
    { id: "11-guest-washroom_2", x: 69.75, y: 40.95, north: 280 },
    { id: "12-kids-bedroom-bathroom", x: 40.24, y: 60.66, north: 210 },
    { id: "13-kids_room", x: 29.17, y: 59.72, north: 172 },
    { id: "14-kitchen", x: 39.24, y: 37.16, north: 138 },
    { id: "15-living-balcony", x: 53.65, y: 76.97, north: 177 },
    { id: "16-guest_room", x: 69.08, y: 57.35, north: 108 },
    { id: "17-foyer", x: 59.69, y: 28.06, north: 168 },
  ],
});

// ---- 3 BHK ----
//
// Bedroom-1 on the plan is the master suite (walk-in wardrobe, en-suite,
// balcony), Bedroom-2 the kids' room and Bedroom-3 the guest room, reached
// through its own small lobby with the guest bathroom off it. "Living room 3"
// is actually shot from the entrance foyer, looking down to the balcony.
//
// Checked against all 43 of the tour's hotspots, the median disagreement is
// 10°. The few large ones are all hotspots the author put on a doorway rather
// than aimed at the next camera — the balcony's sliding door at the far end
// of the living room, the kids' room door, the utility's folding door.
export const minimap3BHK = buildMinimap({
  image: "/images/floorplan_3-BHK.webp",
  title: "3 BHK Floor Plan",
  source: { width: 957, height: 622 },
  crop: { x: 0.0564, y: 0.0193, w: 0.8861, h: 0.9775 },
  points: [
    { id: "0-kids_bedroom_2", x: 41.59, y: 61.9, north: 4 },
    { id: "1-kitchen_1", x: 42.32, y: 42.12, north: 359 },
    { id: "2-living_balcony_4", x: 67.4, y: 88.75, north: 87 },
    { id: "3-livingroom_2", x: 65.31, y: 44.69, north: 200 },
    { id: "4-livingroom_1", x: 62.7, y: 69.94, north: 8 },
    { id: "5-livingroom_3", x: 71.26, y: 20.1, north: 191 },
    { id: "6-master_bedroom_view1", x: 19.85, y: 53.05, north: 141 },
    { id: "7-master_bedroom_view2", x: 22.47, y: 72.35, north: 140 },
    { id: "8-master_balcony", x: 20.38, y: 87.62, north: 275 },
    { id: "9-master_bathroom", x: 28.0, y: 38.26, north: 145 },
    { id: "10-servant_room", x: 60.61, y: 16.08, north: 347 },
    { id: "11-utility_room", x: 47.02, y: 9.97, north: 82 },
    { id: "12-guest_bathroom", x: 83.59, y: 47.43, north: 35 },
    { id: "13-guest_bedroom-view1", x: 87.25, y: 73.15, north: 356 },
    { id: "14-guest_bedroom_view2", x: 77.53, y: 52.25, north: 14 },
    { id: "15-kids_bathroom", x: 49.32, y: 65.11, north: 132 },
    { id: "16-kids_bedroom_1", x: 39.71, y: 75.24, north: 355 },
  ],
});
