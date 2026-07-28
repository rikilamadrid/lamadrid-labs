"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  useDictionary,
  useLocaleContext,
} from "@/components/i18n/LocaleProvider";
import { useShell } from "@/components/shell/ShellProvider";
import { useStageBand } from "@/components/shell/stage-transition";
import { fireCornerActivation } from "@/lib/shell-signal";
import { setHeadlineElement } from "@/lib/signal/headline-signal";

/**
 * Home — the exploratory open field.
 *
 * Home is the one state whose DOM straddles the field: the `<h1>` sits *below*
 * the canvas so the field resolves it, and the copy sits *above* so ambient
 * noise never scatters over readable text. So it transitions as two separate
 * bands (see `stage-transition`) rather than as one state — fading them together
 * would group them into a single stacking context and pop the headline over the
 * field exactly while it should be dissolving underneath it.
 */
export function Hero() {
  const dict = useDictionary();
  const { locale } = useLocaleContext();
  const { setView } = useShell();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const belowField = useStageBand("below");
  const aboveField = useStageBand("above");

  // Publish the <h1> to the global engine, which resolves it out of the field.
  // Home no longer owns a canvas — the one persistent SignalSurface reads this
  // element off the bus and sharpens it. Re-publish on a locale change (the
  // headline text differs per locale, so the glyph mask must rebuild) and clear
  // it on unmount so other states run the field ambient-only.
  useEffect(() => {
    setHeadlineElement(headingRef.current);
    return () => setHeadlineElement(null);
  }, [locale]);

  return (
    <section className="lab-section flex min-h-svh flex-col justify-center overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
        {/* The z-index of each band comes from `useStageBand` (an animating
            opacity makes these stacking contexts, so the band must name its own
            layer) — hence `relative` here with no z-* utility. */}
        <motion.span className="lab-label relative" {...aboveField}>
          {dict.hero.eyebrow}
        </motion.span>

        {/* Resting register: legible but unresolved (noise ramp), never full
            ink. The global field — layered above this at LAYERS.field — brightens
            it toward the signal accent under the pointer. Real DOM text (the
            accessible, indexable source), pinned below the field at
            LAYERS.contentBelow so the canvas draws over it. */}
        <motion.h1 ref={headingRef} className="relative max-w-3xl" {...belowField}>
          {dict.hero.titleLines.map((line, index) => (
            // Colored on the span, not the h1: the unlayered `h1` base color
            // rule outranks a layered utility, but a direct declaration on the
            // span beats the inherited ink either way.
            <span key={index} data-hero-line className="block text-lab-noise-4">
              {line}
            </span>
          ))}
        </motion.h1>

        {/* Supporting copy sits above the field (LAYERS.content) so ambient
            fragments never scatter over the paragraph or the button. */}
        <motion.p className="relative w-full max-w-md" {...aboveField}>
          {dict.hero.lead}
        </motion.p>

        <motion.div className="relative mt-2" {...aboveField}>
          <button
            type="button"
            onClick={() => {
              // Same hand-off as the nav Work corner: throw the field's pulse
              // toward the top-right corner as the hero morphs into Work.
              fireCornerActivation("tr");
              setView("work");
            }}
            className="inline-flex items-center justify-center rounded-full border border-lab-line-strong px-6 py-3 text-sm font-medium text-lab-ink outline-none transition-colors hover:border-lab-signal hover:text-lab-signal focus-visible:ring-2 focus-visible:ring-lab-signal"
          >
            {dict.hero.ctaPrimary}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
