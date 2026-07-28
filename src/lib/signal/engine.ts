import {
  createAmbientFragments,
  createGlyphFragments,
  createCornerPull,
  createRowBand,
  drawField,
  resolveWordStatically,
  stepCornerPull,
  stepField,
  stepRowBand,
  type CornerPull,
  type FieldColors,
  type Fragment,
  type Pointer,
  type RowBand,
} from "@/lib/pointer-field";
import {
  createPointerMotion,
  createPulse,
  createTrail,
  drawCore,
  drawPulse,
  drawTrail,
  firePulse,
  stepPointerMotion,
  stepPulse,
  stepTrail,
  type PointerMotion,
  type Pulse,
  type SignalColors,
  type Trail,
} from "@/lib/pointer-signal";
import {
  cornerPoint,
  getShellSignal,
  subscribeShellSignal,
} from "@/lib/shell-signal";
import { getSpotlight, subscribeSpotlight } from "@/lib/spotlight-signal";
import { buildGlyphMask } from "@/lib/signal/glyph-mask";
import { getHeadlineElement, subscribeHeadline } from "@/lib/signal/headline-signal";
import type { SignalEngineConfig } from "@/lib/signal/config";
import { clamp01, lerp } from "@/lib/math";

/**
 * The one Signal / Noise engine.
 *
 * A single persistent canvas, a single animation loop, a single input system,
 * a single field state — configured per application state rather than
 * re-implemented per state. Home and Work (and, later, About / Contact and the
 * project universes) are *configurations* of this one engine; switching states
 * calls `configure`, which morphs the live field toward the new configuration
 * instead of clearing and recreating it. The ambient field, pointer momentum,
 * trail, and pulses all survive a state change.
 *
 * Framework-free by design: it is handed a canvas and drives it directly, so
 * React never enters the animation path. It reproduces exactly what the former
 * per-state `HeroField` and `WorkField` did — the behavior lives in the shared
 * primitives (`pointer-field`, `pointer-signal`); this host only orchestrates
 * which ones are live and feeds them one input stream.
 */

/** Fixed ambient layout seed. One persistent scatter shared by every state, so
 *  the field never re-shuffles on a state change — it is the same noise being
 *  reorganized, not a new field. */
const AMBIENT_SEED = 1;
/** Presence (canvas master opacity) ease constant, seconds — a calm fade when a
 *  state joins or leaves the field (Home/Work ↔ About/Contact). */
const PRESENCE_TAU = 0.28;
const PRESENCE_EPSILON = 0.004;

