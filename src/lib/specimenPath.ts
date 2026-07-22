import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { clamp01 } from "./math";
import { DWELL_CREEP, PROCESS_STAGE_X, RIG_GATE_X } from "./processLayout";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

// Real curved-path sampling for the specimen, via GSAP's MotionPathPlugin —
// used as a per-frame sampler (MotionPathPlugin.getPositionOnPath) rather
// than a timeline tween, since the scene drives everything off one
// scroll-scrubbed progress number sampled inside R3F's useFrame. Each path
// is authored as plain SVG cubic-bezier path data in "world unit" numbers
// (not true SVG pixel/viewBox semantics — the (x, y) pair is just reused
// directly as two world-space axes per curve, documented per curve below).

type RawPath = ReturnType<typeof MotionPathPlugin.getRawPath>;

function buildRawPath(d: string): RawPath {
  const rawPath = MotionPathPlugin.getRawPath(d);
  MotionPathPlugin.cacheRawPathMeasurements(rawPath);
  return rawPath;
}

// ─── Hero -> table descent ─────────────────────────────────────────────────
// The specimen starts elevated/floating in Hero's frame and settles to the
// local origin (table/reagent-selection height) by heroT = 1. Path x maps to
// a gentle world-X sideways drift; path y maps to world-Y elevation. Slightly
// asymmetric control points (not a mirrored arch) so the descent reads as one
// continuous, gently curious drift rather than a clean pendulum swing.
const HERO_RISE = 1.6;
const heroRawPath = buildRawPath(
  `M 0,${HERO_RISE} C 0.62,${HERO_RISE * 0.58} -0.4,${HERO_RISE * 0.15} 0.05,${HERO_RISE * 0.02} S -0.08,${HERO_RISE * -0.01} 0,0`,
);

export function sampleHeroOffset(heroT: number, out: { x: number; y: number }): void {
  const p = MotionPathPlugin.getPositionOnPath(heroRawPath, clamp01(heroT));
  out.x = p.x;
  out.y = p.y;
}

// ─── Stage-to-stage transit arcs ───────────────────────────────────────────
// One distinct curve per transition rather than a single symmetric curve
// reused everywhere — reusing the same shape at every handoff is exactly
// what made the journey read as "on rails" (a literal repeating animation
// cycle). Each path still starts and ends at (0, 0) so it stays continuous
// with the settled dwell pose at both ends (no pop), but the control points
// are asymmetric and vary per transition — different height/depth, a skewed
// peak, and a small secondary S-bend — so consecutive transitions read as
// distinct gestures instead of one repeated swoop. Path x maps to a
// forward/back world-Z bulge (toward camera at the apex); path y maps to a
// world-Y lift.
interface TransitCurveParams {
  /** Forward/back Z bulge amount. */
  depth: number;
  /** Y lift amount. */
  height: number;
  /** -1..1, skews the peak earlier/later through the sweep instead of a
   *  perfectly centered arch. */
  asymmetry: number;
  /** 0-1, strength of a secondary S-bend so the arc isn't one clean hump. */
  wobble: number;
}

function buildTransitPath({ depth, height, asymmetry, wobble }: TransitCurveParams): RawPath {
  const c1x = depth * (1 + asymmetry * 0.45);
  const c1y = height * (1 - asymmetry * 0.3);
  const c2x = -depth * (1 - asymmetry * 0.45) + wobble * depth * 0.6;
  const c2y = height * (1 + asymmetry * 0.3) - wobble * height * 0.5;
  return buildRawPath(`M 0,0 C ${c1x},${c1y} ${c2x},${c2y} 0,0`);
}

