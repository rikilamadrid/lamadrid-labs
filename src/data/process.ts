import type { ServiceId } from "./services";

export type ProcessStageId =
  | "reagent-selection"
  | "measurement"
  | "synthesis"
  | "purification"
  | "crystallization";

// Abstract tokens shared with narrativeSignals.ts's color map (same 5 values) —
// no hex values committed here, this feature is content-only.
export type ProcessSignal = "cyan" | "violet" | "amber" | "rose" | "teal";

// Relative/unitless orb parameters for 35 to translate into real Three.js
// scale/material/morph values — deliberately abstract so this data never
// needs to change when the visual tuning does.
export interface OrbState {
  scale: number;
  glow: number;
  geometryMorph: number; // 0 = condensed seed, 1 = crystallized final form
  motionIntensity: number; // 0 = still, 1 = most reactive/dynamic
}

// Non-translated, structural HUD data for the holographic readout panel (47).
// Translated labels/values live in the dict under process.stages[id].hud —
// this only carries the illustrative sparkline waveform, deliberately a fixed
// per-stage shape (calm at intake/crystallization, spiky at synthesis), never
// real or live data.
export interface StageHud {
  // Illustrative sparkline samples in [0, 1], rendered as a small SVG readout.
  sparkline: number[];
}

export interface ProcessStage {
  id: ProcessStageId;
  index: number;
  signal: ProcessSignal;
  serviceIds: ServiceId[];
  orbState: OrbState;
  hud: StageHud;
}

// Translated title/stageLine/serviceLine live in src/data/i18n/*.ts under process.stages[id].
export const processStages: ProcessStage[] = [
  {
    id: "reagent-selection",
    index: 0,
    signal: "cyan",
    serviceIds: ["freelance-technical-partner", "product-engineering"],
    orbState: { scale: 1, glow: 0.3, geometryMorph: 0, motionIntensity: 0.15 },
    hud: { sparkline: [0.4, 0.5, 0.45, 0.55, 0.5, 0.52, 0.48, 0.5] },
  },
  {
    id: "measurement",
    index: 1,
    signal: "violet",
    serviceIds: ["frontend-architecture", "product-engineering"],
    orbState: { scale: 1.3, glow: 0.5, geometryMorph: 0.25, motionIntensity: 0.35 },
    hud: { sparkline: [0.3, 0.4, 0.35, 0.5, 0.45, 0.6, 0.55, 0.65] },
  },
  {
    id: "synthesis",
    index: 2,
    signal: "amber",
    serviceIds: [
      "product-engineering",
      "design-engineering",
      "ai-workflow-engineering",
    ],
    orbState: { scale: 1.7, glow: 0.75, geometryMorph: 0.5, motionIntensity: 1 },
    hud: { sparkline: [0.3, 0.7, 0.4, 0.85, 0.5, 0.9, 0.45, 0.8] },
  },
  {
    id: "purification",
    index: 3,
    signal: "rose",
    serviceIds: ["frontend-architecture", "design-engineering"],
    orbState: { scale: 1.9, glow: 0.65, geometryMorph: 0.75, motionIntensity: 0.4 },
    hud: { sparkline: [0.7, 0.55, 0.6, 0.45, 0.5, 0.4, 0.42, 0.38] },
  },
  {
    id: "crystallization",
    index: 4,
    signal: "teal",
    serviceIds: ["product-engineering", "freelance-technical-partner"],
    orbState: { scale: 2.4, glow: 0.9, geometryMorph: 1, motionIntensity: 0.1 },
    hud: { sparkline: [0.5, 0.52, 0.5, 0.51, 0.5, 0.5, 0.51, 0.5] },
  },
];
