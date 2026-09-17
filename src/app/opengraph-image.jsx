import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Runwal The Central Park — 360° Virtual Tour";

// Read off disk at build time and inlined as a data URI. Satori (what
// ImageResponse renders with) won't fetch a relative path the way a browser
// would — it needs the bytes.
//
// Read inside the component, not at module scope: the bundler has no idea
// this file depends on icon.svg, so a module-level read gets baked into the
// cached module and editing the icon leaves a stale mark in the card.
function markDataUri() {
  const mark = fs.readFileSync(
    path.join(process.cwd(), "src", "app", "icon.svg")
  );
  return `data:image/svg+xml;base64,${mark.toString("base64")}`;
}

export default function Image() {
  const markSrc = markDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0c5e52 0%, #0a4b41 45%, #06382f 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={104} height={104} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 70, height: 2, background: "#6ee7a8" }} />
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 74,
              lineHeight: 1.1,
              color: "#fdf6e6",
              letterSpacing: -1,
            }}
          >
            Runwal The Central Park
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              color: "#f7e2b8",
              opacity: 0.75,
            }}
          >
            Step inside all 17 spaces in full 360°.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 21,
            letterSpacing: 6,
            color: "#6ee7a8",
          }}
        >
          INTERACTIVE 360° WALKTHROUGH
        </div>
      </div>
    ),
    size
  );
}
