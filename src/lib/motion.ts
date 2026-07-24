/**
 * Signal / Noise motion vocabulary.
 *
 * These values mirror the `--lab-duration-*` and `--lab-ease-*` custom
 * properties in `globals.css`. CSS-driven motion reads the properties; the
 * `motion` library cannot, so it reads this module instead. The two must be
 * changed together — they are one vocabulary with two consumers.
 *
 * The signature curve is `resolve`: quick to leave, long to settle. Things
 * arrive at order and come to rest. Nothing bounces, nothing snaps.
 */

/** Seconds — the `motion` library's unit. CSS declares the same values in ms. */
export const DURATION = {
  /** Immediate feedback: hover, press. */
  fast: 0.12,
  /** UI state: toggles, menus, nav. */
  base: 0.24,
  /** Section reveals. */
  slow: 0.48,
  /** The pointer field settling into local order. */
  field: 0.9,
} as const;

/** Cubic-bezier control points, in the `motion` library's array form. */
export const EASE = {
  /** Signature curve — fast departure, long settle. Use by default. */
  resolve: [0.2, 0.9, 0.2, 1],
  /** Symmetric; for state changes with no arrival to emphasize. */
  standard: [0.4, 0, 0.2, 1],
  /** Accelerating; for elements leaving the screen. */
  exit: [0.4, 0, 1, 1],
} as const;

export type DurationToken = keyof typeof DURATION;
export type EaseToken = keyof typeof EASE;

/**
 * A ready-made transition for the common case.
 *
 * Reduced motion is handled at two levels: the global rule in `globals.css`
 * collapses CSS transitions, and components animating via the `motion` library
 * should pass `reduced` from `usePrefersReducedMotion` so the transition
 * resolves to a near-instant one rather than being animated away mid-flight.
 */
export function transition(
  duration: DurationToken = "base",
  ease: EaseToken = "resolve",
  reduced = false,
) {
  return reduced
    ? { duration: 0 }
    : { duration: DURATION[duration], ease: EASE[ease] };
}
