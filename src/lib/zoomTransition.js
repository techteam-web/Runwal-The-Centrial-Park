// A scene change played as a zoom into the spot that was clicked: the room
// being left magnifies about that point — the camera itself never turns — and
// fades away onto the next room, which eases in to rest.
//
// The room being left is frozen into a 2D canvas laid over the viewer and the
// zoom is a CSS scale on that, with its origin on the clicked point. Scaling a
// still frame magnifies it about exactly that point, which neither the field
// of view (always centred) nor Marzipano's layer `rect` (its off-screen
// compensation is wrong once a rect spills past the left or top edge) can do.
// It also means the next room is switched in underneath straight away, so its
// tiles get the whole zoom to load.
//
// Like the rest of the Marzipano code, this only ever runs in the browser.

import { gsap } from "gsap";

// ---- the feel, in seconds ----
const FADE_AT = 0.45; // how long the zoom runs before the next room shows through
const FADE = 0.7; // the crossfade itself
const ARRIVE = 1.0; // the next room's own zoom, easing to rest
const PUSH = 2.2; // how far the room being left is magnified by the end
const ARRIVE_FROM = 0.88; // the next room starts this far back from its rest

// Magnifying the picture by `m` is dividing the tangent of the half-angle by
// it — scaling the fov itself would bend the curve and read as a lurch.
const magnify = (fov, m) => 2 * Math.atan(Math.tan(fov / 2) / m);

// The next room goes in fully opaque under the overlay. Marzipano calls this
// with 0 before anything else, so it can't simply be handed `t` like the
// default fade does.
const showAtOnce = (t, scene) =>
  scene.listLayers().forEach((layer) => layer.mergeEffects({ opacity: 1 }));

/**
 * Zooms from one built scene ({ data, scene, view }) into another.
 *
 * viewer     — the Marzipano viewer both scenes belong to.
 * overlay    — a <canvas> covering the stage, left at opacity 0 between uses.
 * focus      — { yaw, pitch } in `from` to zoom into; the middle of the
 *              screen if it's missing or off screen.
 * onSwitch   — called the moment the next scene takes over.
 * onComplete — called once everything has come to rest.
 *
 * Returns the GSAP timeline, so it can be killed if the viewer goes away.
 */
export function zoomToScene({ viewer, overlay, from, to, focus, onSwitch, onComplete }) {
  const fromView = from.view;
  const toView = to.view;
  const width = fromView.width();
  const height = fromView.height();

  const spot = focus && fromView.coordinatesToScreen(focus);
  const originX = spot ? gsap.utils.clamp(0, width, spot.x) : width / 2;
  const originY = spot ? gsap.utils.clamp(0, height, spot.y) : height / 2;

  // Freeze the room being left. The WebGL canvas doesn't keep its drawing
  // buffer between frames, so it's rendered and copied in the same task,
  // before the browser gets the chance to clear it.
  const stage = viewer.stage();
  const source = stage.domElement();
  stage.render();
  overlay.width = source.width;
  overlay.height = source.height;
  overlay.getContext("2d").drawImage(source, 0, 0);
  gsap.set(overlay, {
    opacity: 1,
    scale: 1,
    transformOrigin: `${originX}px ${originY}px`,
  });

  // Work out where the next scene comes to rest while its limiter is still on,
  // so handing the limiter back at the end moves nothing. The size goes first:
  // a scene that's never been shown has none yet, and the limiter reads it.
  toView.setSize({ width, height });
  toView.setParameters(to.data.initialViewParameters);
  const rest = toView.parameters();

  // It starts wider than its limits allow, so the limiter comes off until it
  // has settled.
  const toLimiter = toView.limiter();
  toView.setLimiter(null);
  toView.setFov(magnify(rest.fov, ARRIVE_FROM));

  const hotspotsIn = to.scene.hotspotContainer().domElement();
  to.scene.switchTo({ transitionDuration: 0, transitionUpdate: showAtOnce });
  hotspotsIn.style.opacity = "0";
  onSwitch?.();

  const state = { arrive: 0 };

  const finish = () => {
    toView.setParameters(rest);
    toView.setLimiter(toLimiter);
    gsap.set(overlay, { opacity: 0, scale: 1 });
    overlay.width = 0; // drop the frozen frame rather than hold it in memory
    onComplete?.();
  };

  return (
    gsap
      .timeline({ onComplete: finish })
      // The push accelerates all the way through the fade, so the hand-off
      // happens mid-motion rather than from a standstill.
      .to(overlay, { scale: PUSH, duration: FADE_AT + FADE, ease: "power2.in" }, 0)
      .to(overlay, { opacity: 0, duration: FADE, ease: "power1.inOut" }, FADE_AT)
      .to(
        state,
        {
          arrive: 1,
          duration: ARRIVE,
          ease: "power2.out",
          onUpdate: () =>
            toView.setFov(magnify(rest.fov, ARRIVE_FROM + (1 - ARRIVE_FROM) * state.arrive)),
        },
        FADE_AT
      )
      .to(hotspotsIn, { opacity: 1, duration: 0.4, ease: "power1.out" }, FADE_AT + ARRIVE - 0.3)
  );
}
