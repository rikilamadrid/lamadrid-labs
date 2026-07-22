// Cheap, dependency-free organic drift for the specimen particle. A plain
// sum of sine waves at small-integer-ratio frequencies falls into a short,
// visible repeating cycle (the "metronome"/"ball on rails" feel Ricardo
// flagged) no matter how many terms you stack. Spacing the octaves by the
// golden ratio instead means the combined period is effectively irrational —
// it never resolves into a beat the eye can predict — while staying a plain
// per-frame closed-form function (no noise texture/lookup table, no extra
// dependency). Each mounted specimen also gets a random phase seed so
// multiple mounts (hero, dev-harness preview) don't drift in lockstep.

const PHI = 1.618033988749895;

export function createDriftSeed(): number {
  return Math.random() * 1000;
}

export interface DriftSample {
  x: number;
  y: number;
  z: number;
}

// Amplitude budget, in world units, against a desktop frame that is ~6.2
// world units tall (camera z=9, fov 38). The previous values (0.018 base,
// 0.044 peak) worked out to well under 1% of frame height — present in the
// maths, invisible on screen, which is exactly why the specimen read as rigid.
// These are larger again on top of that first pass, paired with an always-on
// slow sway below and the genuinely-random wander layer further down: still
// comfortably inside a chamber's interior, but no longer reading as a
// polite, barely-perceptible wobble.
const DRIFT_BASE_AMP = 0.075;
const DRIFT_NOISE_AMP = 0.1;

// The slow layer that guarantees the specimen is *never* parked. It is
// deliberately independent of `noise` (so even the calmest stage keeps
// floating) and of `damp` at the call site's discretion, and runs at a period
// of tens of seconds so it never reads as a repeating animation.
const SWAY_AMP = 0.13;

// `noise` (0-1, per specimenStates.ts) scales amplitude so unstable stages
// (Reagent Selection, Synthesis) visibly wander more than calm ones
// (Purification, Crystallization) without changing frequency/character.
// `damp` (0-1) is the per-stage treatment's grip on the specimen — a tool
// holding it still (Measurement's scan, Crystallization's lock) pulls this
// down, but never to zero: it always keeps floating, just on a tighter leash.
export function sampleDrift(
  t: number,
  seed: number,
  noise: number,
  out: DriftSample,
  damp = 1,
): DriftSample {
  const amp = (DRIFT_BASE_AMP + noise * DRIFT_NOISE_AMP) * damp;
  // The sway keeps a floor of its own so a fully-damped stage still breathes.
  const sway = SWAY_AMP * (0.45 + 0.55 * damp);

  out.x =
    Math.sin(t * 0.31 + seed) * amp +
    Math.sin(t * 0.31 * PHI + seed * 1.7) * amp * 0.5 +
    Math.sin(t * 0.31 * PHI * PHI + seed * 2.3) * amp * 0.24 * (0.3 + noise) +
    Math.sin(t * 0.083 + seed * 0.9) * sway;
  out.y =
    Math.sin(t * 0.44 + seed * 1.3 + 1.1) * amp * 1.15 +
    Math.sin(t * 0.44 * PHI + seed * 0.6) * amp * 0.5 +
    Math.sin(t * 0.44 * PHI * PHI + seed * 3.1) * amp * 0.26 * (0.3 + noise) +
    Math.sin(t * 0.061 * PHI + seed * 1.4 + 2.2) * sway * 1.1;
  out.z =
    Math.sin(t * 0.26 + seed * 0.7 + 2.4) * amp * 0.85 +
    Math.sin(t * 0.26 * PHI + seed * 2.9) * amp * 0.42 +
    Math.sin(t * 0.047 + seed * 2.1) * sway * 0.7;
  return out;
}

// ─── Genuine random wander ──────────────────────────────────────────────────
// `sampleDrift` above is deterministic (golden-ratio-spaced sines) — organic
// enough to avoid a short repeating cycle, but a sum of sines is still, in
// the end, predictable: given the seed you could plot the whole path in
// advance. This layer adds real per-frame randomness on top via a damped
// mass-spring driven by white noise (an Ornstein-Uhlenbeck process): each
// frame nudges velocity with a small random kick, a spring pulls position
// back toward center (so it wanders but never runs away), and damping keeps
// it smooth rather than jittery. The combination reads as a small animal
// genuinely deciding where to drift next, not a waveform on a loop.
export interface WanderState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export function createWanderState(): WanderState {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 };
}

