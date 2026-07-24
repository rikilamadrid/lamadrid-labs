"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import {
  DEFAULT_TUNING,
  createFragments,
  drawField,
  resolveWordStatically,
  stepField,
  type Fragment,
  type FieldColors,
  type Pointer,
} from "@/lib/pointer-field";

/**
 * The Work stage's shared Signal / Noise environment.
 *
 * This is the *same* pointer-field engine the hero uses (see `HeroField`),
 * running here as an ambient field with no headline mask — the field the Work
 * index and the project previews sit inside, so opening Work reads as the home
 * environment reorganizing rather than a separate page. The canvas owns the
 * environment only: background lattice and pointer/touch influence today; wake,
 * click pulse, and preview coupling layer onto this same canvas in later phases.
 *
 * As in `HeroField`: pointer position lives in a ref, React is never in the
 * animation loop, the loop idles when the field settles and pauses when the tab
 * is hidden. Reduced motion and coarse pointers render a single calm static
 * frame. The canvas is decorative (`aria-hidden`, `pointer-events-none`); the
 * DOM index and previews above it own all interaction and semantics.
 */
export function WorkField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pointerRef = useRef<Pointer>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const staticOnly = reducedMotion || coarsePointer;

    let fragments: Fragment[] = [];
    let colors = readColors(canvas);
    let width = 0;
    let height = 0;
    let frame: number | null = null;
    let lastTime = 0;
    let disposed = false;

    const draw = () =>
      drawField(context, fragments, width, height, DEFAULT_TUNING, colors);

    const tick = (time: number) => {
      frame = null;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      const moving = stepField(fragments, pointerRef.current, delta, DEFAULT_TUNING);
      draw();
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

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = rect.width;
      height = rect.height;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      fragments = createFragments(width, height, DEFAULT_TUNING, 7);

      if (staticOnly) {
        // A calm resting field; nothing resolves to signal without a pointer.
        resolveWordStatically(fragments);
        draw();
        return;
      }
      draw();
      wake();
    };

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      wake();
    };
    const clearPointer = () => {
      pointerRef.current = null;
      wake();
    };

    if (!staticOnly) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", clearPointer);
      window.addEventListener("pointercancel", clearPointer);
      window.addEventListener("pointerup", clearPointer);
    }

    // Stop burning frames while the tab is backgrounded; resume on return.
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !staticOnly) wake();
    };
    document.addEventListener("visibilitychange", onVisibility);

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
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("pointercancel", clearPointer);
      window.removeEventListener("pointerup", clearPointer);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
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
