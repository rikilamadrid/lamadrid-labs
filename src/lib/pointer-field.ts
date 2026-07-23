/**
 * The pointer field — Signal / Noise's signature interaction.
 *
 * A grid of short line segments sits at rest in noise: random orientations,
 * dim, drawn from the `--lab-noise-*` ramp. The pointer creates a temporary
 * field of local order around itself — inside it, fragments rotate toward a
 * shared alignment, lengthen, brighten, and take the signal accent. When the
 * pointer leaves, order decays back to noise more slowly than it arrived, so
 * the trailing edge lingers.
 *
 * What this deliberately is *not*:
 *
 * - **Not a particle trail.** Fragments never translate. They hold their rest
 *   positions and only change orientation, length, and value.
 * - **Not a glowing orb.** No radial bloom, no bright center. The field is
 *   legible through alignment, not luminance.
 * - **Not a physics toy.** No velocity, no inertia, no collision. Each
 *   fragment eases toward a target and stops.
 *
 * This module is framework-free and free of DOM access beyond the 2D context
 * it is handed, so it can be lifted into the hero (Feature 4) unchanged and
 * unit-tested (Feature 18) without a canvas.
 */

import { clamp01, lerp } from "@/lib/math";

/* ═══════════════════════════════════════════════════════════════════════════
   Tuning

   Every magic number in the field lives here. These are the deliverable of
   the Feature 3 prototype — the page that tunes them is throwaway, this
   object is not.
   ═══════════════════════════════════════════════════════════════════════════ */

export type FieldTuning = {
  /**
   * Target spacing between fragments, in CSS pixels. Fragment count is
   * derived from this and the canvas area, so density stays constant across
   * viewports instead of the field thinning out on large screens.
   */
  spacing: number;
  /**
   * Hard ceiling on fragment count. Density alone would let a 4K viewport
   * uncap the per-frame cost; this is what actually bounds it.
   */
  maxFragments: number;
  /**
   * Random jitter applied to each fragment's grid position, as a fraction of
   * `spacing`. A perfect lattice reads as a texture swatch; a jittered one
   * reads as scatter that happens to have order in it.
   */
  jitter: number;
  /** Radius of pointer influence, in CSS pixels. */
  radius: number;
  /**
   * Falloff shape. 1 is linear; higher values keep the resolved core small
   * and tighten the gradient at the edge, which is what preserves signal
   * scarcity — only a few fragments are ever fully accent-colored.
   */
  falloff: number;
  /** Seconds for a fragment to resolve once fully inside the field. */
  settle: number;
  /**
   * Seconds for a fragment to decay back to noise. Deliberately longer than
   * `settle` — the asymmetry is what makes this read as a field rather than a
   * cursor. Mirrors `--lab-duration-field`.
   */
  decay: number;
  /** Segment length at rest (noise), in CSS pixels. */
  lengthNoise: number;
  /** Segment length when fully resolved, in CSS pixels. */
  lengthSignal: number;
  /** Line width at rest, in CSS pixels. */
  widthNoise: number;
  /** Line width when fully resolved, in CSS pixels. */
  widthSignal: number;
  /** Opacity at rest. */
  opacityNoise: number;
  /** Opacity when fully resolved. */
  opacitySignal: number;
  /**
   * The angle, in radians, that resolved fragments align to. 0 is horizontal.
   * A single shared target is what makes local order legible as *order*
   * rather than as a swirl.
   */
  alignment: number;

  /* ── Glyph field (Feature 4) ──────────────────────────────────────────
     A second, much finer set of fragments laid only over the headline's
     letterforms. A 30px ambient lattice cannot describe a glyph; these
     resolve *into the word* and are the only fragments that ever take the
     signal accent, which is what keeps the resolved headline the single
     accent-colored thing on screen. */

  /** Target spacing between glyph fragments, in CSS pixels. Fine enough to
   *  render a letterform, bounded by the headline box rather than the
   *  viewport so the extra count stays small. */
  glyphSpacing: number;
  /** Glyph segment length at rest (noise), in CSS pixels. */
  glyphLengthNoise: number;
  /** Glyph segment length when fully resolved, in CSS pixels. Kept close to
   *  `glyphSpacing` so resolved marks tile the stroke rather than overlap
   *  into a smear. */
  glyphLengthSignal: number;
  /** Glyph line width at rest, in CSS pixels. */
  glyphWidthNoise: number;
  /** Glyph line width when fully resolved, in CSS pixels. */
  glyphWidthSignal: number;
};