// Pulls position back toward center — bounds the wander to a legible radius
// instead of a true unbounded random walk. Tuned (via a standalone
// simulation, not by eye) so the stationary wander amplitude lands near
// ±0.1-0.25 world units at full noise budget: comparable to or a little
// past the deterministic sway above, so it reads as extra life rather than
// dwarfing the rest of the motion system.
const WANDER_STIFFNESS = 1.0;
// Smooths the random kicks into a graceful glide rather than a jitter.
const WANDER_DAMPING = 1.8;
// Random acceleration magnitude, world units/s^2 — scaled by `amp` (the same
// per-stage noise budget sampleDrift uses) at the call site.
const WANDER_JITTER = 4.0;

function stepOU(
  state: WanderState,
  delta: number,
  jitter: number,
  stiffness: number,
  damping: number,
): void {
  const dt = Math.min(delta, 0.05); // guards against huge steps after a tab was backgrounded
  state.vx += ((Math.random() - 0.5) * jitter - state.x * stiffness - state.vx * damping) * dt;
  state.vy += ((Math.random() - 0.5) * jitter - state.y * stiffness - state.vy * damping) * dt;
  state.vz += ((Math.random() - 0.5) * jitter * 0.7 - state.z * stiffness - state.vz * damping) * dt;
  state.x += state.vx * dt;
  state.y += state.vy * dt;
  state.z += state.vz * dt;
}

export function stepWander(state: WanderState, delta: number, amp: number): void {
  stepOU(state, delta, amp * WANDER_JITTER, WANDER_STIFFNESS, WANDER_DAMPING);
}

// ─── Meander — a slow, wide-roaming second wander layer ────────────────────
// `stepWander` above is tight and fast (a few tenths of a world unit) — it
// reads as "alive" but, on its own, still parks the specimen at a fixed
// centre for the whole shot, which is exactly the "stuck in the middle"
// complaint. This layer is the same Ornstein-Uhlenbeck process at a much
// lower stiffness/higher jitter, so it settles into slow, sweeping excursions
// a full order of magnitude wider than the tight wander — the specimen
// genuinely drifts across the frame, exploring the space around its current
// chamber, rather than oscillating on the spot. Deliberately given a floor
// independent of `noise`/`damp` (scaled but never collapsed) so even the
// calmest stage keeps roaming; a tool's grip narrows it, never stops it.
const MEANDER_STIFFNESS = 0.16;
const MEANDER_DAMPING = 0.65;
const MEANDER_JITTER = 2.6;

export function createMeanderState(): WanderState {
  return createWanderState();
}

export function stepMeander(state: WanderState, delta: number, amp: number): void {
  stepOU(state, delta, amp * MEANDER_JITTER, MEANDER_STIFFNESS, MEANDER_DAMPING);
}

// ─── Mood — a slow, unpredictable modulator on the wander layers' rate ─────
// stepWander/stepMeander above are genuinely random per-frame, but their
// stiffness/jitter are constant — so even though the exact path never
// repeats, its *rhythm* never changes either, and that constant rhythm is
// exactly what reads as "a cycle" to an eye watching for more than a few
// seconds (Ricardo's repeated "still predictable" note even after the
// wander/meander layers were added). This is a third, much slower
// one-dimensional Ornstein-Uhlenbeck process — same technique, different
// axis: instead of driving position, it drives a multiplier on the *other*
// layers' jitter, so the specimen genuinely speeds up and calms down again
// at no fixed interval, the way a small live thing's attention drifts.
const MOOD_STIFFNESS = 0.045; // mean-reversion so slow the swing spans a minute+
const MOOD_DAMPING = 0.9;
const MOOD_JITTER = 0.4;

export interface MoodState {
  value: number;
  velocity: number;
}

