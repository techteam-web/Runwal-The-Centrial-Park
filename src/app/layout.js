import localFont from "next/font/local";
import { TransitionProvider } from "@/app/components/transition/TransitionProvider";
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

export const metadata = {
  title: "Runwal The Central Park | Virtual Tour",
  description:
    "Step inside every room of Runwal The Central Park with an interactive 360° walkthrough.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={gambetta.variable}>
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}