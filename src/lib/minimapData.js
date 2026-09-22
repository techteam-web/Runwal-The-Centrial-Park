// Where each panorama sits on the 4.5 BHK floor plan, and which way its
// yaw=0 points.
//
// `x`/`y` are percentages of the source image (1491 x 1055), not of the
// cropped frame — the crop below is applied to the plan and the markers
// together, so both stay in the image's own coordinate space.
//
// `north` is the compass bearing, in degrees clockwise from the top of the
// plan, that the panorama's yaw=0 faces. The radar rotation is simply
// north + yaw, which is what keeps the cone pointing where the visitor is
// actually looking.
//
// These were not guessed: each scene's cube-map preview was unwrapped into a
// yaw-labelled strip, a landmark with a known place on the plan was read off
// it (a balcony's glazing, a door, the utility's louvre) and the bearing
// solved from there, then checked against the direction of that scene's own
// link hotspots. Two scenes only agree to about 20° — the small bathrooms,
// where the author's hotspots don't sit on the door — everything else lands
// inside 10°.

const SOURCE = { width: 1491, height: 1055 };

// The export carries a wide white margin; this is the drawing's own bounding
// box, measured off the file, with a little breathing room added.
const CROP = { x: 0.0604, y: 0.1081, w: 0.8786, h: 0.7479 };

const POINTS = [
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
];

// Position inside the cropped frame, 0..1. Used to decide which way a
// marker's name should hang so it doesn't get clipped by the frame edge.
const framePos = (point) => ({
  fx: (point.x / 100 - CROP.x) / CROP.w,
  fy: (point.y / 100 - CROP.y) / CROP.h,
});

export const minimapData = {
  image: "/images/floorplan_4.5-BHK.webp",
  title: "4.5 BHK Floor Plan",

  // What the frame's box has to be for the cropped plan to fill it exactly.
  aspect: (SOURCE.width * CROP.w) / (SOURCE.height * CROP.h),

  // The plane holding the plan and the markers is oversized and pulled up and
  // left, so the frame's own bounds do the cropping.
  plane: {
    width: `${(100 / CROP.w).toFixed(3)}%`,
    height: `${(100 / CROP.h).toFixed(3)}%`,
    left: `${((-CROP.x / CROP.w) * 100).toFixed(3)}%`,
    top: `${((-CROP.y / CROP.h) * 100).toFixed(3)}%`,
  },

  points: POINTS.map((point) => {
    const { fx, fy } = framePos(point);
    return {
      ...point,
      // Markers in the top strip hang their name below instead of above, and
      // the ones near a side edge hang it inward.
      tipBelow: fy < 0.24,
      tipAlign: fx < 0.22 ? "start" : fx > 0.78 ? "end" : "center",
    };
  }),
};
