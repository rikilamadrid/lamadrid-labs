"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useShell } from "@/components/shell/ShellProvider";
import { useStageBand } from "@/components/shell/stage-transition";
import { fireCornerActivation } from "@/lib/shell-signal";
import { EASE } from "@/lib/motion";
import { setSpotlight } from "@/lib/spotlight-signal";

/**
 * Entering About reveals the editorial column once with a fast stagger, an
 * on-mount intro (AboutState mounts fresh per view), matching Work's entrance
 * rhythm rather than a scroll reveal (the shell never scrolls). Reduced motion
 * opts out of both the stagger and the per-item rise.
 */
const COLUMN_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE.resolve } },
};

/**
 * About mode: the founder statement behind the lab.
 *
 * A split editorial composition inside the no-scroll shell: the eyebrow, title,
 * and lead anchor the left column; the substance (the paragraphs) and a quiet
 * signature sit on the right, closing with a bridge into Contact. That bridge
 * mirrors the hero's Work hand-off: it throws the field pulse toward the
 * bottom-right corner as the state morphs, so the corner nav and the in-content
 * action feel like one system. The field also resolves a quiet band behind the
 * bridge itself (the same row-band primitive Work uses, anchored on this
 * state's one focal element), so the one action reads as memorable rather than
 * the state sitting flat. Signal scarcity holds: the accent lives only there
 * and on the eyebrow dot.
 */
export function AboutState() {
  const dict = useDictionary();
  const { setView } = useShell();
  const reduce = useReducedMotion();
  const aboveField = useStageBand("above");
  const bridgeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const publish = () => {
      const bridge = bridgeRef.current;
      if (!bridge) return;
      const rect = bridge.getBoundingClientRect();
      setSpotlight({
        clientY: rect.top + rect.height / 2,
        clientX: rect.left + rect.width / 2,
      });
    };
    publish();
    window.addEventListener("resize", publish);
    return () => {
      window.removeEventListener("resize", publish);
      setSpotlight(null);
    };
  }, []);

  return (
    // About is one band, entirely above the field (which is dormant here, the
    // canvas fades to `presence` 0 but stays mounted). See `stage-transition`.
    <motion.section
      className="relative h-full w-full overflow-hidden"
      {...aboveField}
    >
      <motion.div
        className="relative mx-auto grid h-full w-full max-w-6xl grid-cols-1 content-center gap-8 px-6 pb-8 pt-20 sm:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:content-center lg:gap-14 lg:px-14 lg:py-14"
        variants={reduce ? undefined : COLUMN_VARIANTS}
        initial={reduce ? false : "hidden"}
        animate={reduce ? false : "visible"}
      >
        {/* ── Left: eyebrow + title + lead ── */}
        <div className="flex flex-col justify-center gap-5">
          <motion.span variants={reduce ? undefined : ITEM_VARIANTS} className="lab-label">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.about.eyebrow}
          </motion.span>

          {/* Color on a child span: the unlayered base heading color rule
              outranks a layered utility on the h2 itself (see Hero). */}
          <motion.h2 variants={reduce ? undefined : ITEM_VARIANTS} className="max-w-md">
            <span className="text-lab-ink">{dict.about.title}</span>
          </motion.h2>

          <motion.p
            variants={reduce ? undefined : ITEM_VARIANTS}
            className="max-w-sm text-lab-muted"
          >
            {dict.about.lead}
          </motion.p>
        </div>

        {/* ── Right: the substance + signature + Contact bridge ── */}
        <div className="flex flex-col justify-center gap-6">
          {dict.about.paragraphs.map((paragraph) => (
            <motion.p
              key={paragraph}
              variants={reduce ? undefined : ITEM_VARIANTS}
              className="max-w-prose text-lab-ink/90"
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.div
            variants={reduce ? undefined : ITEM_VARIANTS}
            className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-lab-line pt-6"
          >
            <span className="lab-label text-lab-muted">Ricardo Lamadrid</span>
            <button
              ref={bridgeRef}
              type="button"
              onClick={() => {
                // Same hand-off as the nav Contact corner: throw the field's
                // pulse toward the bottom-right corner as About morphs into
                // Contact.
                fireCornerActivation("br");
                setView("contact");
              }}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-lab-ink outline-none transition-colors hover:text-lab-signal focus-visible:ring-2 focus-visible:ring-lab-signal focus-visible:ring-offset-2 focus-visible:ring-offset-lab-bg"
            >
              {dict.nav.contact}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
