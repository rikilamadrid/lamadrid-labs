"use client";

import { useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { LAYERS } from "@/lib/signal/layers";
import { DURATION, EASE } from "@/lib/motion";

/**
 * How the stage changes state now that one persistent field spans every state.
 *
 * The field itself does not transition — it *morphs*: `SignalEngine.configure`
 * eases the live field toward the new state's configuration, so the canvas is
 * continuous through a state change and there is no presence dip to hide a DOM
 * swap behind. Only the state DOM crossfades, and it does so **per z-band**
 * rather than per state.
 *
 * That distinction is the whole point of this module. An opacity animation makes
 * an element a stacking context, which collapses every descendant z-index into
 * it. Fading a whole state at once therefore groups its bands into one context
 * mid-transition — and Home's bands deliberately straddle the field (`<h1>` at
 * `contentBelow`, copy at `content`), so grouping them pops the headline above
 * the canvas exactly while it should be dissolving underneath it.
 *
 * The split:
 *
 * - `useStageViewPresence` drives `ShellStage`'s per-view wrapper with variant
 *   *labels only*. It animates no properties itself, so it never becomes a
 *   stacking context — it only broadcasts `hidden` / `visible` / exit down the
 *   tree, and `AnimatePresence` still waits on the descendants it reaches.
 * - `useStageBand` is spread onto elements that live entirely within one band.
 *   Each inherits the label from the wrapper and fades independently, so bands
 *   stay interleaved with the canvas for the whole transition.
 *
 * A band element carries an explicit z-index because its opacity makes it a
 * stacking context, and a stacking context with `z-index: auto` would paint
 * below the fixed canvas regardless of its descendants. `STAGE_BAND_Z` names the
 * two z-indexes states actually use.
 */

/** The two bands state DOM occupies, relative to the global field canvas. */
export const STAGE_BAND_Z = {
  /** Below the field — intentional visual DOM the canvas draws *over*. */
  below: LAYERS.contentBelow,
  /** Above the field — primary readable DOM (copy, index, previews). */
  above: LAYERS.content,
} as const;

const BAND_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Reduced motion gets a plain cut: the band is always fully present, and the
 *  zero-duration transition still resolves so `AnimatePresence` can proceed. */
const STATIC_BAND_VARIANTS: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const BAND_TRANSITION: Transition = {
  duration: DURATION.base,
  ease: EASE.resolve,
};

const STATIC_BAND_TRANSITION: Transition = { duration: 0 };

/**
 * Props for `ShellStage`'s per-view wrapper: variant labels and nothing else.
 *
 * Deliberately property-free — see the module note. Adding any animated value
 * here (opacity, transform, filter) re-creates the stacking context this design
 * exists to avoid.
 */
export function useStageViewPresence() {
  return {
    initial: "hidden",
    animate: "visible",
    exit: "hidden",
  } as const;
}

/**
 * Props for one band of a state's DOM. Spread onto an element whose subtree
 * lives entirely at a single z-band, and pass that band's z-index.
 *
 * No `initial` / `animate` of its own: the label is inherited from the stage
 * wrapper, which is what keeps entering and exiting bands in step.
 */
export function useStageBand(band: keyof typeof STAGE_BAND_Z = "above") {
  const reduce = useReducedMotion();
  return {
    variants: reduce ? STATIC_BAND_VARIANTS : BAND_VARIANTS,
    transition: reduce ? STATIC_BAND_TRANSITION : BAND_TRANSITION,
    style: { zIndex: STAGE_BAND_Z[band] },
  };
}
