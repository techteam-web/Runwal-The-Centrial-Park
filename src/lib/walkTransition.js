// A scene change played as a few steps forward: turn to face the way through,
// walk — the view pushing in, gathering pace, with a little head-bob — and the
// next room fades up already moving, then settles as you come to a stop.
//
// One photo per room means there's no real parallax to be had, so "forward"
// is a zoom. In a rectilinear view, narrowing the field of view magnifies the
// picture about its centre, which is how the world ahead grows as you walk
// into it. Everything is driven through the views' own parameters rather than
// CSS on the canvas, so the hotspots and the mini map's radar move with it.
//
// Like the rest of the Marzipano code, this only ever runs in the browser.

import { gsap } from "gsap";

// ---- the feel, in seconds and radians ----
const TURN_MIN = 0.35; // shortest turn, so even a small one reads as deliberate
const TURN_MAX = 0.85; // a half-turn still shouldn't keep the visitor waiting
const TURN_PER_RAD = 0.32;
const WALK_START = 0.55; // how far into the turn the first step is taken
const WALK_PITCH = 0.04; // gaze while walking — just under the horizon

const WALK = 0.95; // the push into the room being left
const SWITCH_AT = 0.6; // how far into the walk the next room starts to fade up
const FADE = 0.7; // the crossfade itself
const ARRIVE = 1.05; // the next room's own push, easing to a stop
const PUSH = 2.3; // how far the room being left is magnified by the end
const ARRIVE_FROM = 0.72; // the next room starts this far back from its rest

const STEPS = 3; // footfalls from first step to standing still
const BOB_PITCH = 0.012; // the head's dip on each footfall
const BOB_ROLL = 0.006; // the sway from one foot to the other

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Magnifying the picture by `m` is dividing the tangent of the half-angle by
// it — scaling the fov itself would bend the curve and read as a lurch.
const magnify = (fov, m) => 2 * Math.atan(Math.tan(fov / 2) / m);

// Marzipano's default only fades opacity linearly; easing both ends keeps the
// new room from popping in at the start or snapping on at the finish.
function crossfade(t, newScene) {
  const eased = t * t * (3 - 2 * t);
  newScene.listLayers().forEach((layer) => layer.mergeEffects({ opacity: eased }));
}

/**
 * Walks from one built scene ({ data, scene, view }) to another.
 *
 * lookYaw    — the yaw in `from` to turn to and walk along; null walks
 *              straight ahead.
 * arrivalYaw — the yaw `to` comes to rest facing; null keeps the scene's own
 *              initial view.
 * fx         — elements whose opacity rides the walk (the blur and shade).
 * onSwitch   — called the moment the next scene takes over.
 * onComplete — called once everything has come to rest.
 *
 * Returns the GSAP timeline, so it can be killed if the viewer goes away.
 */
export function walkToScene({ from, to, lookYaw, arrivalYaw, fx, onSwitch, onComplete }) {
  const fromView = from.view;
  const toView = to.view;

  const start = fromView.parameters();
  const dYaw = wrapAngle((lookYaw ?? start.yaw) - start.yaw);
  const dPitch = WALK_PITCH - start.pitch;

  // Work out where the next scene comes to rest while its limiter is still on,
  // so the rest pose is one the visitor could have reached — handing the
  // limiter back at the end then moves nothing. The size goes first: a scene
  // that's never been shown has none yet, and the resolution limit reads it.
  toView.setSize({ width: fromView.width(), height: fromView.height() });
  toView.setParameters({
    ...to.data.initialViewParameters,
    ...(arrivalYaw != null && { yaw: arrivalYaw }),
    roll: 0,
  });
  const rest = toView.parameters();

  // The push goes well past what the limiters allow — that's the whole point
  // of it — so both come off for the length of the walk.
  const fromLimiter = fromView.limiter();
  const toLimiter = toView.limiter();
  fromView.setLimiter(null);
  toView.setLimiter(null);

  const state = { turn: 0, push: 1, arrive: 0, bob: 0, step: 0 };
  let switched = false;

  const apply = () => {
    // A dip on every footfall, a sway every other one.
    const dip = (BOB_PITCH * state.bob * (1 - Math.cos(2 * Math.PI * state.step))) / 2;
    const sway = BOB_ROLL * state.bob * Math.sin(Math.PI * state.step);

    // The room being left keeps moving until it has fully faded out.
    fromView.setParameters({
      yaw: start.yaw + dYaw * state.turn,
      pitch: start.pitch + dPitch * state.turn + dip,
      roll: sway,
      fov: magnify(start.fov, state.push),
    });

    if (switched) {
      toView.setParameters({
        yaw: rest.yaw,
        pitch: rest.pitch + dip,
        roll: sway,
        fov: magnify(rest.fov, ARRIVE_FROM + (1 - ARRIVE_FROM) * state.arrive),
      });
    }
  };

  const hotspotsOut = from.scene.hotspotContainer().domElement();
  const hotspotsIn = to.scene.hotspotContainer().domElement();

  const turnSize = Math.abs(dYaw) + Math.abs(dPitch);
  const turnTime =
    turnSize < 0.02 ? 0 : gsap.utils.clamp(TURN_MIN, TURN_MAX, TURN_MIN + turnSize * TURN_PER_RAD);
  const walkAt = turnTime * WALK_START;
  const switchAt = walkAt + WALK * SWITCH_AT;
  const settleAt = switchAt + ARRIVE;
  const fxPeak = switchAt + FADE * 0.5;

  const finish = () => {
    // The next scene lands exactly on the pose its limiter already approved;
    // the old one is off screen, so its limiter can clamp it however it likes.
    toView.setParameters(rest);
    toView.setLimiter(toLimiter);
    fromView.setParameters({ roll: 0 });
    fromView.setLimiter(fromLimiter);
    onComplete?.();
  };

  return (
    gsap
      .timeline({ onUpdate: apply, onComplete: finish })
      // The markers would only spread apart at a fixed size as the view pushes
      // in — they read as stuck to the glass, so they go first.
      .to(hotspotsOut, { opacity: 0, duration: 0.25, ease: "power1.out" }, 0)
      .to(state, { turn: 1, duration: turnTime, ease: "power2.inOut" }, 0)

      // The walk. The push accelerates all the way into the crossfade, so the
      // hand-off happens at full stride rather than from a standstill.
      .to(state, { push: PUSH, duration: switchAt + FADE - walkAt, ease: "power2.in" }, walkAt)
      .to(state, { step: STEPS, duration: settleAt - walkAt, ease: "none" }, walkAt)
      .to(state, { bob: 1, duration: 0.45, ease: "power1.out" }, walkAt)
      .to(fx, { opacity: 1, duration: fxPeak - walkAt, ease: "power2.in" }, walkAt)

      .call(
        () => {
          switched = true;
          hotspotsIn.style.opacity = "0";
          apply(); // pose the next view before its first frame, not after
          to.scene.switchTo({ transitionDuration: FADE * 1000, transitionUpdate: crossfade });
          onSwitch?.();
        },
        null,
        switchAt
      )

      // Arriving: the next room keeps coming forward, slowing to a stop, and
      // the stride dies away with it.
      .to(state, { arrive: 1, duration: ARRIVE, ease: "power3.out" }, switchAt)
      .to(state, { bob: 0, duration: ARRIVE * 0.8, ease: "power2.inOut" }, switchAt + FADE * 0.3)
      .to(fx, { opacity: 0, duration: ARRIVE * 0.75, ease: "power2.out" }, fxPeak)
      .to(hotspotsIn, { opacity: 1, duration: 0.5, ease: "power1.out" }, settleAt - 0.35)
  );
}
