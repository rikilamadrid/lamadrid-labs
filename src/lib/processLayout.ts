import { clamp01, lerp } from "./math";

// World-space X position of each rig's platform center along the shared
// table (36/37's convention: 5-unit spacing, reagent first / crystallization
// last). Single source of truth for both the 3D track transform and any
// progress -> stage-index math the scroll rig needs.
export const PROCESS_STAGE_X = [-10, -5, 0, 5, 10] as const;

// World-space X offset (from a rig's own centre) of its entry/exit gate —
// the pillar-and-arch marker every rig places at x=±RIG_GATE_X (see
// rigPrimitives.tsx's RigGate). Shared here rather than re-inlined per rig so
// specimenPath.ts's gate-routed transit arc (below) can derive exactly where
// each gate physically sits without duplicating the number.
export const RIG_GATE_X = 1.7;

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
export const STAGE_DWELL_FRACTION = 0.24;

// How much of a segment's blend still advances *during* dwell. A dwell that
// clamps hard to 0/1 means the majority of the page's scroll distance moves
// absolutely nothing on screen — you scroll and the scene is frozen, which
// reads as friction/stickiness rather than as a deliberate pause. Letting the
// track keep creeping slowly through the dwell means every scroll input always
// produces visible movement (the equipment drifts past the specimen even while
// it's parked), while the transit sweep still carries the overwhelming
// majority of the travel and stays the readable beat.
// Exported so specimenPath.ts can numerically invert this same easing to
// find exactly when a transit's track slide carries a rig's gate past the
// specimen's fixed world position (see GATE_LO/GATE_HI there) — the transit
// arc and the track slide must agree on timing or "passing through the gate"
// would be authored blind.
export const DWELL_CREEP = 0.07;

// Piecewise ease: a slow creep at both ends of a segment (dwell) with a
// smoothstep sweep through the middle (transit). Continuous at both dwell
// boundaries, and strictly increasing everywhere, so no scroll input is ever
// a dead zone.
function dwellEase(t: number, dwellFraction: number): number {
  if (t <= dwellFraction) {
    return (t / dwellFraction) * DWELL_CREEP;
  }
  if (t >= 1 - dwellFraction) {
    const local = (t - (1 - dwellFraction)) / dwellFraction;
    return 1 - DWELL_CREEP + local * DWELL_CREEP;
  }
  const local = (t - dwellFraction) / (1 - 2 * dwellFraction);
  return DWELL_CREEP + local * local * (3 - 2 * local) * (1 - 2 * DWELL_CREEP);
}

// Splits a 0-1 progress value into the two adjacent stage indices it sits
// between plus the (dwell-eased) blend fraction — shared by the specimen's
// own color/scale lerp (see Specimen.tsx's deriveSpecimenFrame), the track
// transform, and the HUD/copy crossfade, so all three switch stages at
// exactly the same point instead of drifting relative to each other.
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

// ─── Chamber occupancy: what the tool is doing to the specimen ─────────────
// The three helpers above describe *travelling* between chambers. These three
// describe being inside one, which is where the brief's "the tools visibly
// change the specimen" beat has to live: the specimen arrives, the equipment
// reacts to it, and it leaves altered.

// Age of the most recent arrival: 0 at the exact instant the specimen settles
// into the next chamber, rising to 1 by the end of that dwell, and 1 ("long
// since finished") everywhere else. Drives the one-shot reaction — the squash
// rebound and glow flare that make an arrival read as the equipment *acting*
// on the specimen rather than the specimen merely coasting to a stop.
export function deriveArrivalAge(
  rawT: number,
  dwellFraction: number = STAGE_DWELL_FRACTION,
): number {
  const settleStart = 1 - dwellFraction;
  if (rawT < settleStart) return 1;
  return clamp01((rawT - settleStart) / dwellFraction);
}

// 1 while parked inside a chamber, 0 at the height of a transit — the inverse
// of motion energy, and the gate on per-stage treatment behaviour so a tool
// only works the specimen while it actually holds it.
export function deriveTreatmentEnergy(
  rawT: number,
  dwellFraction: number = STAGE_DWELL_FRACTION,
): number {
  return 1 - deriveMotionEnergy(rawT, dwellFraction);
}

// Which stage's chamber the specimen currently occupies (or is closest to) —
// the stage whose treatment should be applied. Switches at the transit
// midpoint, where motion energy peaks and treatment is gated to ~0 anyway, so
// the handover is invisible.
export function deriveChamberIndex(blend: StageBlend): number {
  return blend.rawT < 0.5 ? blend.fromIndex : blend.toIndex;
}

// World X the rig track group must sit at so the stage nearest `progress`
// lines up under the fixed camera/orb position (world origin).
export function deriveTrackX(progress: number): number {
  const { fromIndex, toIndex, t } = deriveStageBlend(progress, PROCESS_STAGE_X.length);
  return -lerp(PROCESS_STAGE_X[fromIndex], PROCESS_STAGE_X[toIndex], t);
}
