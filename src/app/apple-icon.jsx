import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

// iOS ignores SVG favicons when a page is saved to the home screen, so the
// mark is rendered out to a PNG at the size Apple asks for.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Read inside the component rather than at module scope — the bundler can't
// see that this file depends on icon.svg, so a cached module would keep
// serving whatever the icon looked like the first time it was compiled.
function markDataUri() {
  const mark = fs.readFileSync(
    path.join(process.cwd(), "src", "app", "icon.svg")
  );
  return `data:image/svg+xml;base64,${mark.toString("base64")}`;
}

export default function AppleIcon() {
  const markSrc = markDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06382f",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markSrc} width={180} height={180} alt="" />
      </div>
    ),
    size
  );
}
