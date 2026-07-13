"use client";

import { useSyncExternalStore } from "react";

// Matches Tailwind's `lg` breakpoint (1024px) — the same split
// NarrativeStage used for its prior copy/visual layout switch. Server and
// initial-client snapshot default to `false` (mobile) so the heavy desktop
// pin/canvas never mounts before hydration confirms a wide viewport.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsDesktopViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