export class SignalEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private config: SignalEngineConfig;

  // Render mode, derived from the environment. Only reduced motion is fully
  // static; a coarse pointer gets a live field that rests and wakes on a drag.
  private staticOnly: boolean;
  private touchMode: boolean;

  private width = 0;
  private height = 0;
  // Canvas origin in viewport CSS px — the Work index publishes its band target
  // in viewport coords, so the loop localizes it against this.
  private originLeft = 0;
  private originTop = 0;

  // The field. `ambient` persists across state changes; `glyph` is the headline
  // population, rebuilt when the registered headline or the `headline` flag
  // changes. `fragments` is the two concatenated (ambient objects are shared by
  // reference, so their resolve state survives a glyph rebuild).
  private ambient: Fragment[] = [];
  private glyph: Fragment[] = [];
  private fragments: Fragment[] = [];

  // Foreground signal primitives — always instantiated, stepped/drawn per config.
  private readonly motion: PointerMotion = createPointerMotion();
  private readonly trail: Trail = createTrail();
  private readonly pulse: Pulse = createPulse();
  private readonly cornerPull: CornerPull = createCornerPull();
  private readonly rowBand: RowBand = createRowBand();

  private colors: FieldColors;
  private signalColors: SignalColors;

  private pointer: Pointer = null;
  private headlineEl: HTMLElement | null = null;
  private presence: number;

  private frame: number | null = null;
  private lastTime = 0;
  private disposed = false;
  private seenActivation: number;

  private readonly cleanups: Array<() => void> = [];

  constructor(canvas: HTMLCanvasElement, config: SignalEngineConfig) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("SignalEngine: 2D context unavailable");
    this.context = context;
    this.config = config;
    this.presence = config.presence;
    this.colors = readColors(canvas);
    this.signalColors = readSignalColors(canvas);
    this.seenActivation = getShellSignal().activationNonce;
    this.headlineEl = getHeadlineElement();

    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseMq = window.matchMedia("(pointer: coarse)");
    this.staticOnly = reducedMotionMq.matches;
    this.touchMode = coarseMq.matches && !reducedMotionMq.matches;

    canvas.style.opacity = String(this.presence);

    // ── Lifecycle: resize, fonts, theme, reduced-motion, visibility ──
    const resizeObserver = new ResizeObserver(() => this.layout());
    resizeObserver.observe(canvas);
    this.cleanups.push(() => resizeObserver.disconnect());

    // The webfont may load after first paint; a mask built against the fallback
    // face describes the wrong letterforms. Rebuild once it is ready.
    let fontsPending = true;
    document.fonts.ready.then(() => {
      if (!this.disposed && fontsPending) {
        fontsPending = false;
        this.layout();
      }
    });
    this.cleanups.push(() => {
      fontsPending = false;
    });

    const themeObserver = new MutationObserver(() => {
      this.colors = readColors(canvas);
      this.signalColors = readSignalColors(canvas);
      this.draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    this.cleanups.push(() => themeObserver.disconnect());

    const onReducedMotionChange = () => {
      this.staticOnly = reducedMotionMq.matches;
      this.touchMode = coarseMq.matches && !reducedMotionMq.matches;
      this.layout();
    };
    reducedMotionMq.addEventListener("change", onReducedMotionChange);
    this.cleanups.push(() =>
      reducedMotionMq.removeEventListener("change", onReducedMotionChange),
    );

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !this.staticOnly) this.wake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    this.cleanups.push(() =>
      document.removeEventListener("visibilitychange", onVisibility),
    );

    // ── Input: one pointer stream feeds the whole field ──
    if (!this.staticOnly) {
      const onMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        this.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        this.wake();
      };
      const onLeave = () => {
        this.pointer = null;
        this.wake();
      };
      const onDown = (event: PointerEvent) => {
        // Primary pointer only — a second finger or right button must not stack
        // pulses. Fire at the press point (robust for a cold touch tap), carrying
        // the detector's current energy.
        if (!event.isPrimary) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.pointer = { x, y };
        if (this.config.primitives.pulse) {
          firePulse(this.pulse, x, y, this.motion.present ? this.motion.energy : 0);
        }
        this.wake();
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      window.addEventListener("pointercancel", onLeave);
      window.addEventListener("pointerup", onLeave);
      this.cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("pointercancel", onLeave);
        window.removeEventListener("pointerup", onLeave);
      });

      // A nav hover or a Work selection reaches into the field even when the
      // pointer is nowhere near it, so the idle loop must be woken by the buses.
      this.cleanups.push(subscribeShellSignal(() => this.wake()));
      this.cleanups.push(subscribeSpotlight(() => this.wake()));
    }

    // The headline the field resolves is published on a bus (Home registers its
    // <h1>; other states clear it). Subscribe unconditionally — a reduced-motion
    // field still needs to build the static resolved word.
    this.cleanups.push(subscribeHeadline(() => this.refreshHeadline()));

    this.layout();
  }

  /** Switch which state the one field is expressing. Morphs, never remounts. */
  configure(config: SignalEngineConfig) {
    if (config === this.config) return;
    const headlineChanged = config.headline !== this.config.headline;
    this.config = config;

    if (headlineChanged) this.rebuildGlyph();

    if (this.staticOnly) {
      // Reduced motion switches configurations quickly and calmly — no ease.
      this.presence = config.presence;
      this.canvas.style.opacity = String(this.presence);
      this.applyStaticResolve();
      this.draw();
      return;
    }
    // Wake so the presence fade, band, and primitive changes animate in.
    this.wake();
  }

  /** Re-read the published headline element and rebuild the glyph population.
   *  Bound to the headline bus, so it fires on register, text (locale) change,
   *  and clear. */
  private refreshHeadline() {
    this.headlineEl = getHeadlineElement();
    this.rebuildGlyph();
    if (this.staticOnly) {
      this.applyStaticResolve();
      this.draw();
    } else {
      this.wake();
    }
  }

  dispose() {
    this.disposed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups.length = 0;
  }

  /* ── Field construction ─────────────────────────────────────────────── */

  private layout() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.width = rect.width;
    this.height = rect.height;
    this.originLeft = rect.left;
    this.originTop = rect.top;

    // Cap DPR at 2 — beyond it the extra pixels are invisible on these hairlines
    // but the fill cost is real, and phones carry both the highest DPRs and the
    // tightest budgets.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.ambient = createAmbientFragments(
      this.width,
      this.height,
      this.config.tuning,
      AMBIENT_SEED,
    );
    this.rebuildGlyph();

    this.canvas.style.opacity = String(this.presence);

    if (this.staticOnly) {
      this.applyStaticResolve();
      this.draw();
      return;
    }
    if (this.touchMode) {
      // Rest with the headline resolved (Home) or calm (Work); park the loop
      // until the first finger drag wakes it, so an idle phone pays nothing.
      if (this.config.touchResolvesHeadline) resolveWordStatically(this.fragments);
      this.draw();
      return;
    }
    this.draw();
    this.wake();
  }

  /** Rebuild only the glyph (headline) population, keeping the ambient field —
   *  and its live resolve state — intact. */
  private rebuildGlyph() {
    if (this.config.headline && this.headlineEl) {
      const mask = buildGlyphMask(this.canvas, this.headlineEl);
      this.glyph = mask
        ? createGlyphFragments(mask, this.config.tuning, AMBIENT_SEED)
        : [];
    } else {
      this.glyph = [];
    }
    this.fragments = this.glyph.length
      ? this.ambient.concat(this.glyph)
      : this.ambient;
  }

  /** The static / reduced-motion resting frame: the headline resolved (Home),
   *  the ambient field left as calm scatter (both). */
  private applyStaticResolve() {
    resolveWordStatically(this.fragments);
  }

  /* ── Loop ───────────────────────────────────────────────────────────── */

  private schedule() {
    if (this.disposed || this.frame !== null) return;
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private wake() {
    if (this.staticOnly) return;
    if (this.frame === null) this.lastTime = performance.now();
    this.schedule();
  }

  private tick(time: number) {
    this.frame = null;
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const { primitives } = this.config;

    // ── Corner pull: always stepped so it relaxes out when disabled ──
    const hovered = getShellSignal().hoveredCorner;
    const cornerTarget =
      primitives.cornerPull && hovered
        ? cornerPoint(hovered, this.width, this.height)
        : null;
    const pullActive = stepCornerPull(this.cornerPull, cornerTarget, delta);

    // ── Corner activation → a directed pulse thrown toward the corner ──
    const signal = getShellSignal();
    if (signal.activationNonce !== this.seenActivation) {
      this.seenActivation = signal.activationNonce;
      if (primitives.pulse && signal.activationCorner) {
        firePulse(
          this.pulse,
          this.width / 2,
          this.height / 2,
          Math.max(this.motion.energy, 0.5),
          cornerPoint(signal.activationCorner, this.width, this.height),
        );
      }
    }

    // ── Row band: always stepped so it eases out when disabled ──
    const bandSource = primitives.rowBand ? getSpotlight() : null;
    const bandTarget = bandSource
      ? {
          y: bandSource.clientY - this.originTop,
          centerX: bandSource.clientX - this.originLeft,
          signal: bandSource.signal,
        }
      : null;
    const bandActive = stepRowBand(this.rowBand, bandTarget, delta);

    // ── Field + foreground ──
    const fieldMoving = stepField(this.fragments, this.pointer, delta, this.config.tuning);
    const motionActive = stepPointerMotion(this.motion, this.pointer, delta);
    const trailActive = primitives.trail ? stepTrail(this.trail, this.motion, delta) : false;
    const pulseActive =
      primitives.pulse || this.pulse.active ? stepPulse(this.pulse, delta) : false;

    // On touch the headline stays resolved regardless of the finger — the finger
    // only sculpts the ambient field around it.
    if (this.touchMode && this.config.touchResolvesHeadline) {
      for (const fragment of this.fragments) {
        if (fragment.inGlyph) fragment.resolve = 1;
      }
    }

    // ── Presence (master opacity) ease ──
    const presenceMoving = this.stepPresence(delta);

    this.draw();

    if (
      fieldMoving ||
      motionActive ||
      trailActive ||
      pulseActive ||
      pullActive ||
      bandActive ||
      presenceMoving
    ) {
      this.schedule();
    }
  }

  private stepPresence(delta: number): boolean {
    const target = this.config.presence;
    if (Math.abs(this.presence - target) < PRESENCE_EPSILON) {
      if (this.presence !== target) {
        this.presence = target;
        this.canvas.style.opacity = String(target);
      }
      return false;
    }
    const t = 1 - Math.exp(-Math.min(delta, 1 / 30) / PRESENCE_TAU);
    this.presence = lerp(this.presence, target, t);
    this.canvas.style.opacity = String(clamp01(this.presence));
    return true;
  }

  /* ── Draw ───────────────────────────────────────────────────────────── */

  private draw() {
    const { primitives } = this.config;
    drawField(
      this.context,
      this.fragments,
      this.width,
      this.height,
      this.config.tuning,
      this.colors,
      primitives.cornerPull ? this.cornerPull : undefined,
      primitives.rowBand ? this.rowBand : undefined,
    );
    if (primitives.trail) drawTrail(this.context, this.trail, this.signalColors, true);
    if (primitives.pulse) drawPulse(this.context, this.pulse, this.signalColors);
    if (primitives.core) drawCore(this.context, this.motion, this.signalColors, true);
  }
}

function readColors(element: HTMLElement): FieldColors {
  const styles = getComputedStyle(element);
  const read = (token: string) => styles.getPropertyValue(token).trim();
  return {
    noise: [
      read("--lab-noise-1"),
      read("--lab-noise-2"),
      read("--lab-noise-3"),
      read("--lab-noise-4"),
    ],
    signal: read("--lab-signal"),
  };
}

function readSignalColors(element: HTMLElement): SignalColors {
  const styles = getComputedStyle(element);
  const read = (token: string) => styles.getPropertyValue(token).trim();
  return {
    signal: read("--lab-signal"),
    signalStrong: read("--lab-signal-strong"),
    energy: read("--lab-energy"),
  };
}
