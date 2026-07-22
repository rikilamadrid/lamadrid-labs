"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import {
  DEFAULT_TUNING,
  createFragments,
  drawField,
  resolveFieldInstantly,
  stepField,
  type FieldColors,
  type FieldTuning,
  type Fragment,
  type Pointer,
} from "@/lib/pointer-field";

/**
 * Canvas host for the pointer field.
 *
 * Everything that changes per frame lives in refs. The component renders once
 * and then never re-renders from pointer input — React is not in the animation
 * loop at all, which is what keeps a few hundred fragments cheap.
 */

type PointerFieldProps = {
  tuning?: FieldTuning;
  className?: string;
  /** Called each frame with the measured fps and live fragment count. */
  onFrame?: (fps: number, fragments: number) => void;
};

/** Where the field starts before the pointer has ever entered, as a fraction
 * of the canvas. Off-center and high, so the first frame is composed rather
 * than symmetrical. */
const RESTING_POINTER = { x: 0.32, y: 0.42 };

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

export function PointerField({
  tuning = DEFAULT_TUNING,
  className,
  onFrame,
}: PointerFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Survives re-runs of the effect below, so adjusting tuning mid-gesture does
  // not drop the field back to noise under the cursor.
  const pointerRef = useRef<Pointer>(null);

  // `onFrame` is a reporting hook, not an input — reading it through a ref
  // keeps a caller's inline arrow from tearing down the loop every render.
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let fragments: Fragment[] = [];
    let colors = readColors(canvas);
    let width = 0;
    let height = 0;
    let frame: number | null = null;
    let lastTime = 0;
    let disposed = false;

    /* ── Drawing ──────────────────────────────────────────────────────── */

    const draw = () => {
      drawField(context, fragments, width, height, tuning, colors);
    };

    /* ── The loop ─────────────────────────────────────────────────────── */

    // The loop idles: when every fragment has reached its target it stops
    // scheduling frames, and a pointer event wakes it. A settled field costs
    // nothing, which matters most on the mobile devices least able to afford
    // it.
    const tick = (time: number) => {
      frame = null;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const moving = stepField(fragments, pointerRef.current, delta, tuning);
      draw();

      if (onFrameRef.current && delta > 0) {
        onFrameRef.current(1 / delta, fragments.length);
      }

      if (moving) schedule();
    };

    const schedule = () => {
      if (disposed || frame !== null) return;
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame === null) lastTime = performance.now();
      schedule();
    };

    /* ── Sizing ───────────────────────────────────────────────────────── */

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      width = rect.width;
      height = rect.height;

      // Cap DPR at 2: beyond that the extra pixels are invisible on these
      // hairlines but the fill cost is real, and phones are exactly where
      // both the highest DPRs and the tightest budgets are.
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Layout is seeded, so a resize or theme change re-derives the same
      // fragment positions rather than reshuffling the field.
      fragments = createFragments(width, height, tuning);

      if (reducedMotion) {
        // No loop at all — one composed static frame.
        resolveFieldInstantly(
          fragments,
          pointerRef.current ?? {
            x: width * RESTING_POINTER.x,
            y: height * RESTING_POINTER.y,
          },
          tuning,
        );
        draw();
        return;
      }

      draw();
      wake();
    };

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);

    /* ── Input ────────────────────────────────────────────────────────── */

    // `pointermove` covers mouse, pen, and touch. Nothing is prevented, so a
    // finger dragged across the canvas still scrolls the page.
    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      wake();
    };

    const handlePointerLeave = () => {
      pointerRef.current = null;
      wake();
    };

    if (!reducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerleave", handlePointerLeave);
      window.addEventListener("pointercancel", handlePointerLeave);
    }

    /* ── Theme ────────────────────────────────────────────────────────── */

    // The theme system writes `data-theme` on <html>; re-read the tokens when
    // it flips so the field is correct in both themes without a remount.
    const themeObserver = new MutationObserver(() => {
      colors = readColors(canvas);
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    layout();

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointercancel", handlePointerLeave);
    };
    // `tuning` rebuilds the whole rig rather than being read through a ref:
    // spacing changes the fragment count, so a re-layout is required anyway,
    // and the field is seeded and the pointer persisted, so the rebuild is
    // invisible. It only happens when the prototype's tuning panel moves.
  }, [reducedMotion, tuning]);

  // Decorative. The semantic content of any page using the field lives in the
  // DOM above it.
  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
