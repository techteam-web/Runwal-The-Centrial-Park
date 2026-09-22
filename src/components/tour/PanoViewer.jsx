"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createAutorotate, createScenes, sceneName } from "@/lib/marzipano-helpers";
import { zoomToScene } from "@/lib/zoomTransition";
import CustomHotspot from "./CustomHotspot";
import SceneSwitcher from "./SceneSwitcher";
import MiniMap from "./MiniMap";
import AutorotateToggle from "./AutorotateToggle";
import CloseButton from "./CloseButton";

// `tour` is one entry from lib/tours.js. The page keys this component by the
// tour's slug, so a tour never changes under a viewer that's already built.
export default function PanoViewer({ tour }) {
  const stageRef = useRef(null);
  const viewerRef = useRef(null);
  const scenesRef = useRef(null);
  const autorotateRef = useRef(null);
  // The frozen frame of the room being left, zoomed during a scene change.
  const zoomCanvasRef = useRef(null);
  // The zoom in progress, if any. Doubles as the lock: a second request made
  // mid-zoom is dropped rather than cutting the first one off halfway.
  const zoomRef = useRef(null);

  const [currentId, setCurrentId] = useState(tour.data.scenes[0].id);
  const [autorotating, setAutorotating] = useState(
    tour.data.settings.autorotateEnabled
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
        controls: { mouseViewMode: tour.data.settings.mouseViewMode },
      });
      viewerRef.current = viewer;
      setViewer(viewer);

      const built = createScenes(Marzipano, viewer, tour);
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
            focus: { yaw: spot.yaw, pitch: spot.pitch },
            key: `${next.data.id}-${spot.target}-${spot.yaw}`,
          };
        });
        setHotspotSlots(slots);
      };

      // Switching is defined in here so it closes over the built scenes.
      // `focus` is the { yaw, pitch } to zoom into — a clicked hotspot passes
      // its own; the scene rail and the mini map zoom into the middle.
      switchSceneRef.current = (id, { instant = false, focus } = {}) => {
        const next = built.find((entry) => entry.data.id === id);
        if (!next || next === current || zoomRef.current) return;

        const still =
          instant ||
          !current ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (still) {
          next.view.setParameters(next.data.initialViewParameters);
          next.scene.switchTo({ transitionDuration: instant ? 0 : 900 });
          // A zoom leaves the container it zoomed away from faded out.
          next.scene.hotspotContainer().domElement().style.opacity = "1";
          land(next);
          return;
        }

        // Autorotate and dragging would both pull the view out from under
        // the zoom, so they're held off until it has come to rest.
        viewer.stopMovement();
        viewer.setIdleMovement(Infinity);
        viewer.controls().disable();

        zoomRef.current = zoomToScene({
          viewer,
          overlay: zoomCanvasRef.current,
          from: current,
          to: next,
          focus,
          onSwitch: () => land(next),
          onComplete: () => {
            zoomRef.current = null;
            viewer.controls().enable();
            if (autorotatingRef.current) {
              viewer.setIdleMovement(3000, autorotateRef.current);
            }
          },
        });
      };

      switchSceneRef.current(tour.data.scenes[0].id, { instant: true });

      if (autorotatingRef.current) {
        viewer.startMovement(autorotateRef.current);
        viewer.setIdleMovement(3000, autorotateRef.current);
      }

      setReady(true);
    });

    return () => {
      disposed = true;
      // A zoom still running would go on posing views that no longer exist.
      zoomRef.current?.kill();
      zoomRef.current = null;
      // Destroying the viewer tears down its canvas, its listeners and every
      // scene built on it in one go.
      viewerRef.current?.destroy();
      viewerRef.current = null;
      setViewer(null);
    };
  }, [tour]);

  // ---- autorotate, driven by the toggle ----
  useEffect(() => {
    autorotatingRef.current = autorotating;
    const viewer = viewerRef.current;
    // Mid-zoom the ref is all that changes; the zoom's own finish reads it.
    if (!viewer || !autorotateRef.current || zoomRef.current) return;

    if (autorotating) {
      viewer.startMovement(autorotateRef.current);
      viewer.setIdleMovement(3000, autorotateRef.current);
    } else {
      viewer.stopMovement();
      viewer.setIdleMovement(Infinity); // Infinity = never resume on its own
    }
  }, [autorotating]);

  const goToScene = (id, focus) => switchSceneRef.current?.(id, { focus });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-panel-deep">
      {/* Marzipano owns everything inside this node. `data-cursor` gives the
          custom cursor its drag arrows over the panorama. */}
      <div ref={stageRef} data-cursor="drag" className="absolute inset-0" />

      {/* Over the stage and its hotspots, under the controls. Opacity is set
          inline rather than with a class so GSAP's writes simply replace it. */}
      <canvas
        ref={zoomCanvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      />

      {/* Each hotspot is rendered into the wrapper Marzipano is positioning. */}
      {hotspotSlots.map((slot) =>
        createPortal(
          <CustomHotspot
            label={sceneName(tour, slot.target)}
            onSelect={() => goToScene(slot.target, slot.focus)}
          />,
          slot.element,
          slot.key
        )
      )}

      {/* Sits above the stage but below the controls, so the buttons and
          labels on the top and bottom edges always have something to read
          against. */}
      <div className="pano-scrim pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="pointer-events-auto rounded-full border border-gold/20 bg-panel-deep/60 px-4 py-2 backdrop-blur-md">
            <p className="font-body text-[10px] tracking-[0.3em] text-gold/60 uppercase">
              {tour.label} · Now viewing
            </p>
            <p className="font-display text-sm text-cream capitalize">
              {sceneName(tour, currentId)}
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
          <MiniMap
            tour={tour}
            viewer={viewer}
            currentId={currentId}
            onSelect={goToScene}
          />

          <div className="min-w-0 flex-1 lg:pr-36">
            <SceneSwitcher tour={tour} currentId={currentId} onSelect={goToScene} />
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