export function createMoodState(): MoodState {
  return { value: 0, velocity: 0 };
}

// Returns a 0.5-1.65 multiplier: never fully flat (a floor keeps the
// specimen from ever reading as parked) and never a runaway spike (a soft
// sigmoid squash instead of a hard clamp, so the ceiling doesn't read as a
// wall).
export function stepMood(state: MoodState, delta: number): number {
  const dt = Math.min(delta, 0.05);
  state.velocity +=
    ((Math.random() - 0.5) * MOOD_JITTER - state.value * MOOD_STIFFNESS - state.velocity * MOOD_DAMPING) * dt;
  state.value += state.velocity * dt;
  return 0.5 + 1.15 / (1 + Math.exp(-state.value * 2.2));
}

// A slow, slightly irregular breathing pulse (scale multiplier around 1) —
// two golden-ratio-spaced terms rather than one clean sine so it never reads
// as a metronomic heartbeat.
export function samplePulse(t: number, seed: number): number {
  return (
    Math.sin(t * 0.55 + seed * 0.4) * 0.028 +
    Math.sin(t * 0.55 * PHI + seed * 1.1 + 0.7) * 0.014
  );
}

// ─── Arrival reaction ──────────────────────────────────────────────────────
// One-shot response to the specimen settling into a chamber, driven by the
// arrival age from processLayout (0 = just landed, 1 = dwell over). Without
// this an arrival is just the tail of a lerp; with it the equipment reads as
// catching the specimen and acting on it.

// Damped spring overshoot: a sharp squash on impact that rings out over the
// first part of the dwell. Returns roughly -0.5..+0.9, centred on 0.
export function sampleArrivalPunch(age: number): number {
  if (age >= 1) return 0;
  return Math.exp(-age * 7) * Math.sin(age * Math.PI * 3.6) * 1.9;
}

// Brightness flare on contact, decaying faster than the punch rings out.
export function sampleArrivalFlare(age: number): number {
  if (age >= 1) return 0;
  return Math.exp(-age * 6.5);
}

// ─── Per-stage treatment: what each tool does to the specimen it holds ─────
// Each chamber works the specimen differently, and the differences are
// deliberately in *behaviour* rather than in geometry — how tightly it is
// held, how it vibrates, how its light responds — because the geometry-morph
// approach is what made the previous orb read as an object being posed rather
// than a material being processed.

export type SpecimenTreatmentKind =
  | "infuse"
  | "scan"
  | "agitate"
  | "settle"
  | "lock";

export interface TreatmentSample {
  /** Extra positional displacement, world units, on top of the ambient drift. */
  x: number;
  y: number;
  z: number;
  /** Additive scale offset around 0. */
  scale: number;
  /** Additive glow offset around 0. */
  glow: number;
  /** Multiplier on the ambient drift — a tool's grip. Never reaches 0. */
  damp: number;
  /** Extra spin rate (rad/s) applied to the group, so sparks read as driven. */
  spin: number;
}

const MIN_DAMP = 0.34;

function resetTreatment(out: TreatmentSample): void {
  out.x = 0;
  out.y = 0;
  out.z = 0;
  out.scale = 0;
  out.glow = 0;
  out.damp = 1;
  out.spin = 0;
}

// A narrow spike centred on `centre` as `phase` sweeps 0-1 — used for scan
// sweeps and facet flashes.
function spike(phase: number, centre: number, sharpness: number): number {
  const d = phase - centre;
  return Math.exp(-d * d * sharpness);
}

/**
 * @param t       running seconds
 * @param kind    which chamber currently holds the specimen
 * @param energy  0-1 chamber occupancy (0 mid-transit, 1 fully parked)
 * @param age     0-1 through the current dwell (0 = just arrived)
 * @param seed    per-mount phase seed
 */
