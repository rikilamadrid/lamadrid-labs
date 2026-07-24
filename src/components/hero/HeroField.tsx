"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import {
  DEFAULT_TUNING,
  createCornerPull,
  createFragments,
  drawField,
  resolveWordStatically,
  stepCornerPull,
  stepField,
  type FieldColors,
  type Fragment,
  type GlyphMask,
  type Pointer,
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
  type SignalColors,
} from "@/lib/pointer-signal";
import {
  cornerPoint,
  getShellSignal,
  subscribeShellSignal,
} from "@/lib/shell-signal";

/**
 * The hero's pointer field — the Feature 3 engine, now carrying the headline.
 *
 * The `<h1>` lives in the DOM (it is the accessible, indexable, first-paint
 * copy) and sits *below* this canvas. Its text is rasterized to a coverage
 * mask so the field knows which fragments fall inside the letterforms; those
 * resolve into the word in the signal accent, overlaying the muted DOM text
 * and sharpening it under the pointer. Everything else is ambient scatter that
 * only ever resolves to grey.
 *
 * As in Feature 3: pointer position lives in a ref, React is never in the
 * animation loop, and the loop idles when the field has settled. Coarse
 * pointers and `prefers-reduced-motion` skip the loop entirely and render one
 * static frame with the whole word resolved — a phone visitor, who may never
 * move a pointer, still sees the finished headline.
 */

type HeroFieldProps = {
  /** The `<h1>`. Its `[data-hero-line]` children are rasterized to the mask. */
  headingRef: React.RefObject<HTMLElement | null>;
  /** Re-rasterize when this changes — the headline text differs per locale. */
  localeKey: string;
  className?: string;
};

/** Mask oversample. A 2× coverage buffer gives the stroke-direction gradient
 *  something smoother than a 1px-hard edge to read. */
const MASK_SUPERSAMPLE = 2;
/** Slack around the headline box so round line caps at the ink edge are not
 *  clipped by the mask bounds. */
const MASK_PADDING = 10;

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

/**
 * Rasterize the headline's line elements to a coverage mask in the canvas's
 * own coordinate space (CSS pixels, origin at the canvas top-left).
 *
 * Returns `null` when there is nothing to rasterize yet — no lines, zero size,
 * or a canvas that has not been laid out — in which case the field runs
 * ambient-only rather than erroring.
 */
function buildGlyphMask(
  canvas: HTMLCanvasElement,
  heading: HTMLElement,
): GlyphMask | null {
  const lines = Array.from(
    heading.querySelectorAll<HTMLElement>("[data-hero-line]"),
  );
  if (lines.length === 0) return null;

  const canvasRect = canvas.getBoundingClientRect();
  if (canvasRect.width === 0 || canvasRect.height === 0) return null;

  // Union bounding box of every line, in canvas-local CSS pixels.
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const line of lines) {
    const rect = line.getBoundingClientRect();
    left = Math.min(left, rect.left - canvasRect.left);
    top = Math.min(top, rect.top - canvasRect.top);
    right = Math.max(right, rect.right - canvasRect.left);
    bottom = Math.max(bottom, rect.bottom - canvasRect.top);
  }

  const originX = left - MASK_PADDING;
  const originY = top - MASK_PADDING;
  const cssWidth = right - left + MASK_PADDING * 2;
  const cssHeight = bottom - top + MASK_PADDING * 2;
  if (cssWidth <= 0 || cssHeight <= 0) return null;

  const scale = 1 / MASK_SUPERSAMPLE;
  const maskWidth = Math.ceil(cssWidth * MASK_SUPERSAMPLE);
  const maskHeight = Math.ceil(cssHeight * MASK_SUPERSAMPLE);

  const off = document.createElement("canvas");
  off.width = maskWidth;
  off.height = maskHeight;
  const ctx = off.getContext("2d");
  if (!ctx) return null;

  ctx.scale(MASK_SUPERSAMPLE, MASK_SUPERSAMPLE);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (const line of lines) {
    const rect = line.getBoundingClientRect();
    // `rect` is the line *block*, which is full-width; its `left` is not where
    // the text ink starts once the headline is centered (or right-aligned). A
    // range over the line's contents gives the text's true horizontal box, so
    // the mask registers against the rendered glyphs instead of the block edge.
    const range = document.createRange();
    range.selectNodeContents(line);
    const textRect = range.getBoundingClientRect();
    const styles = getComputedStyle(line);
    // Build the font shorthand by hand — `styles.font` is empty in several
    // browsers when the longhands are set individually.
    ctx.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;

    const text = line.textContent ?? "";
    const metrics = ctx.measureText(text);
    // Match the browser's line-box model, not the ink box: the font's em box
    // (font-bounding ascent + descent) is centered in the line box with equal
    // leading top and bottom, and the alphabetic baseline sits at the font
    // ascent within it. Using ink metrics instead misregisters the mask
    // against the DOM text — it reads as a strikethrough.
    const fontAscent =
      metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent;
    const fontDescent =
      metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent;
    const leading = (rect.height - (fontAscent + fontDescent)) / 2;

    // Horizontal from the text box (accounts for centering); vertical from the
    // block's line box (the leading model above is relative to it).
    const lineLeft = textRect.left - canvasRect.left - originX;
    const lineTop = rect.top - canvasRect.top - originY;
    const baseline = lineTop + leading + fontAscent;

    ctx.fillText(text, lineLeft, baseline);
  }

  const image = ctx.getImageData(0, 0, maskWidth, maskHeight).data;
  const alpha = new Uint8ClampedArray(maskWidth * maskHeight);
  for (let i = 0; i < alpha.length; i += 1) {
    alpha[i] = image[i * 4 + 3];
  }

  return { alpha, width: maskWidth, height: maskHeight, originX, originY, scale };
}

