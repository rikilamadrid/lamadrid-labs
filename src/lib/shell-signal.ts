/**
 * A tiny DOM-free channel from the corner navigation to the field engines.
 *
 * The nav is React; the Signal / Noise field runs a framework-free rAF loop that
 * deliberately keeps React out of the animation path (see `pointer-field.ts`).
 * They still have to talk: a hovered corner should *pull* the ambient static
 * toward it, and an activated corner should throw a directed pulse that way. This
 * module is that seam — a mutable singleton the nav writes and the field loops
 * read each tick, with a subscribe hook so a hover can *wake* an idle loop.
 *
 * It is intentionally not React state: putting it in context would re-render the
 * canvas components on every hover, and the loop would still have to read a ref.
 * A module singleton is read straight from inside `tick` with zero allocation.
 */

import type { Corner } from "@/data/navigation";

type ShellSignalState = {
  /** Corner currently hovered / focused in the nav, or `null` when none is. */
  hoveredCorner: Corner | null;
  /** The corner of the most recent activation (click / keyboard), or `null`. */
  activationCorner: Corner | null;
  /** Bumped on every activation so a loop can detect one it has not yet
   *  consumed, even when the same corner fires twice in a row. */
  activationNonce: number;
};

const state: ShellSignalState = {
  hoveredCorner: null,
  activationCorner: null,
  activationNonce: 0,
};

const listeners = new Set<() => void>();

/** Read the live signal. The returned object is the singleton — read fields off
 *  it each tick; do not retain a copy. */
export function getShellSignal(): Readonly<ShellSignalState> {
  return state;
}

/** Subscribe to any change (hover or activation). Returns an unsubscribe. Field
 *  loops use this to wake themselves when the nav reaches into the field. */
export function subscribeShellSignal(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

/** The field-space anchor a corner pulls toward. The corner controls sit at the
 *  viewport corners and the field fills the viewport, so the canvas corners are
 *  the right targets — the static leans to the actual control, not an inset
 *  point. Shared by every field surface so they all lean identically. */
export function cornerPoint(
  corner: Corner,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: corner === "tr" || corner === "br" ? width : 0,
    y: corner === "bl" || corner === "br" ? height : 0,
  };
}

/** Set (or clear) the hovered corner. No-ops when unchanged so a stream of
 *  identical `pointermove`s does not wake the loop repeatedly. */
export function setHoveredCorner(corner: Corner | null): void {
  if (state.hoveredCorner === corner) return;
  state.hoveredCorner = corner;
  notify();
}

/** Record a corner activation. Always notifies, even for a repeat corner, so a
 *  double activation fires two pulses rather than being coalesced away. */
export function fireCornerActivation(corner: Corner): void {
  state.activationCorner = corner;
  state.activationNonce += 1;
  notify();
}
