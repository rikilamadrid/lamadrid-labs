import type { ProcessSignal } from "@/data/process";

// The canonical monochrome cyan/teal + white palette for the premium Process
// scene (feature 45). The approved reference renders
// (context/screenshots/narrative-images-example/) are disciplined single-hue:
// bright cyan glow, near-white cores, deep teal shells — never the 5 saturated
// hues the section shipped with. This module is the single source of truth for
// every color the 3D scene touches; no component hand-rolls hex.

/** Near-white cyan — the hot glowing core of the orb and every emissive vessel. */
export const PROCESS_CORE_WHITE = "#dff6ff";
/** Dark reflective bench surface under the rig track (the reference's tabletop). */
export const PROCESS_BENCH_COLOR = "#080b0f";
/** Brushed-metal machine bodies (stirrer bases, platforms, legs). */
export const PROCESS_METAL_COLOR = "#161c22";
/** Subtle cyan tint carried by transmission glass so vessels read cool, not clear. */
export const PROCESS_GLASS_TINT = "#bfeefb";

/** Generated studio-environment light colors (no HDRI fetch — static-export safe). */
export const PROCESS_ENV_KEY = "#9fe4ff";
export const PROCESS_ENV_RIM = "#1c2630";

// Scene background, mirroring the `--lab-bg` tokens in globals.css so the
// composited scene stays theme-aware (the desktop EffectComposer would
// otherwise force opaque black). Kept in sync with globals.css by hand — these
// are the only two values that token takes. Light-mode tuning is feature 56;
// this just keeps light mode from hard-breaking to a black rectangle.
export const PROCESS_BG_DARK = "#060b14";
export const PROCESS_BG_LIGHT = "#eef2f7";

// Per-stage `signal` tokens (process.ts) reconciled into subtle accent shifts
// *within* the cyan/teal family rather than 5 competing hues — Synthesis reads
// the hottest/whitest (strongest reaction), Crystallization the deepest teal
// (the calm resting point), the rest close cyan neighbours between them. Kept
// as a Record so existing per-stage consumers (rigs, orb, table, copy accent)
// need no call-site changes — only the values shift.
export const narrativeSignalColors: Record<ProcessSignal, string> = {
  cyan: "#40c9e8", // Reagent Selection — base cyan
  violet: "#57bdf0", // Measurement — a touch bluer
  amber: "#63e6ff", // Synthesis — brightest, hottest reaction
  rose: "#3ed6e2", // Purification — cyan-teal
  teal: "#22c4b8", // Crystallization — deepest teal, the settling point
};
