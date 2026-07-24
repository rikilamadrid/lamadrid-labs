/**
 * The signal layer — the foreground of Signal / Noise.
 *
 * `pointer-field.ts` owns the *field*: a lattice that resolves noise into local
 * order around the pointer. That layer is deliberately positional — it reads
 * raw coordinates and knows nothing about how the pointer got there. This module
 * owns everything that *velocity and direction* drive: a crisp signal core that
 * stretches and brightens with speed, and a short directional transmission trail
 * that reads as a wake through static.
 *
 * Like `pointer-field.ts`, this is framework-free and DOM-free beyond the 2D
 * context it is handed. Motion is tracked in plain mutable objects (no React,
 * no per-frame allocation), and the trail is a fixed pool. The caller runs one
 * rAF loop that advances the field and this layer together and idles when both
 * have settled.
 *
 * What this deliberately is *not*: a glowing orb, a soft blob, a particle
 * fountain, a sparkler. The core is a 1–2px detector, the trail is broken lines
 * and tiny data fragments, and the acid `energy` accent appears only at the
 * peak of fast motion. Nothing accumulates; the wake dissolves in 450–900ms.
 */

import { clamp01, lerp } from "@/lib/math";

/* ═══════════════════════════════════════════════════════════════════════════
   Colors
   ═══════════════════════════════════════════════════════════════════════════ */

export type SignalColors = {
  /** `--lab-signal` — the resolved accent. The core and most trail marks. */
  signal: string;
  /** `--lab-signal-strong` — brighter nodes at the head of the wake. */
  signalStrong: string;
  /** `--lab-energy` — acid, only at the peak of fast motion. Rare by design. */
  energy: string;
};

/** Channel-separation offsets. Fixed rather than themed: the split reads as a
 *  transmission artifact, not part of the palette, and only surfaces for a few
 *  frames of fast motion. */
const CHANNEL_RED = "rgba(255, 64, 64, 1)";
const CHANNEL_CYAN = "rgba(64, 216, 255, 1)";

/* ═══════════════════════════════════════════════════════════════════════════
   Pointer motion

   The detector. Not the raw event position — a smoothed point that chases the
   pointer quickly (rapid, slightly unstable) while carrying the velocity and
   heading the rest of the layer reads. Attaching marks to raw coordinates was
   the brief's explicit anti-goal; everything here keys off `energy` and `dir`.
   ═══════════════════════════════════════════════════════════════════════════ */

export type PointerMotion = {
  /** Pointer is currently over the field. */
  present: boolean;
  /** Smoothed detector position, CSS px. Lags the raw pointer by a few ms. */
  x: number;
  y: number;
  /** Smoothed velocity, CSS px per second. */
  vx: number;
  vy: number;
  /** `hypot(vx, vy)`. */
  speed: number;
  /** Last significant heading, unit vector. Held through slow/idle frames so
   *  the core and trail keep pointing the way they were going. */
  dirX: number;
  dirY: number;
  /** `clamp01(speed / SPEED_REF)` — the single driver of the whole layer. */
  energy: number;
  /** Seconds since the pointer last moved meaningfully. */
  idle: number;
};

/** Speed, in CSS px/s, at which `energy` saturates to 1. Tuned so an ordinary
 *  flick reaches the high-energy band but a normal reading-speed drift sits
 *  low. */
const SPEED_REF = 2200;
/** Position-follow time constant, seconds. Small — the core must feel immediate,
 *  not floaty. */
const POS_TAU = 0.045;
/** Velocity-smoothing time constant, seconds. Slightly slower than position so
 *  a single jittery frame does not spike the energy. */
const VEL_TAU = 0.06;
/** Above this speed (px/s) the heading is updated; below it, held. Stops the
 *  direction from spinning wildly when the pointer is nearly still. */
const DIR_MIN_SPEED = 60;
/** Below this speed (px/s) the pointer counts as idle. */
const IDLE_SPEED = 10;
/** Largest integration step, seconds — see `pointer-field.MAX_STEP`. A tab
 *  returning from background must not register one enormous velocity. */
const MAX_STEP = 1 / 30;

export function createPointerMotion(): PointerMotion {
  return {
    present: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    dirX: 1,
    dirY: 0,
    energy: 0,
    idle: 0,
  };
}

export type PointerTarget = { x: number; y: number } | null;

/**
 * Advance the detector toward `target` by `dt` seconds.
 *
 * Returns `true` while the detector is still doing something — present, or
 * coasting to a stop after the pointer left — so the caller can let the loop
 * idle once it returns `false`.
 */
