"use client";

import { useEffect, useRef } from "react";
import { minimapData } from "@/lib/minimapData";
import { sceneName } from "@/lib/marzipano-helpers";

// The radar is drawn in its own -50..50 box so the cone can be described in
// round numbers; the <svg> is then sized in px by the stylesheet.
const CONE_RADIUS = 46;
const RAD_TO_DEG = 180 / Math.PI;

// Bottom-left floor plan. Every scene is a marker, the current one carries a
// cone that tracks the visitor's yaw, pitch and field of view, and hovering
// the whole thing scales it up so the markers are big enough to hit.
//
// The frame is laid out at its *hovered* size and scaled down to rest rather
// than the other way round: the browser rasterises the plan once, at the
// larger size, so zooming in doesn't hand back a blurry upscale of a 260px
// bitmap.
export default function MiniMap({ viewer, currentId, onSelect }) {
  const coneRef = useRef(null);
  const fillRef = useRef(null);

  const active = minimapData.points.find((point) => point.id === currentId);

  // ---- keep the cone pointing wherever the visitor is looking ----
  useEffect(() => {
    const cone = coneRef.current;
    const fill = fillRef.current;
    if (!viewer || !cone || !fill || !active) return;

    const { north } = active;
    let queued = 0;

    const draw = () => {
      queued = 0;
      const view = viewer.view();
      if (!view) return;

      // The cone's spread is the actual field of view, so it widens as the
      // visitor zooms out and narrows as they zoom in.
      //
      // Marzipano's fov() is the *vertical* angle; what a cone drawn on a
      // floor plan covers is the horizontal one, which on a wide viewport is
      // a good deal wider. Same conversion Marzipano's own hfov limiter uses.
      const width = view.width();
      const height = view.height();
      const hfov =
        height > 0
          ? 2 * Math.atan((width / height) * Math.tan(view.fov() / 2))
          : view.fov();
      const half = hfov / 2;
      const x = (Math.sin(half) * CONE_RADIUS).toFixed(2);
      const y = (-Math.cos(half) * CONE_RADIUS).toFixed(2);
      const large = half > Math.PI / 2 ? 1 : 0;

      fill.setAttribute(
        "d",
        `M0 0 L${-x} ${y} A${CONE_RADIUS} ${CONE_RADIUS} 0 ${large} 1 ${x} ${y} Z`,
      );

      // Looking up or down foreshortens how much floor the view actually
      // covers, so the cone pulls back toward the marker instead of staying
      // stretched out across the plan.
      const tilt = Math.max(Math.cos(view.pitch()), 0.42);

      cone.setAttribute(
        "transform",
        `rotate(${(north + view.yaw() * RAD_TO_DEG).toFixed(1)}) scale(${tilt.toFixed(3)})`,
      );
      cone.setAttribute("opacity", (0.4 + 0.6 * tilt).toFixed(3));
    };

    // viewChange can fire several times inside one frame — during a scene
    // transition it fires per tween step — so the work is coalesced.
    const onViewChange = () => {
      if (!queued) queued = requestAnimationFrame(draw);
    };

    viewer.addEventListener("viewChange", onViewChange);
    draw();

    return () => {
      viewer.removeEventListener("viewChange", onViewChange);
      if (queued) cancelAnimationFrame(queued);
    };
  }, [viewer, active]);

  return (
    <div
      className="minimap pointer-events-auto hidden md:block"
      style={{ "--mm-aspect": minimapData.aspect }}
    >
      <div className="minimap-frame">
        <div className="minimap-viewport">
          <div className="minimap-plane" style={minimapData.plane}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={minimapData.image}
              alt=""
              width={1491}
              height={1055}
              draggable={false}
              className="minimap-plan"
            />

            {/* Under the markers, so the active dot always reads on top of it. */}
            {active ? (
              <svg
                viewBox="-50 -50 100 100"
                className="minimap-radar"
                style={{ left: `${active.x}%`, top: `${active.y}%` }}
                aria-hidden="true"
              >
                <defs>
                  {/* userSpaceOnUse, so the fade starts at the cone's apex
                      rather than at the centre of its bounding box. */}
                  <radialGradient
                    id="minimap-cone"
                    gradientUnits="userSpaceOnUse"
                    cx="0"
                    cy="0"
                    r={CONE_RADIUS}
                  >
                    <stop offset="0%" stopColor="#aa8a4b" stopOpacity="0.8" />
                    <stop offset="36%" stopColor="#c9a867" stopOpacity="0.5" />
                    <stop
                      offset="100%"
                      stopColor="#c9a867"
                      stopOpacity="0.04"
                    />
                  </radialGradient>
                </defs>

                <g ref={coneRef}>
                  <path
                    ref={fillRef}
                    fill="url(#minimap-cone)"
                    stroke="#aa8a4b"
                    strokeOpacity="0.85"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            ) : null}

            <div className="minimap-points">
              {minimapData.points.map((point) => {
                const isActive = point.id === currentId;
                const label = sceneName(point.id);
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => onSelect(point.id)}
                    aria-label={`Go to ${label}`}
                    aria-current={isActive ? "true" : undefined}
                    data-active={isActive}
                    className="minimap-point"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  >
                    <span className="minimap-dot" />
                    <span
                      className="minimap-tip"
                      data-below={point.tipBelow}
                      data-align={point.tipAlign}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="minimap-caption">
          <span className="minimap-caption-label">
            <span className="minimap-caption-dot" />
            {minimapData.title}
          </span>
        </p>
      </div>
    </div>
  );
}
