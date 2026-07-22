import type { SpecimenTreatmentKind } from "@/lib/specimenMotion";
import type { ProcessStageId } from "./process";

// Feature: specimen motion system rebuild. `process.ts`'s `orbState` stays
// the content model (scale/glow/geometryMorph/motionIntensity feeding the
// old geometry-morphing orb + HUD authoring history) — this is a separate,
// smaller data file scoped to how the *tiny particle* specimen actually
// behaves, per Ricardo's brief: a living firefly/droplet of light, not a
// large morphing crystal. Color still resolves through narrativeSignals.ts's
// single source of truth (per-stage `signal` -> hex) — this file never
// hand-rolls a color, only motion/character knobs.

export type SpecimenTrailLength = "minimal" | "short" | "medium" | "long";

export interface SpecimenState {
  id: ProcessStageId;
  /** Overall particle scale multiplier off the tiny shared baseline. Kept in
   *  a narrow band (never "giant orb") — see SPECIMEN_BASE_SCALE. */
  scale: number;
  /** 0-1 core/glow brightness. */
  glow: number;
  /** Qualitative comet-trail length, translated to world units by
   *  `trailLengthUnits` — only actually visible while in transit
   *  (motionEnergy > 0), per the "trail during travel, not at rest" brief. */
  trailLength: SpecimenTrailLength;
  /** 0-1 idle instability — feeds the layered-noise drift amplitude, so
   *  "unstable" stages (Reagent Selection, Synthesis) wander more than calm
   *  ones (Purification, Crystallization). */
  noise: number;
  /** 0-1 warms the glow halo from cool cyan toward white-hot; the point core
   *  itself always stays white — this only shifts the halo around it. */
  heat: number;
  /** How many of the always-on orbiting sparks are visible (max 3). */
  sparkCount: number;
  /** What this stage's equipment visibly *does* to the specimen while it
   *  holds it — see sampleTreatment. This is the "the tools change the orb"
   *  beat from the brief: each chamber grips, shakes, indexes, calms or locks
   *  the specimen differently, so an arrival reads as being processed rather
   *  than as a lerp between two appearances. */
  treatment: SpecimenTreatmentKind;
  /** 0-1 scale of the one-shot squash/flare fired the instant the specimen
   *  settles into this chamber — how hard this tool "grabs" it. */
  reaction: number;
}

export const SPECIMEN_STATE_ORDER: ProcessStageId[] = [
  "reagent-selection",
  "measurement",
  "synthesis",
  "purification",
  "crystallization",
];

// Per-stage character, matching the brief's stage-by-stage direction:
// Reagent (raw, slightly unstable seed) -> Measurement (calmer, controlled)
// -> Synthesis (energetic peak) -> Purification (refined, fewer sparks) ->
// Crystallization (stable, smallest idle shimmer only).
export const specimenStates: Record<ProcessStageId, SpecimenState> = {
  "reagent-selection": {
    id: "reagent-selection",
    scale: 0.78,
    glow: 0.35,
    trailLength: "short",
    noise: 0.6,
    heat: 0.05,
    sparkCount: 1,
    treatment: "infuse",
    reaction: 0.55,
  },
  measurement: {
    id: "measurement",
    scale: 0.95,
    glow: 0.48,
    trailLength: "medium",
    noise: 0.28,
    heat: 0.15,
    sparkCount: 2,
    treatment: "scan",
    reaction: 0.85,
  },
  synthesis: {
    id: "synthesis",
    scale: 1.32,
    glow: 0.85,
    trailLength: "long",
    noise: 0.85,
    heat: 0.9,
    sparkCount: 3,
    treatment: "agitate",
    reaction: 1.0,
  },
  purification: {
    id: "purification",
    scale: 1.02,
    glow: 0.58,
    trailLength: "short",
    noise: 0.14,
    heat: 0.25,
    sparkCount: 2,
    treatment: "settle",
    reaction: 0.7,
  },
  crystallization: {
    id: "crystallization",
    scale: 1.08,
    glow: 0.72,
    trailLength: "minimal",
    noise: 0.06,
    heat: 0.55,
    sparkCount: 3,
    treatment: "lock",
    reaction: 0.9,
  },
};

export function specimenStateAt(index: number): SpecimenState {
  return specimenStates[SPECIMEN_STATE_ORDER[index]];
}

const TRAIL_LENGTH_UNITS: Record<SpecimenTrailLength, number> = {
  minimal: 0.1,
  short: 0.2,
  medium: 0.32,
  long: 0.48,
};

export function trailLengthUnits(length: SpecimenTrailLength): number {
  return TRAIL_LENGTH_UNITS[length];
}