export function stepPointerMotion(
  motion: PointerMotion,
  target: PointerTarget,
  dt: number,
): boolean {
  const step = Math.min(dt, MAX_STEP);

  if (!target) {
    // Pointer gone: freeze position, bleed velocity to zero so the trail and
    // core settle rather than snap off.
    const k = 1 - Math.exp(-step / VEL_TAU);
    motion.vx = lerp(motion.vx, 0, k);
    motion.vy = lerp(motion.vy, 0, k);
    motion.speed = Math.hypot(motion.vx, motion.vy);
    motion.energy = clamp01(motion.speed / SPEED_REF);
    motion.idle += step;
    motion.present = false;
    return motion.speed > 2;
  }

  // First frame back: snap onto the pointer so re-entry does not read as one
  // huge jump across the viewport.
  if (!motion.present) {
    motion.x = target.x;
    motion.y = target.y;
    motion.vx = 0;
    motion.vy = 0;
    motion.speed = 0;
    motion.energy = 0;
    motion.present = true;
    return true;
  }

  const prevX = motion.x;
  const prevY = motion.y;

  const kPos = 1 - Math.exp(-step / POS_TAU);
  motion.x = lerp(motion.x, target.x, kPos);
  motion.y = lerp(motion.y, target.y, kPos);

  const instVx = (motion.x - prevX) / step;
  const instVy = (motion.y - prevY) / step;
  const kVel = 1 - Math.exp(-step / VEL_TAU);
  motion.vx = lerp(motion.vx, instVx, kVel);
  motion.vy = lerp(motion.vy, instVy, kVel);

  motion.speed = Math.hypot(motion.vx, motion.vy);
  motion.energy = clamp01(motion.speed / SPEED_REF);

  if (motion.speed > DIR_MIN_SPEED) {
    motion.dirX = motion.vx / motion.speed;
    motion.dirY = motion.vy / motion.speed;
  }

  motion.idle = motion.speed < IDLE_SPEED ? motion.idle + step : 0;

  return true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Transmission trail

   A short directional wake, sampled along the detector's path. Each sample is
   one of a few primitives — a broken line, a node, a data rect — that fade and
   recycle. A fixed pool: never allocates per frame, never grows without bound.
   ═══════════════════════════════════════════════════════════════════════════ */

/** The primitive a sample draws as. Assigned round-robin at emit so the wake
 *  reads as mixed signal, not a dotted line. */
const KIND_LINE = 0;
const KIND_NODE = 1;
const KIND_RECT = 2;

type TrailSample = {
  active: boolean;
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  /** Energy at birth — sets brightness and length; a sample keeps the
   *  character of the motion that made it even as newer, calmer marks appear. */
  energy: number;
  age: number;
  life: number;
  kind: number;
};

export type Trail = {
  samples: TrailSample[];
  lastX: number;
  lastY: number;
  hasLast: boolean;
  /** Round-robin cursor for kind assignment and pool overwrite. */
  cursor: number;
  emitCount: number;
};

/** Pool size. At the tightest emit spacing a wake is ~20 marks long; 48 leaves
 *  headroom for a fast sweep without ever allocating mid-frame. */
const TRAIL_POOL = 48;
/** Below this energy the pointer is drifting, not transmitting — no wake. */
const EMIT_ENERGY = 0.05;

export function createTrail(): Trail {
  const samples: TrailSample[] = [];
  for (let i = 0; i < TRAIL_POOL; i += 1) {
    samples.push({
      active: false,
      x: 0,
      y: 0,
      dirX: 1,
      dirY: 0,
      energy: 0,
      age: 0,
      life: 0,
      kind: KIND_LINE,
    });
  }
  return { samples, lastX: 0, lastY: 0, hasLast: false, cursor: 0, emitCount: 0 };
}

/**
 * Age the wake and emit new marks along the motion since the last frame.
 *
 * Emits at most one mark per frame, gated on distance moved so the wake's
 * density is set by travel, not framerate. Returns `true` while any mark is
 * still alive.
 */
export function stepTrail(trail: Trail, motion: PointerMotion, dt: number): boolean {
  let alive = false;

  for (const sample of trail.samples) {
    if (!sample.active) continue;
    sample.age += dt;
    if (sample.age >= sample.life) {
      sample.active = false;
    } else {
      alive = true;
    }
  }

  const emitting = motion.present && motion.energy > EMIT_ENERGY;
  if (emitting) {
    if (!trail.hasLast) {
      trail.lastX = motion.x;
      trail.lastY = motion.y;
      trail.hasLast = true;
    }

    const moved = Math.hypot(motion.x - trail.lastX, motion.y - trail.lastY);
    // Faster motion samples tighter, so a quick sweep leaves a denser, longer
    // wake; a slow drag leaves a sparse one.
    const spacing = lerp(24, 9, motion.energy);

    if (moved >= spacing) {
      const sample = trail.samples[trail.cursor % TRAIL_POOL];
      trail.cursor += 1;
      trail.emitCount += 1;

      sample.active = true;
      sample.x = motion.x;
      sample.y = motion.y;
      sample.dirX = motion.dirX;
      sample.dirY = motion.dirY;
      sample.energy = motion.energy;
      sample.age = 0;
      sample.life = lerp(0.45, 0.9, motion.energy);
      // Mostly lines, a scatter of nodes, a rare data rect.
      const m = trail.emitCount % 5;
      sample.kind = m === 0 ? KIND_NODE : m === 3 ? KIND_RECT : KIND_LINE;

      trail.lastX = motion.x;
      trail.lastY = motion.y;
      alive = true;
    }
  } else {
    trail.hasLast = false;
  }

  return alive;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Drawing

   All marks are hairline strokes and 1–2px fills. No shadowBlur, no filters,
   no gradients — the brief bans them and they are the expensive path on a
   moving layer. The caller has already scaled the context by DPR; coordinates
   here are CSS px.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Energy above which the channel split and acid accent appear. */
const HIGH_ENERGY = 0.55;

function drawSample(
  context: CanvasRenderingContext2D,
  sample: TrailSample,
  colors: SignalColors,
  channelSplit: boolean,
): void {
  const fade = 1 - sample.age / sample.life;
  if (fade <= 0) return;

  const { x, y, dirX, dirY, energy } = sample;

  if (sample.kind === KIND_NODE) {
    // Bright node at the head of a signal — a resolved point in the wake.
    context.globalAlpha = fade * lerp(0.4, 0.85, energy);
    context.fillStyle = energy > HIGH_ENERGY ? colors.energy : colors.signalStrong;
    const s = lerp(1.4, 2.2, energy);
    context.fillRect(x - s / 2, y - s / 2, s, s);
    return;
  }

  if (sample.kind === KIND_RECT) {
    // A tiny data fragment: a thin rectangle oriented along travel.
    const len = lerp(4, 7, energy);
    const perpX = -dirY;
    const perpY = dirX;
    context.globalAlpha = fade * lerp(0.25, 0.5, energy);
    context.strokeStyle = colors.signal;
    context.lineWidth = 1;
    context.beginPath();
    // Two long edges parallel to travel, capped — reads as a compressed band.
    context.moveTo(x - dirX * len - perpX, y - dirY * len - perpY);
    context.lineTo(x + dirX * len - perpX, y + dirY * len - perpY);
    context.moveTo(x - dirX * len + perpX, y - dirY * len + perpY);
    context.lineTo(x + dirX * len + perpX, y + dirY * len + perpY);
    context.stroke();
    return;
  }

  // KIND_LINE: a broken horizontal-ish signal segment along travel, drawn as
  // two dashes with a gap so it reads as an interrupted transmission.
  const len = lerp(9, 20, energy);
  const gap = len * 0.28;
  const dx = dirX * len;
  const dy = dirY * len;
  const alpha = fade * lerp(0.18, 0.55, energy);

  const stroke = (offX: number, offY: number, style: string, a: number) => {
    context.globalAlpha = a;
    context.strokeStyle = style;
    context.lineWidth = lerp(1, 1.5, energy);
    context.beginPath();
    context.moveTo(x - dx + offX, y - dy + offY);
    context.lineTo(x - dirX * gap + offX, y - dirY * gap + offY);
    context.moveTo(x + dirX * gap + offX, y + dirY * gap + offY);
    context.lineTo(x + dx + offX, y + dy + offY);
    context.stroke();
  };

  if (channelSplit && energy > HIGH_ENERGY) {
    // One-frame-ish RGB tear at speed: red and cyan pulled apart along the
    // perpendicular, very low alpha. Never constant — only high-energy marks.
    const split = lerp(0, 1.6, clamp01((energy - HIGH_ENERGY) / (1 - HIGH_ENERGY)));
    const perpX = -dirY * split;
    const perpY = dirX * split;
    stroke(perpX, perpY, CHANNEL_RED, alpha * 0.35);
    stroke(-perpX, -perpY, CHANNEL_CYAN, alpha * 0.35);
  }

  stroke(0, 0, colors.signal, alpha);
}

export function drawTrail(
  context: CanvasRenderingContext2D,
  trail: Trail,
  colors: SignalColors,
  channelSplit: boolean,
): void {
  context.lineCap = "round";
  for (const sample of trail.samples) {
    if (sample.active) drawSample(context, sample, colors, channelSplit);
  }
  context.globalAlpha = 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Signal pulse

   The interaction burst. On pointer down the nearby signal first *compresses*
   toward the core — a fast inward rush that momentarily silences the field —
   then releases outward as a geometric transmission: an expanding, broken
   Dynamic-Frame square, a cross-shaped scan, and a constellation that spreads
   and thins. Deliberately not a ring: the brief bans circular ripples, and the
   frame/cross/constellation vocabulary is what ties the pulse to the mark and
   nav language. One reusable object; fires in ~700ms and recycles.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Constellation node count. Odd, so the spread never resolves into an obvious
 *  mirror-symmetric shape. */
const PULSE_NODES = 7;
/** Total pulse lifetime, seconds — the brief's ~700ms ceiling. */
const PULSE_LIFE = 0.7;
/** Fraction of the life spent compressing inward before the outward release.
 *  Short: the silence-then-emit beat reads as a snap, not a wind-up. */
const PULSE_COMPRESS = 0.22;

export type Pulse = {
  active: boolean;
  x: number;
  y: number;
  age: number;
  /** Energy at fire — a click mid-flick throws wider and brighter than a
   *  click from rest. */
  energy: number;
  /** Per-node base angle, fixed at construction so the constellation is stable
   *  across fires rather than reshuffling each click. */
  angles: number[];
  /** Outer radius the release reaches, set at fire from energy. */
  radius: number;
};

export function createPulse(): Pulse {
  const angles: number[] = [];
  for (let i = 0; i < PULSE_NODES; i += 1) {
    // Golden-ish irregular spacing so nodes never sit on a clean polygon.
    angles.push((i / PULSE_NODES) * Math.PI * 2 + (i % 2) * 0.22);
  }
  return { active: false, x: 0, y: 0, age: 0, energy: 0, angles, radius: 0 };
}

/** Arm a pulse at a point. Overwrites any pulse in flight — a rapid double
 *  click restarts rather than stacking, which keeps the layer bounded. */
export function firePulse(pulse: Pulse, x: number, y: number, energy: number): void {
  pulse.active = true;
  pulse.x = x;
  pulse.y = y;
  pulse.age = 0;
  pulse.energy = energy;
  pulse.radius = lerp(72, 132, energy);
}

/** Advance the pulse. Returns `true` while it is still in flight. */
export function stepPulse(pulse: Pulse, dt: number): boolean {
  if (!pulse.active) return false;
  pulse.age += dt;
  if (pulse.age >= PULSE_LIFE) {
    pulse.active = false;
    return false;
  }
  return true;
}

export function drawPulse(
  context: CanvasRenderingContext2D,
  pulse: Pulse,
  colors: SignalColors,
): void {
  if (!pulse.active) return;

  const t = pulse.age / PULSE_LIFE;
  const { x, y, radius, energy } = pulse;
  context.lineCap = "round";

  // Two beats: compress inward (nodes rush to the core, field held bright),
  // then release outward (everything spreads and fades).
  let nodeR: number;
  let fade: number;
  let release: number;
  if (t < PULSE_COMPRESS) {
    const c = t / PULSE_COMPRESS;
    nodeR = lerp(radius * 0.55, 0, c * c); // ease-in rush to center
    fade = 1;
    release = 0;
  } else {
    release = (t - PULSE_COMPRESS) / (1 - PULSE_COMPRESS);
    const eased = 1 - (1 - release) ** 3; // ease-out spread
    nodeR = lerp(0, radius, eased);
    fade = 1 - release;
  }

  const base = lerp(0.45, 0.85, energy);

  // ── Constellation: nodes on their angles, connected as they spread ──
  const px: number[] = [];
  const py: number[] = [];
  for (let i = 0; i < PULSE_NODES; i += 1) {
    px.push(x + Math.cos(pulse.angles[i]) * nodeR);
    py.push(y + Math.sin(pulse.angles[i]) * nodeR);
  }

  if (nodeR > 4) {
    context.globalAlpha = fade * base * 0.4;
    context.strokeStyle = colors.signal;
    context.lineWidth = 1;
    context.beginPath();
    for (let i = 0; i < PULSE_NODES; i += 1) {
      const j = (i + 1) % PULSE_NODES;
      context.moveTo(px[i], py[i]);
      context.lineTo(px[j], py[j]);
    }
    context.stroke();
  }

  context.globalAlpha = fade * base;
  context.fillStyle = energy > HIGH_ENERGY ? colors.energy : colors.signalStrong;
  const s = lerp(1.6, 2.4, energy);
  for (let i = 0; i < PULSE_NODES; i += 1) {
    context.fillRect(px[i] - s / 2, py[i] - s / 2, s, s);
  }

  // ── Release-only structure: an incomplete Dynamic-Frame square and a cross
  //    scan expanding out of the core. Suppressed during compression so the
  //    inward beat stays clean. ──
  if (release > 0) {
    const fs = release * radius * 0.8; // frame half-size
    const arm = Math.min(fs * 0.5, 14); // bracket arm length
    context.globalAlpha = fade * base * 0.7;
    context.strokeStyle = colors.signal;
    context.lineWidth = lerp(1, 1.6, energy);
    context.beginPath();
    // Four corner brackets — the open LL frame, never a closed square.
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const cx = x + sx * fs;
        const cy = y + sy * fs;
        context.moveTo(cx - sx * arm, cy);
        context.lineTo(cx, cy);
        context.lineTo(cx, cy - sy * arm);
      }
    }
    context.stroke();

    // Cross scan: thin horizontal + vertical sweep, slightly ahead of the
    // frame, fading fastest.
    const crossR = release * radius * 1.05;
    context.globalAlpha = (1 - release) * base * 0.5;
    context.strokeStyle = colors.signalStrong;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x - crossR, y);
    context.lineTo(x + crossR, y);
    context.moveTo(x, y - crossR);
    context.lineTo(x, y + crossR);
    context.stroke();
  }

  context.globalAlpha = 1;
}

