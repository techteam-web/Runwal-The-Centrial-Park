"use client";

import { useEffect } from "react";

// Suppresses the right-click menu across the site. On Android the same event
// fires on long-press, so this covers that too; iOS's own callout menu is not
// an event and is turned off with -webkit-touch-callout in globals.css.
//
// Worth being clear-eyed about: this is friction, not protection. Anything on
// the page is still reachable through devtools, view-source or the network
// tab, so it discourages casual copying rather than preventing it.
export default function NoContextMenu() {
  useEffect(() => {
    const block = (event) => event.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  return null;
}