export const DEFAULT_TUNING: FieldTuning = {
  spacing: 30,
  maxFragments: 1600,
  jitter: 0.4,
  radius: 200,
  falloff: 1.5,
  settle: 0.32,
  decay: 0.9,
  lengthNoise: 8,
  lengthSignal: 20,
  widthNoise: 1,
  widthSignal: 1.6,
  opacityNoise: 0.8,
  opacitySignal: 1,
  alignment: 0,

  glyphSpacing: 6,
  glyphLengthNoise: 4,
  glyphLengthSignal: 7,
  glyphWidthNoise: 1,
  glyphWidthSignal: 1.5,
};

/* ═══════════════════════════════════════════════════════════════════════════
   Colors

   Read from the CSS custom properties by the caller and handed in, so the
   engine stays DOM-free and the field is correct in both themes.
   ═══════════════════════════════════════════════════════════════════════════ */

export type FieldColors = {
  /** The `--lab-noise-*` ramp, faintest first. Resolution walks up it. */
  noise: readonly [string, string, string, string];
  /** `--lab-signal` — the fully resolved end of the ramp. */
  signal: string;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Glyph mask (Feature 4)

   The headline is rasterized to a coverage buffer — one alpha byte per mask
   pixel — so the field can tell which fragments fall inside the letterforms.
   The engine stays DOM-free: the *caller* rasterizes the text (it owns the
   fonts and the layout) and hands the coverage buffer in. These functions are
   pure and so testable without a canvas (Feature 18).
   ═══════════════════════════════════════════════════════════════════════════ */

export type GlyphMask = {
  /** Coverage per mask pixel, 0–255, row-major, length `width * height`. */
  alpha: Uint8ClampedArray;
  /** Mask resolution in mask pixels. */
  width: number;
  height: number;
  /** Field-space (CSS px) position of mask pixel (0, 0). */
  originX: number;
  originY: number;
  /** CSS pixels per mask pixel. Below 1 when the mask is supersampled for a
   *  cleaner stroke-direction gradient. */
  scale: number;
};

/** Coverage at a field-space point, in `[0, 1]`. Nearest-sample — the mask is
 *  finer than the glyph lattice, so bilinear buys nothing here. */
function sampleCoverage(mask: GlyphMask, x: number, y: number): number {
  const mx = Math.floor((x - mask.originX) / mask.scale);
  const my = Math.floor((y - mask.originY) / mask.scale);
  if (mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) return 0;
  return mask.alpha[my * mask.width + mx] / 255;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Fragments
   ═══════════════════════════════════════════════════════════════════════════ */

export type Fragment = {
  /** Rest position in CSS pixels. Never changes — fragments do not travel. */
  x: number;
  y: number;
  /**
   * Orientation at rest, in radians. Stored already wrapped into the half
   * turn nearest `signalAngle` — see `nearestEquivalentAngle`.
   */
  noiseAngle: number;
  /**
   * Where this fragment settles when resolved. The shared alignment plus a
   * small per-fragment offset, so the field reads as ordered rather than as a
   * single hard-ruled line.
   */
  signalAngle: number;
  /** Current resolution in `[0, 1]`. 0 is noise, 1 is fully resolved. */
  resolve: number;
  /**
   * Whether this fragment lies inside a letterform. Glyph fragments resolve
   * into the headline and are the only ones that take the signal accent;
   * ambient fragments top out in the noise ramp.
   */
  inGlyph: boolean;
};

/**
 * A deterministic PRNG (mulberry32). Fragment layout must be stable across a
 * theme change or a tuning tweak — a reshuffle on every re-layout would make
 * tuning by eye impossible, since nothing would hold still between changes.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Wrap `angle` into the half turn nearest `target`.
 *
 * A line segment is symmetric: θ and θ+π draw the same mark. So the shortest
 * path from noise to alignment is never more than a quarter turn, and taking
 * it is the whole difference between fragments *settling* into order and
 * fragments visibly spinning to get there. Done once at layout rather than
 * per frame.
 */
function nearestEquivalentAngle(angle: number, target: number): number {
  const halfTurn = Math.PI;
  return angle - halfTurn * Math.round((angle - target) / halfTurn);
}

/** Coverage above which a glyph-lattice cell is treated as inside the ink.
 *  High enough to keep stray edge fragments out of the paper, low enough to
 *  catch a serif's thin strokes. */
const GLYPH_COVERAGE_THRESHOLD = 0.35;

/**
 * Lay out a field of fragments over a `width` × `height` area in CSS pixels.
 *
 * Two populations, when a `mask` is supplied:
 *
 * - **Ambient** — the Feature 3 grid at `tuning.spacing`, everywhere. These
 *   read as scatter and resolve only into grey local order; they never take
 *   the signal accent.
 * - **Glyph** — a much finer grid at `tuning.glyphSpacing`, laid over the
 *   headline's ink only, tagged `inGlyph`. These resolve *into the word* and
 *   are the only fragments that reach the signal color.
 *
 * Spacing is widened uniformly if the ambient count would exceed
 * `maxFragments`, so the ceiling thins the field evenly rather than clipping
 * it to a corner. Glyph count is bounded by the headline box, not the cap.
 */
export function createFragments(
  width: number,
  height: number,
  tuning: FieldTuning,
  seed = 1,
  mask?: GlyphMask,
): Fragment[] {
  if (width <= 0 || height <= 0) return [];

  const random = createRandom(seed);
  const fragments: Fragment[] = [];

  /* ── Ambient grid ─────────────────────────────────────────────────── */

  const area = width * height;
  const wanted = Math.floor(area / (tuning.spacing * tuning.spacing));
  const spacing =
    wanted > tuning.maxFragments
      ? Math.sqrt(area / tuning.maxFragments)
      : tuning.spacing;

  const columns = Math.max(1, Math.ceil(width / spacing));
  const rows = Math.max(1, Math.ceil(height / spacing));

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const jitterRange = spacing * tuning.jitter;
      // ±6° around the shared alignment. Enough to keep the resolved state
      // from looking mechanically ruled, small enough to still read as one
      // direction.
      const signalAngle = tuning.alignment + (random() - 0.5) * 0.21;

      fragments.push({
        x: (column + 0.5) * spacing + (random() - 0.5) * jitterRange,
        y: (row + 0.5) * spacing + (random() - 0.5) * jitterRange,
        noiseAngle: nearestEquivalentAngle(
          random() * Math.PI * 2,
          signalAngle,
        ),
        signalAngle,
        resolve: 0,
        inGlyph: false,
      });
    }
  }

  /* ── Glyph grid ───────────────────────────────────────────────────── */

  if (mask) {
    const maskWidthCss = mask.width * mask.scale;
    const maskHeightCss = mask.height * mask.scale;
    const glyphCols = Math.max(1, Math.ceil(maskWidthCss / tuning.glyphSpacing));
    const glyphRows = Math.max(1, Math.ceil(maskHeightCss / tuning.glyphSpacing));
    // Jitter is smaller here (a quarter cell): the glyph lattice is dense and
    // a bigger wobble smears the letterforms it is meant to describe.
    const jitterRange = tuning.glyphSpacing * 0.25;

    for (let row = 0; row < glyphRows; row += 1) {
      for (let column = 0; column < glyphCols; column += 1) {
        const x =
          mask.originX +
          (column + 0.5) * tuning.glyphSpacing +
          (random() - 0.5) * jitterRange;
        const y =
          mask.originY +
          (row + 0.5) * tuning.glyphSpacing +
          (random() - 0.5) * jitterRange;

        if (sampleCoverage(mask, x, y) < GLYPH_COVERAGE_THRESHOLD) continue;

        // Glyph fragments resolve to the same shared alignment as the ambient
        // field — "structure" reads as *order*, one direction, not as a woven
        // trace of each pen stroke. (Per-fragment stroke-direction sampling was
        // built and tried; it read as busy hatching. See the feature findings.)
        const signalAngle = tuning.alignment + (random() - 0.5) * 0.21;

        fragments.push({
          x,
          y,
          noiseAngle: nearestEquivalentAngle(random() * Math.PI * 2, signalAngle),
          signalAngle,
          resolve: 0,
          inGlyph: true,
        });
      }
    }
  }

  return fragments;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Simulation
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The largest delta the integrator will accept, in seconds. A backgrounded tab
 * or a long GC pause hands back a delta of seconds; without this clamp the
 * whole field would teleport to its target on the first frame after.
 */
const MAX_STEP = 1 / 30;

/**
 * Below this, a fragment is treated as having reached its target. Without it
 * exponential easing never quite arrives and the loop can never idle.
 */
const SETTLED_EPSILON = 0.002;

export type Pointer = { x: number; y: number } | null;

/**
 * Advance the field by `delta` seconds toward the influence of `pointer`.
 *
 * Returns `true` while anything is still moving. `false` means every fragment
 * has reached its target and the caller can stop scheduling frames until the
 * next pointer event — the field costs nothing at rest.
 */
export function stepField(
  fragments: Fragment[],
  pointer: Pointer,
  delta: number,
  tuning: FieldTuning,
): boolean {
  const step = Math.min(delta, MAX_STEP);
  const radiusSquared = tuning.radius * tuning.radius;
  let moving = false;

  for (const fragment of fragments) {
    let target = 0;

    if (pointer) {
      const dx = fragment.x - pointer.x;
      const dy = fragment.y - pointer.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < radiusSquared) {
        const distance = Math.sqrt(distanceSquared) / tuning.radius;
        target = Math.pow(1 - distance, tuning.falloff);
      }
    }

    const difference = target - fragment.resolve;

    if (Math.abs(difference) < SETTLED_EPSILON) {
      fragment.resolve = target;
      continue;
    }

    // Asymmetric: resolving is quick, decaying is slow. Framerate-independent
    // exponential approach, so the same curve plays out at 30 or 120 fps.
    const duration = difference > 0 ? tuning.settle : tuning.decay;
    const t = clamp01(1 - Math.exp((-step / duration) * 5));

    fragment.resolve = lerp(fragment.resolve, target, t);
    moving = true;
  }

  return moving;
}

