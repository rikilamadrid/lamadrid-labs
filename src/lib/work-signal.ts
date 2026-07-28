/**
 * A DOM-free channel from the Work index (React) to the global field loop.
 *
 * The same seam as `shell-signal`, scoped to the Work state: the index measures
 * the selected project row and publishes a band target; `SignalEngine` localizes
 * it to canvas space each tick and resolves a signal band behind the row (only
 * while the active configuration enables the `rowBand` primitive). Kept out
 * of React state for the same reason — the field loop reads it straight from
 * inside `tick`, and a hover/selection change wakes an idle loop via subscribe.
 *
 * The target is carried in *viewport* CSS px (the coordinate the index measures
 * in); the field subtracts its own canvas origin to localize. `null` means no
 * row is selected — the band releases.
 */

type WorkBandTarget = {
  /** Selected row's vertical center, viewport CSS px. */
  clientY: number;
  /** The x the band brightens toward (the preview side), viewport CSS px. */
  clientX: number;
} | null;

let target: WorkBandTarget = null;
const listeners = new Set<() => void>();

/** Read the live band target. Read fields off it each tick; do not retain it. */
export function getWorkBand(): WorkBandTarget {
  return target;
}

/** Subscribe to band changes. Returns an unsubscribe. The field loop uses this
 *  to wake itself when the selection moves. */
export function subscribeWorkBand(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Publish (or clear) the band target. Always notifies: selection changes are
 *  infrequent and each one must wake the loop to morph the band. */
export function setWorkBand(next: WorkBandTarget): void {
  target = next;
  for (const listener of listeners) listener();
}
