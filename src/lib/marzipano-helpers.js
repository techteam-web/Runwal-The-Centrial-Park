// Everything here takes the Marzipano module as an argument rather than
// importing it. Marzipano touches `window` and `document` the moment it's
// loaded, so it can only ever be imported inside a browser-side effect —
// a top-level import in this file would drag it into the server bundle.
//
// `tour` is one entry from lib/tours.js.

// Matches the export on disk: <tiles>/<id>/<level>/<face>/<y>/<x>.jpg
const tileUrl = (tour, id) => `${tour.tiles}/${id}/{z}/{f}/{y}/{x}.jpg`;
const previewUrl = (tour, id) => `${tour.tiles}/${id}/preview.jpg`;

export function findScene(tour, id) {
  return tour.data.scenes.find((scene) => scene.id === id);
}

// The names come straight out of the Marzipano export, which carries the
// original file naming with it — underscores, the odd doubled space, some
// camelCase, a digit run into the word before it ("View1"). Tidied here for
// display rather than edited into the tour data, so re-exporting a tour
// doesn't quietly undo it.
//
// Only `name` is touched. `id` has to keep matching the tile folders on disk.
export function formatSceneName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function sceneName(tour, id) {
  const scene = findScene(tour, id);
  return scene ? formatSceneName(scene.name) : id;
}

// Builds every scene up front. Marzipano only fetches tiles for whichever
// scene is actually being displayed, so this is cheap — it's just geometry
// and URL templates until something is shown.
export function createScenes(Marzipano, viewer, tour) {
  return tour.data.scenes.map((data) => {
    const source = Marzipano.ImageUrlSource.fromString(tileUrl(tour, data.id), {
      cubeMapPreviewUrl: previewUrl(tour, data.id),
    });

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
