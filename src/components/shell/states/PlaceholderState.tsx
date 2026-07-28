"use client";

import { motion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useStageBand } from "@/components/shell/stage-transition";
import type { ViewKey } from "@/data/navigation";

/**
 * A full-screen state whose real content isn't built yet (Contact). Deliberately
 * in the noise register — no signal accent — so an unbuilt state never competes
 * for the one accent the concept reserves. Left-aligned to match the hero's
 * editorial composition.
 *
 * One band, entirely above the field (dormant for these states). See
 * `stage-transition`.
 */
export function PlaceholderState({ viewKey }: { viewKey: ViewKey }) {
  const dict = useDictionary();
  const aboveField = useStageBand("above");

  return (
    <motion.section
      className="relative flex h-full w-full flex-col items-start justify-center gap-4 px-6 sm:px-10 lg:px-16"
      {...aboveField}
    >
      <span className="lab-label">{dict.shell.inDevelopment}</span>
      {/* Color on a child span: the unlayered base heading color rule outranks
          a layered utility on the h2 itself (see Hero). */}
      <h2 className="max-w-3xl">
        <span className="text-lab-noise-4">{dict.nav[viewKey]}</span>
      </h2>
    </motion.section>
  );
}