export function sampleTreatment(
  t: number,
  kind: SpecimenTreatmentKind,
  energy: number,
  age: number,
  seed: number,
  out: TreatmentSample,
): TreatmentSample {
  resetTreatment(out);
  if (energy <= 0) return out;

  switch (kind) {
    // Reagent Selection — raw material being dosed in. Discrete droplet hits
    // knock the specimen and fade, on a loose irregular cadence.
    case "infuse": {
      const beat = (t * 0.62 + seed * 0.31) % 1;
      const hit = Math.exp(-beat * 8);
      out.y = -hit * 0.1;
      out.x = Math.sin(t * 1.9 + seed) * 0.028 * (1 - hit);
      out.scale = hit * 0.2;
      out.glow = hit * 0.38;
      out.damp = 1.15;
      break;
    }

    // Measurement — clamped and swept by a beam. The tool's signature is that
    // it takes the wander *away*: the float tightens right down and the
    // specimen steps in quantised increments instead of drifting freely.
    case "scan": {
      const sweep = (t * 0.5 + seed * 0.17) % 1;
      out.glow = spike(sweep, 0.5, 55) * 0.65;
      // Quantised micro-steps rather than a continuous slide — the specimen
      // reads as being indexed by the instrument.
      out.y = Math.round(Math.sin(t * 0.55 + seed) * 3) * 0.03;
      out.scale = -0.06 + spike(sweep, 0.5, 55) * 0.05;
      out.damp = 0.38;
      break;
    }

    // Synthesis — the violent one. High-frequency vibration with surging
    // brightness, and the sparks are visibly driven faster.
    case "agitate": {
      const shake = 0.042;
      out.x = (Math.sin(t * 17.3 + seed) + Math.sin(t * 23.9 + seed * 2.2) * 0.6) * shake;
      out.y = (Math.sin(t * 19.7 + seed * 1.4) + Math.sin(t * 28.1 + seed) * 0.5) * shake;
      out.z = Math.sin(t * 21.1 + seed * 0.8) * shake * 0.7;
      out.scale = Math.sin(t * 11.4 + seed) * 0.13;
      out.glow = Math.abs(Math.sin(t * 3.1 + seed * 0.5)) * 0.46;
      out.damp = 1.4;
      out.spin = 1.3;
      break;
    }

    // Purification — inherits Synthesis's agitation and visibly calms it out
    // across the dwell, brightening as it cleans up. The one treatment whose
    // whole character is the change over `age`.
    case "settle": {
      const calm = 1 - age * age * (3 - 2 * age);
      const shimmer = 0.034 * calm;
      out.x = Math.sin(t * 13.1 + seed) * shimmer;
      out.y = Math.sin(t * 15.7 + seed * 1.9) * shimmer;
      out.z = Math.sin(t * 11.3 + seed * 0.4) * shimmer * 0.6;
      out.scale = -age * 0.08 + Math.sin(t * 7.2 + seed) * 0.04 * calm;
      out.glow = age * 0.32;
      out.damp = 1 - age * 0.5;
      out.spin = calm * 0.6;
      break;
    }

    // Crystallization — the tool locks it. Wander collapses to the floor, the
    // scale ratchets up in discrete growth steps, and facets catch the light
    // in periodic flashes.
    case "lock": {
      const flash = Math.pow(Math.max(0, Math.sin(t * 1.55 + seed * 0.7)), 14);
      out.glow = flash * 0.6;
      out.scale = (Math.floor(age * 4) / 4) * 0.14;
      out.damp = MIN_DAMP;
      out.spin = -0.3;
      break;
    }
  }

  // Fade the whole treatment out as the specimen leaves the chamber, so the
  // handover to the transit arc is continuous.
  out.x *= energy;
  out.y *= energy;
  out.z *= energy;
  out.scale *= energy;
  out.glow *= energy;
  out.spin *= energy;
  // Damp blends toward 1 (no grip) rather than toward 0 as the specimen
  // leaves. Values above 1 are intentional — Infuse and Agitate *amplify* the
  // ambient wander — so this deliberately isn't clamped to 1, only floored.
  out.damp = Math.max(MIN_DAMP, 1 + (out.damp - 1) * energy);

  return out;
}

export function createTreatmentSample(): TreatmentSample {
  const sample: TreatmentSample = {
    x: 0,
    y: 0,
    z: 0,
    scale: 0,
    glow: 0,
    damp: 1,
    spin: 0,
  };
  return sample;
}
