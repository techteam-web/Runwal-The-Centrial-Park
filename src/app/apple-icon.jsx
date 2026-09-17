import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

// iOS ignores SVG favicons when a page is saved to the home screen, so the
// mark is rendered out to a PNG at the size Apple asks for.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const mark = fs.readFileSync(
  path.join(process.cwd(), "src", "app", "icon.svg")
);
const markSrc = `data:image/svg+xml;base64,${mark.toString("base64")}`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0704",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markSrc} width={180} height={180} alt="" />
      </div>
    ),
    size
  );
}
