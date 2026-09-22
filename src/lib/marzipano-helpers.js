// Everything here takes the Marzipano module as an argument rather than
// importing it. Marzipano touches `window` and `document` the moment it's
// loaded, so it can only ever be imported inside a browser-side effect —
// a top-level import in this file would drag it into the server bundle.

import { tourData } from "./tourData";

// Matches the export on disk: public/tour/tiles/<id>/<level>/<face>/<y>/<x>.jpg
const TILE_URL = "/tour/tiles/{id}/{z}/{f}/{y}/{x}.jpg";
const PREVIEW_URL = "/tour/tiles/{id}/preview.jpg";

export function findScene(id) {
  return tourData.scenes.find((scene) => scene.id === id);
}

// The names come straight out of the Marzipano export, which carries the
// original file naming with it — underscores, the odd doubled space, one
// camelCase. Tidied here for display rather than edited into tourData.js, so
// re-exporting the tour doesn't quietly undo it.
//
// Only `name` is touched. `id` has to keep matching the tile folders on disk.
export function formatSceneName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function sceneName(id) {
  const scene = findScene(id);
  return scene ? formatSceneName(scene.name) : id;
}

// Builds every scene up front. Marzipano only fetches tiles for whichever
// scene is actually being displayed, so this is cheap — it's just geometry
// and URL templates until something is shown.
export function createScenes(Marzipano, viewer) {
  return tourData.scenes.map((data) => {
    const source = Marzipano.ImageUrlSource.fromString(
      TILE_URL.replace("{id}", data.id),
      { cubeMapPreviewUrl: PREVIEW_URL.replace("{id}", data.id) }
    );

    const geometry = new Marzipano.CubeGeometry(data.levels);

    // The limiter stops the view zooming past the resolution we actually
    // have tiles for, which is what makes a pano go soft and blocky.
    const limiter = Marzipano.RectilinearView.limit.traditional(
      data.faceSize,
      (100 * Math.PI) / 180,
      (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(
      data.initialViewParameters,
      limiter
    );

    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true, // keeps the lowest level resident, so no blank flashes
    });

    return { data, scene, view };
  });
}

// Marzipano's autorotate is a "movement" — a function you hand to the viewer,
// not a flag you set.
export function createAutorotate(Marzipano) {
  return Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI / 2,
  });
}