export function HeroField({ headingRef, localeKey, className }: HeroFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pointerRef = useRef<Pointer>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const heading = headingRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Only reduced motion is fully static. Touch devices get a live field too:
    // the word rests resolved (a phone visitor who never touches still sees the
    // finished headline) and a dragging finger drives the ambient field just as
    // the mouse does on desktop — the same "structure follows the pointer"
    // interaction, by touch.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const staticOnly = reducedMotion;
    const touchMode = coarsePointer && !reducedMotion;

    let fragments: Fragment[] = [];
    let colors = readColors(canvas);
    let signalColors = readSignalColors(canvas);
    let width = 0;
    let height = 0;
    let frame: number | null = null;
    let lastTime = 0;
    let disposed = false;

    // The velocity-driven foreground: a signal core and directional wake. The
    // channel split and acid accent are motion artifacts, so they ride along
    // on every live path (desktop and touch) but never on the static frame.
    const motion = createPointerMotion();
    const trail = createTrail();
    const pulse = createPulse();
    // The corner nav reaching into the field: a hovered corner leans the ambient
    // static toward it. Read from the shared signal each tick (never React).
    const cornerPull = createCornerPull();

    const draw = () => {
      drawField(context, fragments, width, height, DEFAULT_TUNING, colors, cornerPull);
      drawTrail(context, trail, signalColors, true);
      drawPulse(context, pulse, signalColors);
      drawCore(context, motion, signalColors, true);
    };

    const tick = (time: number) => {
      frame = null;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const hovered = getShellSignal().hoveredCorner;
      const cornerTarget = hovered ? cornerPoint(hovered, width, height) : null;
      const pullActive = stepCornerPull(cornerPull, cornerTarget, delta);

      const fieldMoving = stepField(fragments, pointerRef.current, delta, DEFAULT_TUNING);
      const motionActive = stepPointerMotion(motion, pointerRef.current, delta);
      const trailActive = stepTrail(trail, motion, delta);
      const pulseActive = stepPulse(pulse, delta);
      // On touch the headline stays resolved regardless of the finger — the
      // finger only sculpts the ambient field around it. (On desktop the word
      // resolves under the pointer instead, so this override is touch-only.)
      if (touchMode) {
        for (const fragment of fragments) {
          if (fragment.inGlyph) fragment.resolve = 1;
        }
      }
      draw();
      if (fieldMoving || motionActive || trailActive || pulseActive || pullActive)
        schedule();
    };

    const schedule = () => {
      if (disposed || frame !== null) return;
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame === null) lastTime = performance.now();
      schedule();
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      width = rect.width;
      height = rect.height;

      // Cap DPR at 2 — beyond it the extra pixels are invisible on these
      // hairlines but the fill cost is real, and phones carry both the highest
      // DPRs and the tightest budgets.
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const mask = heading ? buildGlyphMask(canvas, heading) : undefined;
      fragments = createFragments(width, height, DEFAULT_TUNING, 1, mask ?? undefined);

      if (staticOnly) {
        resolveWordStatically(fragments);
        draw();
        return;
      }

      // Touch rests with the word resolved and the ambient field calm; the loop
      // stays parked until the first finger drag wakes it (see the pointer
      // listeners), so idle phones pay nothing.
      if (touchMode) {
        resolveWordStatically(fragments);
        draw();
        return;
      }

      draw();
      wake();
    };

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);

    // The webfont (Instrument Serif) may load after first paint; a mask built
    // against the fallback face describes the wrong letterforms. Rebuild once
    // it is ready.
    let fontsPending = true;
    document.fonts.ready.then(() => {
      if (!disposed && fontsPending) {
        fontsPending = false;
        layout();
      }
    });

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      wake();
    };

    const handlePointerLeave = () => {
      pointerRef.current = null;
      wake();
    };

    const handlePointerDown = (event: PointerEvent) => {
      // Primary pointer only — a second finger or a right button must not stack
      // pulses. `firePulse` overwrites any pulse in flight, so this stays cheap.
      if (!event.isPrimary) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointerRef.current = { x, y };
      // Fire at the press point (robust for a cold touch tap, where the detector
      // has not yet moved there), carrying the detector's current energy so a
      // click mid-flick throws a wider, brighter burst than a click from rest.
      firePulse(pulse, x, y, motion.present ? motion.energy : 0);
      wake();
    };

    // A nav hover reaches into the field even when the pointer is nowhere near
    // the canvas, so the idle loop must be woken by the signal itself.
    let unsubscribeShell: (() => void) | null = null;

    if (!staticOnly) {
      // `passive` and no `preventDefault`: a finger dragged across the hero
      // still scrolls any scrollable content underneath. On touch, `pointermove`
      // only fires while a finger is down, so a drag is what drives the field;
      // `pointerup` lets the ambient order decay back once the finger lifts.
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerDown, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave);
      window.addEventListener("pointercancel", handlePointerLeave);
      window.addEventListener("pointerup", handlePointerLeave);
      unsubscribeShell = subscribeShellSignal(wake);
    }

    // Re-read tokens when the theme flips, and repaint. A static frame repaints
    // in place; a live field's next tick already reads the new `colors`.
    const themeObserver = new MutationObserver(() => {
      colors = readColors(canvas);
      signalColors = readSignalColors(canvas);
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    layout();

    return () => {
      disposed = true;
      fontsPending = false;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointercancel", handlePointerLeave);
      window.removeEventListener("pointerup", handlePointerLeave);
      unsubscribeShell?.();
    };
    // `localeKey` is a dependency: a locale switch rewrites the headline in the
    // DOM, so the mask and fragments must be rebuilt against the new text.
  }, [reducedMotion, localeKey, headingRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
