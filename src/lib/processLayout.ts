import { clamp01, lerp } from "./math";

// World-space X position of each rig's platform center along the shared
// table (36/37's convention: 5-unit spacing, reagent first / crystallization
// last). Single source of truth for both the 3D track transform and any
// progress -> stage-index math the scroll rig needs.
export const PROCESS_STAGE_X = [-10, -5, 0, 5, 10] as const;

export interface StageBlend {
  fromIndex: number;
  toIndex: number;
  /** 0-1 fraction between fromIndex and toIndex. */
  t: number;
}

// Splits a 0-1 progress value into the two adjacent stage indices it sits
// between plus the blend fraction — shared by the orb's own color/scale
// lerp (see Orb.tsx's deriveOrbFrame) and anything else that needs to know
// which stage is "active" right now (copy overlay, track transform).
export function deriveStageBlend(progress: number, stageCount: number): StageBlend {
  const segment = clamp01(progress) * (stageCount - 1);
  const fromIndex = Math.min(Math.floor(segment), stageCount - 2);
  const toIndex = fromIndex + 1;
  const t = segment - fromIndex;
  return { fromIndex, toIndex, t };
}

// World X the rig track group must sit at so the stage nearest `progress`
// lines up under the fixed camera/orb position (world origin).
export function deriveTrackX(progress: number): number {
  return -lerp(PROCESS_STAGE_X[0], PROCESS_STAGE_X[PROCESS_STAGE_X.length - 1], clamp01(progress));
}
