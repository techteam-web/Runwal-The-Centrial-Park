"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tourData } from "@/lib/tourData";
import {
  carryYaw,
  createAutorotate,
  createScenes,
  linkYaw,
  sceneName,
} from "@/lib/marzipano-helpers";
import { walkToScene } from "@/lib/walkTransition";
import CustomHotspot from "./CustomHotspot";
import SceneSwitcher from "./SceneSwitcher";
import MiniMap from "./MiniMap";
import AutorotateToggle from "./AutorotateToggle";
import CloseButton from "./CloseButton";

const FIRST_SCENE = tourData.scenes[0].id;

export default function PanoViewer() {
  const stageRef = useRef(null);
  const viewerRef = useRef(null);
  const scenesRef = useRef(null);
  const autorotateRef = useRef(null);
  // The two overlays that ride along with a walk between scenes.
  const walkBlurRef = useRef(null);
  const walkShadeRef = useRef(null);
  // The walk in progress, if any. Doubles as the lock: a second request made
  // mid-walk is dropped rather than wrenching the view off in a new direction.
  const walkRef = useRef(null);

  const [currentId, setCurrentId] = useState(FIRST_SCENE);
  const [autorotating, setAutorotating] = useState(
    tourData.settings.autorotateEnabled
  );
  const [ready, setReady] = useState(false);
  // The viewer itself, in state as well as in a ref: the mini map's radar
  // subscribes to viewChange, and a ref alone would never tell it that the
  // viewer had finished being built.
  const [viewer, setViewer] = useState(null);
  // One wrapper <div> per hotspot of the current scene. Marzipano positions
  // these itself; we portal React into them so the hotspots stay real
  // components instead of hand-built DOM.
  const [hotspotSlots, setHotspotSlots] = useState([]);

  // Kept in refs because the Marzipano setup effect runs once and must not
  // be torn down and rebuilt every time one of these changes.
  const switchSceneRef = useRef(null);
  const autorotatingRef = useRef(autorotating);

  // ---- build the viewer, once ----
  useEffect(() => {
    let disposed = false;
    let viewer;

    // Imported here rather than at the top of the file: Marzipano reaches for
    // `window` on load, so it must not be part of the server render.
    import("marzipano").then((mod) => {
      if (disposed) return;
      const Marzipano = mod.default ?? mod;

      viewer = new Marzipano.Viewer(stageRef.current, {
        controls: { mouseViewMode: tourData.settings.mouseViewMode },
      });
      viewerRef.current = viewer;
      setViewer(viewer);

      const built = createScenes(Marzipano, viewer);
      scenesRef.current = built;
      autorotateRef.current = createAutorotate(Marzipano);

      let current = null;

      // Rebuild the hotspot layer for whatever scene we just landed on.
      // Clearing first matters on a revisit: scenes keep their hotspots, so
      // coming back to one would otherwise stack a second set on top.
      const land = (next) => {
        current = next;
        setCurrentId(next.data.id);

        const container = next.scene.hotspotContainer();
        container.listHotspots().forEach((spot) => container.destroyHotspot(spot));

        const slots = next.data.linkHotspots.map((spot) => {
          const element = document.createElement("div");
          element.className = "hotspot-wrapper";
          container.createHotspot(element, {
            yaw: spot.yaw,
            pitch: spot.pitch,
          });
          return {
            element,
            target: spot.target,
            yaw: spot.yaw,
            key: `${next.data.id}-${spot.target}-${spot.yaw}`,
          };
        });
        setHotspotSlots(slots);
      };

      // Switching is defined in here so it closes over the built scenes.
      // `lookYaw` is the doorway to walk through — a clicked hotspot passes
      // its own; the scene rail and the mini map leave it to be looked up.
      switchSceneRef.current = (id, { instant = false, lookYaw } = {}) => {
        const next = built.find((entry) => entry.data.id === id);
        if (!next || next === current || walkRef.current) return;

        const still =
          instant ||
          !current ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (still) {
          next.view.setParameters({ ...next.data.initialViewParameters, roll: 0 });
          next.scene.switchTo({ transitionDuration: instant ? 0 : 900 });
          // A walk leaves the container it walked away from faded out.
          next.scene.hotspotContainer().domElement().style.opacity = "1";
          land(next);
          return;
        }

        const from = current;
        const doorway = lookYaw ?? linkYaw(from.data.id, id);

        // Autorotate and dragging would both fight the walk for the view, so
        // they're held off until it has come to rest.
        viewer.stopMovement();
        viewer.setIdleMovement(Infinity);
        viewer.controls().disable();

        walkRef.current = walkToScene({
          from,
          to: next,
          // Through a doorway: turn to it, and arrive still facing the way you
          // walked — that's what makes it read as one continuous walk rather
          // than a cut. With no doorway between the two (a jump from the rail
          // or the plan), walk straight ahead and land on the scene's own view.
          lookYaw: doorway,
          arrivalYaw: doorway == null ? null : carryYaw(from.data.id, id, doorway),
          fx: [walkBlurRef.current, walkShadeRef.current],
          onSwitch: () => land(next),
          onComplete: () => {
            walkRef.current = null;
            viewer.controls().enable();
            if (autorotatingRef.current) {
              viewer.setIdleMovement(3000, autorotateRef.current);
            }
          },
        });
      };

      switchSceneRef.current(FIRST_SCENE, { instant: true });

      if (autorotatingRef.current) {
        viewer.startMovement(autorotateRef.current);
        viewer.setIdleMovement(3000, autorotateRef.current);
      }

      setReady(true);
    });

    return () => {
      disposed = true;
      // A walk still running would go on posing views that no longer exist.
      walkRef.current?.kill();
      walkRef.current = null;
      // Destroying the viewer tears down its canvas, its listeners and every
      // scene built on it in one go.
      viewerRef.current?.destroy();
      viewerRef.current = null;
      setViewer(null);
    };
  }, []);

  // ---- autorotate, driven by the toggle ----
  useEffect(() => {
    autorotatingRef.current = autorotating;
    const viewer = viewerRef.current;
    // Mid-walk the ref is all that changes; the walk's own finish reads it.
    if (!viewer || !autorotateRef.current || walkRef.current) return;

    if (autorotating) {
      viewer.startMovement(autorotateRef.current);
      viewer.setIdleMovement(3000, autorotateRef.current);
    } else {
      viewer.stopMovement();
      viewer.setIdleMovement(Infinity); // Infinity = never resume on its own
    }
  }, [autorotating]);

  const goToScene = (id, lookYaw) => switchSceneRef.current?.(id, { lookYaw });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-panel-deep">
      {/* Marzipano owns everything inside this node. */}
      <div ref={stageRef} className="absolute inset-0" />

      {/* Each hotspot is rendered into the wrapper Marzipano is positioning. */}
      {hotspotSlots.map((slot) =>
        createPortal(
          <CustomHotspot
            label={sceneName(slot.target)}
            onSelect={() => goToScene(slot.target, slot.yaw)}
          />,
          slot.element,
          slot.key
        )
      )}

      {/* Motion blur toward the edges and a closing vignette while walking
          between scenes. Siblings, each faded on its own: an opacity on a
          shared parent would cut the blur off from the panorama behind it. */}
      <div className="pointer-events-none absolute inset-0">
        <div ref={walkBlurRef} className="walk-blur" />
        <div ref={walkShadeRef} className="walk-shade" />
      </div>

      {/* Sits above the stage but below the controls, so the buttons and
          labels on the top and bottom edges always have something to read
          against. */}
      <div className="pano-scrim pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="pointer-events-auto rounded-full border border-gold/20 bg-panel-deep/60 px-4 py-2 backdrop-blur-md">
            <p className="font-body text-[10px] tracking-[0.3em] text-gold/60 uppercase">
              Now viewing
            </p>
            <p className="font-display text-sm text-cream capitalize">
              {sceneName(currentId)}
            </p>
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            <AutorotateToggle
              active={autorotating}
              onToggle={() => setAutorotating((on) => !on)}
            />
            <CloseButton />
          </div>
        </div>

        {/* One row along the bottom edge: the plan holds the left corner and
            the scene rail centres itself in whatever width is left. */}
        <div className="flex items-end gap-4 sm:gap-5">
          <MiniMap viewer={viewer} currentId={currentId} onSelect={goToScene} />

          <div className="min-w-0 flex-1 lg:pr-36">
            <SceneSwitcher currentId={currentId} onSelect={goToScene} />
          </div>
        </div>
      </div>

      {/* Covers the first tile fetch. Fades out rather than unmounting so it
          can't clip the fade halfway through. */}
      <div
        className={`panel-gradient pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/runwalLogo.svg" alt="" width={54} height={70} />
          <p className="font-body text-[11px] tracking-[0.3em] text-gold/60 uppercase">
            Preparing the view
          </p>
        </div>
      </div>
    </div>
  );
}
