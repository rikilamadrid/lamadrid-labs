import type { NarrativeSignal } from "@/data/narrative";

// Maps the abstract signal tokens in narrative.ts to real colors. Kept as a
// single TS source of truth for both the Three.js specimen material and any
// DOM accent (applied via inline CSS custom property, since the color is
// genuinely per-stage/dynamic rather than a fixed design token).
export const narrativeSignalColors: Record<NarrativeSignal, string> = {
  cyan: "#3dd6b5",
  violet: "#7b5ffc",
  amber: "#f0a63d",
  rose: "#f0567d",
  teal: "#23c39f",
};
