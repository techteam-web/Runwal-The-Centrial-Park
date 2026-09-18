import localFont from "next/font/local";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import NoContextMenu from "@/components/site/NoContextMenu";
import Watermark from "@/components/site/Watermark";
import "./globals.css";

// Gambetta's files live right next to this file, in src/app/fonts/.
// next/font/local resolves "src" relative to whichever file calls it —
// NOT the public folder, which is what the old @font-face approach used.
// TODO: only a Medium weight has been delivered so far — swap in
// Gambetta-Regular.woff2 / Gambetta-Bold.woff2 once they're available.
const gambetta = localFont({
  src: [
    { path: "./fonts/Gambetta-Medium.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-gambetta", // this name is what globals.css reads from below
  display: "swap",             // show a fallback font instantly, swap to Gambetta once it's loaded
});

const SITE_NAME = "Runwal The Central Park";
const TITLE = "Runwal The Central Park | 360° Virtual Tour";
const DESCRIPTION =
  "Walk through Runwal The Central Park in full 360°. Explore all 17 spaces — living, bedrooms, kitchen and balconies — room by room, exactly as you would on a site visit.";

// Open Graph and Twitter images have to be absolute URLs, so the crawlers on
// WhatsApp, Slack, X and the rest can fetch them. metadataBase is what Next
// resolves the relative paths below against; set NEXT_PUBLIC_SITE_URL to the
// real domain at deploy time or link previews will point at localhost.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Runwal The Central Park",
    "360 virtual tour",
    "panoramic walkthrough",
    "Mumbai real estate",
    "show flat tour",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// themeColor belongs on the viewport export, not metadata — it's been
// deprecated there since Next 14. This pins the colour the browser paints
// around the page on mobile so it matches the panel instead of flashing white.
export const viewport = {
  themeColor: "#0a0704",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={gambetta.variable}>
        <NoContextMenu />
        <TransitionProvider>{children}</TransitionProvider>
        <Watermark />
      </body>
    </html>
  );
}