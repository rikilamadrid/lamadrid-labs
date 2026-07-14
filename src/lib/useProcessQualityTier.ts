"use client";

import { useSyncExternalStore } from "react";

// Shared quality-tier system for the premium Process scene (feature 45).
// Mobile-first: the *mobile* tier is the baseline both the desktop scene and
// MobileProcessScene consume, with the desktop tier only turning knobs up. The
// same `lg` (1024px) split the rest of the Process section already uses
// (useIsDesktopViewport) decides which tier applies; server/initial snapshot
// defaults to mobile so the heavier desktop setup never mounts before
// hydration confirms a wide viewport. Feature 58 will finalize these numbers —
// this is the tuning surface it turns.

const DESKTOP_QUERY = "(min-width: 1024px)";

export type ProcessQualityLevel = "mobile" | "desktop";

export interface ProcessQualityTier {
  level: ProcessQualityLevel;
  /** Canvas device-pixel-ratio clamp. */
  dpr: [number, number];
  /** Restrained bloom (never blown-out). `null` when the renderer can't run a
   *  composer for this tier (mobile shares one canvas across drei Views, which
   *  is incompatible with a full-frame EffectComposer — mobile glow comes from
   *  emissive materials instead). */
  bloom: {
    intensity: number;
    luminanceThreshold: number;
    luminanceSmoothing: number;
    mipmapBlur: boolean;
    resolutionScale: number;
  } | null;
  /** Transmission glass cost. `null` swaps real refraction for a cheap
   *  physical-material glass approximation (mobile). */
  transmission: {
    samples: number;
    resolution: number;
  } | null;
  /** Reflective bench render-target resolution. */
  reflectorResolution: number;
  /** Generated studio-environment cube resolution. */
  environmentResolution: number;
}

const MOBILE_TIER: ProcessQualityTier = {
  level: "mobile",
  dpr: [1, 2],
  bloom: null,
  transmission: null,
  reflectorResolution: 256,
  environmentResolution: 64,
};

const DESKTOP_TIER: ProcessQualityTier = {
  level: "desktop",
  dpr: [1, 2],
  bloom: {
    intensity: 0.85,
    luminanceThreshold: 0.62,
    luminanceSmoothing: 0.28,
    mipmapBlur: true,
    resolutionScale: 0.5,
  },
  transmission: {
    samples: 6,
    resolution: 512,
  },
  reflectorResolution: 512,
  environmentResolution: 128,
};

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSnapshot(): ProcessQualityTier {
  return window.matchMedia(DESKTOP_QUERY).matches ? DESKTOP_TIER : MOBILE_TIER;
}

function getServerSnapshot(): ProcessQualityTier {
  return MOBILE_TIER;
}

export function useProcessQualityTier(): ProcessQualityTier {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
