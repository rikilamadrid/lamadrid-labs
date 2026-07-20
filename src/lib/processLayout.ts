import { clamp01, lerp } from "./math";

// World-space X position of each rig's platform center along the shared
// table (36/37's convention: 5-unit spacing, reagent first / crystallization
// last). Single source of truth for both the 3D track transform and any
// progress -> stage-index math the scroll rig needs.
export const PROCESS_STAGE_X = [-10, -5, 0, 5, 10] as const;

export interface StageBlend {
  fromIndex: number;
  toIndex: number;
  /** 0-1 fraction between fromIndex and toIndex, after dwell easing. */
  t: number;
  /** Same fraction before dwell easing — feeds motion-energy/trail phase. */
  rawT: number;
}

// Fraction of a stage-to-stage segment spent "settled" at each end (orb
// legible inside the vessel) before/after the transit sweep in the middle.
// Tuned so each stage gets real dwell time per the brief ("always legible,
// never a drift-past") while the transit between stages stays a distinct,
// readable beat rather than smearing across the whole segment.
export const STAGE_DWELL_FRACTION = 0.35;

// Piecewise ease: flat at both ends of a segment (dwell) with a smoothstep
// sweep through the middle (transit) — most of a segment's raw scroll keeps
// the current/next stage settled, only the transit fraction actually moves
// the track/orb blend.
function dwellEase(t: number, dwellFraction: number): number {
  if (t <= dwellFraction) return 0;
  if (t >= 1 - dwellFraction) return 1;
  const local = (t - dwellFraction) / (1 - 2 * dwellFraction);
  return local * local * (3 - 2 * local);
}

// Splits a 0-1 progress value into the two adjacent stage indices it sits
// between plus the (dwell-eased) blend fraction — shared by the orb's own
// color/scale lerp (see Orb.tsx's deriveOrbFrame), the track transform, and
// the HUD/copy crossfade, so all three switch stages at exactly the same
// point instead of drifting relative to each other.
export function deriveStageBlend(progress: number, stageCount: number): StageBlend {
  const segment = clamp01(progress) * (stageCount - 1);
  const fromIndex = Math.min(Math.floor(segment), stageCount - 2);
  const toIndex = fromIndex + 1;
  const rawT = segment - fromIndex;
  return { fromIndex, toIndex, t: dwellEase(rawT, STAGE_DWELL_FRACTION), rawT };
}

// 0 while a stage is settled (dwell), rising to 1 at the midpoint of the
// transit sweep and back to 0 as the next stage settles. Drives the orb's
// shared light-trail visibility so it only appears while actually travelling
// between chambers, never while parked inside one.
export function deriveMotionEnergy(
  rawT: number,
  dwellFraction: number = STAGE_DWELL_FRACTION,
): number {
  if (rawT <= dwellFraction || rawT >= 1 - dwellFraction) return 0;
  const local = (rawT - dwellFraction) / (1 - 2 * dwellFraction);
  return Math.sin(local * Math.PI);
}

// -1 at the start of the transit window (just left the previous stage's
// dwell), 0 mid-transit, +1 at the end (about to settle into the next
// stage's dwell); 0 during dwell itself. Lets the trail read as trailing
// light on departure and a forward glow on approach, rather than a
// symmetric blur.
export function deriveTransitPhase(
  rawT: number,
  dwellFraction: number = STAGE_DWELL_FRACTION,
): number {
  if (rawT <= dwellFraction || rawT >= 1 - dwellFraction) return 0;
  const local = (rawT - dwellFraction) / (1 - 2 * dwellFraction);
  return (local - 0.5) * 2;
}

// World X the rig track group must sit at so the stage nearest `progress`
// lines up under the fixed camera/orb position (world origin).
export function deriveTrackX(progress: number): number {
  const { fromIndex, toIndex, t } = deriveStageBlend(progress, PROCESS_STAGE_X.length);
  return -lerp(PROCESS_STAGE_X[fromIndex], PROCESS_STAGE_X[toIndex], t);
}