/**
 * Draw the signal core — the crisp detector at the pointer.
 *
 * At rest: a tiny point with a faint coordinate cross, reading as a focused
 * detector. In motion: it stretches along the heading and brightens with speed,
 * with an acid spark at its leading tip only at the peak of fast motion.
 */
export function drawCore(
  context: CanvasRenderingContext2D,
  motion: PointerMotion,
  colors: SignalColors,
  channelSplit: boolean,
): void {
  // Fade the core out as the pointer coasts to a stop after leaving.
  const presence = motion.present ? 1 : clamp01(motion.speed / 40);
  if (presence <= 0) return;

  const e = motion.energy;
  const { x, y, dirX, dirY } = motion;
  const half = lerp(2, 13, e);
  const dx = dirX * half;
  const dy = dirY * half;

  context.lineCap = "round";

  if (channelSplit && e > HIGH_ENERGY) {
    const split = lerp(0, 1.4, clamp01((e - HIGH_ENERGY) / (1 - HIGH_ENERGY)));
    const perpX = -dirY * split;
    const perpY = dirX * split;
    const drawSplit = (ox: number, oy: number, style: string) => {
      context.globalAlpha = presence * 0.4;
      context.strokeStyle = style;
      context.lineWidth = lerp(1.6, 2.4, e);
      context.beginPath();
      context.moveTo(x - dx + ox, y - dy + oy);
      context.lineTo(x + dx + ox, y + dy + oy);
      context.stroke();
    };
    drawSplit(perpX, perpY, CHANNEL_RED);
    drawSplit(-perpX, -perpY, CHANNEL_CYAN);
  }

  // Main core stroke.
  context.globalAlpha = presence * lerp(0.9, 1, e);
  context.strokeStyle = colors.signalStrong;
  context.lineWidth = lerp(1.6, 2.4, e);
  context.beginPath();
  context.moveTo(x - dx, y - dy);
  context.lineTo(x + dx, y + dy);
  context.stroke();

  // At rest: a faint coordinate cross — the detector holding a precise fix.
  if (e < 0.15) {
    const tick = 3;
    context.globalAlpha = presence * lerp(0.35, 0, e / 0.15);
    context.strokeStyle = colors.signal;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x - tick, y);
    context.lineTo(x + tick, y);
    context.moveTo(x, y - tick);
    context.lineTo(x, y + tick);
    context.stroke();
  }

  // Peak-energy acid spark at the leading tip.
  if (e > 0.75) {
    context.globalAlpha = presence * clamp01((e - 0.75) / 0.25);
    context.fillStyle = colors.energy;
    const s = 2;
    context.fillRect(x + dx - s / 2, y + dy - s / 2, s, s);
  }

  context.globalAlpha = 1;
}
