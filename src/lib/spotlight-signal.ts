/**
 * A DOM-free channel from a state (React) to the global field loop.
 *
 * The same seam as `shell-signal`: a state measures its one focal element
 * (Work's selected project row; About/Contact's primary CTA) and publishes a
 * spotlight target; `SignalEngine` localizes it to canvas space each tick and
 * resolves a signal band behind that element (only while the active
 * configuration enables the `rowBand` primitive). Kept out of React state for
 * the same reason: the field loop reads it straight from inside `tick`, and a
 * hover/selection/focus change wakes an idle loop via subscribe.
 *
 * The target is carried in *viewport* CSS px (the coordinate a state measures
 * in); the field subtracts its own canvas origin to localize. `null` means
 * nothing is focused; the band releases.
 */

type SpotlightTarget = {
  /** Focal element's vertical center, viewport CSS px. */
  clientY: number;
  /** The x the band brightens toward, viewport CSS px. */
  clientX: number;
  /** Resolved `--lab-signal` hex to color the band with, or `undefined` to
   *  use the canonical signal (Home/no per-project accent). */
  signal?: string;
} | null;

let target: SpotlightTarget = null;
const listeners = new Set<() => void>();

/** Read the live spotlight target. Read fields off it each tick; do not retain it. */
export function getSpotlight(): SpotlightTarget {
  return target;
}

/** Subscribe to spotlight changes. Returns an unsubscribe. The field loop uses
 *  this to wake itself when the focal target moves. */
export function subscribeSpotlight(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Publish (or clear) the spotlight target. Always notifies: changes are
 *  infrequent and each one must wake the loop to morph the band. */
export function setSpotlight(next: SpotlightTarget): void {
  target = next;
  for (const listener of listeners) listener();
}