// Reagent -> Measurement: a quick, slightly curious dart (small, eager).
// Measurement -> Synthesis: the biggest, most energetic swoop of the four.
// Synthesis -> Purification: settling down, calmer than the peak either side.
// Purification -> Crystallization: the smallest, most composed glide.
// Depth/height scaled well beyond the old 0.2-0.4 range — those were too
// small to read against a ~6 world-unit-tall frame, which is why the journey
// looked like it never left dead centre. Big enough now that a transit
// visibly sweeps up/back into the background before diving into the next
// chamber, without the apex leaving the rig's own footprint.
const TRANSIT_CURVE_PARAMS: TransitCurveParams[] = [
  { depth: 0.85, height: 0.55, asymmetry: 0.35, wobble: 0.2 },
  { depth: 1.05, height: 0.78, asymmetry: -0.25, wobble: 0.35 },
  { depth: 0.8, height: 0.5, asymmetry: 0.18, wobble: 0.45 },
  { depth: 0.6, height: 0.36, asymmetry: -0.12, wobble: 0.12 },
];

const transitRawPaths = TRANSIT_CURVE_PARAMS.map(buildTransitPath);

// ─── Gate-routed timing ─────────────────────────────────────────────────
// The specimen itself never moves in world-X — the rig track slides
// underneath it (see ProcessScene's RigTrack) — so "entering through the
// opening the tool offers" (RigGate, at local x=±RIG_GATE_X on every rig)
// isn't a matter of steering the specimen sideways: it's a matter of timing
// the *existing* Y/Z swoop so it only happens in the open air between two
// gates, and holds level while it's still within a chamber's own footprint
// on either side of one. Previously the swoop ran across the whole transit
// (u 0→1) with no regard for where the gates actually were, so the specimen
// visibly arced up and over them rather than passing through.
//
// `u` (this module's transit parameter) is linear in the transit's raw
// progress, but the track's X slide is dwell-eased (processLayout's
// dwellEase) — the two only agree at the transit's own start/end. So the
// exact `u` at which a gate physically lines up with the specimen's fixed
// x=0 has to be found by inverting that same easing, not assumed to be a
// round number.

// World-X a gate sits at once its rig is centred under the camera (track
// slide = 0): the departure rig's exit gate at +RIG_GATE_X, the arrival
// rig's entry gate at (stage spacing) - RIG_GATE_X. Framed as a fraction of
// one stage-to-stage step so it plugs straight into the eased track blend.
const STAGE_STEP = PROCESS_STAGE_X[1] - PROCESS_STAGE_X[0];
const EXIT_GATE_FRACTION = RIG_GATE_X / STAGE_STEP;
const ENTRY_GATE_FRACTION = (STAGE_STEP - RIG_GATE_X) / STAGE_STEP;

// Inverts processLayout's dwell-eased smoothstep (restricted to the transit
// window, where it's a plain smoothstep from a DWELL_CREEP floor) via
// bisection — a closed form exists but isn't worth the algebra for a value
// computed once at module load, not per frame.
function solveTransitLocal(targetEasedFraction: number): number {
  const span = 1 - 2 * DWELL_CREEP;
  const target = clamp01((targetEasedFraction - DWELL_CREEP) / span);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const eased = mid * mid * (3 - 2 * mid);
    if (eased < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Where, in this module's linear transit `u`, the departure/arrival gates
// actually cross the specimen — the swoop is windowed to exactly this span.
const GATE_LO = solveTransitLocal(EXIT_GATE_FRACTION);
const GATE_HI = solveTransitLocal(ENTRY_GATE_FRACTION);
const GATE_SPAN = GATE_HI - GATE_LO;

export function sampleTransitOffset(
  u: number,
  transitionIndex: number,
  out: { x: number; y: number },
): void {
  const uc = clamp01(u);
  // Still inside the departure or arrival chamber's own footprint (short of
  // its gate) — travel level, no swoop; ambient drift is still layered on
  // top of this at the call site.
  if (uc <= GATE_LO || uc >= GATE_HI) {
    out.x = 0;
    out.y = 0;
    return;
  }
  const index = Math.min(Math.max(transitionIndex, 0), transitRawPaths.length - 1);
  const local = (uc - GATE_LO) / GATE_SPAN;
  const p = MotionPathPlugin.getPositionOnPath(transitRawPaths[index], local);
  out.x = p.x;
  out.y = p.y;
}