/**
 * Push every fragment straight to its resolved state against `pointer`, with
 * no easing.
 *
 * This is the `prefers-reduced-motion` path: the composition still reads,
 * because a blank canvas would be a worse accessible experience than a static
 * one. Also used to seed the first frame.
 */
export function resolveFieldInstantly(
  fragments: Fragment[],
  pointer: Pointer,
  tuning: FieldTuning,
): void {
  // A step far larger than any easing duration collapses the approach to its
  // target, which is exactly the static frame we want.
  stepField(fragments, pointer, 1, { ...tuning, settle: 0, decay: 0 });
}

/**
 * The static hero frame for coarse pointers and `prefers-reduced-motion`:
 * the whole headline resolved, the ambient field left as scatter.
 *
 * A pointer-driven resolve only lights a radius-sized patch, so on a phone —
 * where the pointer may never arrive — it would show a fraction of a word.
 * This resolves every glyph fragment fully instead, so the finished headline
 * is what a touch visitor sees, over a calm grey field.
 */
export function resolveWordStatically(fragments: Fragment[]): void {
  for (const fragment of fragments) {
    fragment.resolve = fragment.inGlyph ? 1 : 0;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Drawing
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Resolution at which a fragment takes the signal accent.
 *
 * This value, the radius, and the falloff exponent together decide how many
 * fragments are ever accent-colored — the signal-scarcity rule in practice.
 * At the tuned defaults it works out to a core of roughly 50px, a handful of
 * hairlines. Raising it much further makes the accent vanish entirely, which
 * is what the first prototype pass did.
 */
const SIGNAL_THRESHOLD = 0.62;

/**
 * Pick a color for a given resolution.
 *
 * The noise ramp is walked as discrete steps rather than interpolated: the
 * tokens are authored as a four-step ramp of unresolved states, and stepping
 * through them keeps the field reading as *quantized* ambiguity resolving,
 * which suits the concept better than a smooth blend.
 *
 * The signal color is reserved for `inGlyph` fragments at the top of the
 * range. Ambient fragments cap at the brightest noise step no matter how
 * resolved — so the assembled headline is the only accent-colored thing on
 * screen, which is the signal-scarcity rule made literal (Feature 4).
 */
function colorFor(
  resolve: number,
  inGlyph: boolean,
  colors: FieldColors,
): string {
  if (inGlyph && resolve >= SIGNAL_THRESHOLD) return colors.signal;
  if (resolve >= 0.4) return colors.noise[3];
  if (resolve >= 0.22) return colors.noise[2];
  if (resolve >= 0.08) return colors.noise[1];
  return colors.noise[0];
}

/**
 * Draw the current state of the field.
 *
 * The caller is responsible for having scaled the context by
 * `devicePixelRatio`; `width` and `height` here are CSS pixels.
 */
export function drawField(
  context: CanvasRenderingContext2D,
  fragments: Fragment[],
  width: number,
  height: number,
  tuning: FieldTuning,
  colors: FieldColors,
): void {
  context.clearRect(0, 0, width, height);
  context.lineCap = "round";

  for (const fragment of fragments) {
    const { resolve, inGlyph } = fragment;
    const angle = lerp(fragment.noiseAngle, fragment.signalAngle, resolve);

    // Glyph fragments are short and fine so their marks tile a letterform
    // rather than overrun it; ambient fragments keep the coarser field sizes.
    const lengthNoise = inGlyph ? tuning.glyphLengthNoise : tuning.lengthNoise;
    const lengthSignal = inGlyph
      ? tuning.glyphLengthSignal
      : tuning.lengthSignal;
    const widthNoise = inGlyph ? tuning.glyphWidthNoise : tuning.widthNoise;
    const widthSignal = inGlyph ? tuning.glyphWidthSignal : tuning.widthSignal;

    const half = lerp(lengthNoise, lengthSignal, resolve) / 2;
    const dx = Math.cos(angle) * half;
    const dy = Math.sin(angle) * half;

    context.globalAlpha = lerp(
      tuning.opacityNoise,
      tuning.opacitySignal,
      resolve,
    );
    context.lineWidth = lerp(widthNoise, widthSignal, resolve);
    context.strokeStyle = colorFor(resolve, inGlyph, colors);

    context.beginPath();
    context.moveTo(fragment.x - dx, fragment.y - dy);
    context.lineTo(fragment.x + dx, fragment.y + dy);
    context.stroke();
  }

  context.globalAlpha = 1;
}
