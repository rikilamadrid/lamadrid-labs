"use client";

import { useEffect, useRef } from "react";
import { useShell } from "@/components/shell/ShellProvider";
import { SignalEngine } from "@/lib/signal/engine";
import { configForView } from "@/lib/signal/config";
import { LAYERS } from "@/lib/signal/layers";

/**
 * The one persistent Signal / Noise canvas for the whole shell.
 *
 * Mounted once in the shell root (a sibling of the stage, never inside a state
 * that unmounts), so a single `SignalEngine` — one canvas, one loop, one input
 * system, one field — survives every state change. States never own a canvas;
 * they hand the engine a configuration and it morphs toward it. Here that is the
 * only React responsibility: construct the engine once, and re-`configure` it
 * when the active view changes.
 *
 * The canvas sits at `LAYERS.field`, between the intentional visual DOM the field
 * draws *over* (Home's `<h1>`, at `contentBelow`) and the readable state DOM it
 * draws *under* (copy / index / previews, at `content`). It is `pointer-events:
 * none` — the engine listens on `window`, so the field reacts everywhere while
 * every control beneath it stays clickable.
 */
export function SignalSurface() {
  const { view } = useShell();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SignalEngine | null>(null);

  // Construct once. The engine is framework-free and drives the canvas directly;
  // React never enters its animation loop. The initial config is read from the
  // view at construction so first paint matches the current state.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new SignalEngine(canvas, configForView(view));
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount-only: `view` is read for the *initial* config; later changes flow
    // through the `configure` effect below, which morphs the live engine instead
    // of tearing it down.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Morph, never remount, on a state change. `configForView` returns a stable
  // per-view object, so `configure` no-ops when the config is unchanged.
  useEffect(() => {
    engineRef.current?.configure(configForView(view));
  }, [view]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: LAYERS.field }}
    />
  );
}
