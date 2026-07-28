"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useStageBand } from "@/components/shell/stage-transition";
import { contactLink } from "@/data/social";
import { EASE } from "@/lib/motion";
import { setSpotlight } from "@/lib/spotlight-signal";

/**
 * Entering Contact reveals the centered column once with a fast stagger,
 * matching About's on-mount entrance rhythm (this state mounts fresh per view;
 * the shell never scrolls). Reduced motion opts out of both the stagger and the
 * per-item rise.
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
 * Contact mode: the end of the About bridge, a single centered invitation to
 * reach out directly, no form. Mirrors Hero's pill CTA so the "one primary
 * action" language stays consistent end to end; `mailto:` is the entire flow,
 * so the CTA is a plain anchor rather than a `setView` hand-off. Signal
 * scarcity holds: the accent lives only on the eyebrow dot and the CTA, which
 * the field also resolves toward (the same row-band primitive Work uses,
 * anchored on this state's one focal element instead of a selected row), so
 * the one action reads as memorable rather than the state sitting flat.
 */
export function ContactState() {
  const dict = useDictionary();
  const reduce = useReducedMotion();
  const aboveField = useStageBand("above");
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const publish = () => {
      const cta = ctaRef.current;
      if (!cta) return;
      const rect = cta.getBoundingClientRect();
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
    // Contact is one band, entirely above the field. See `stage-transition`.
    <motion.section
      className="relative h-full w-full overflow-hidden"
      {...aboveField}
    >
      <motion.div
        className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center sm:px-10"
        variants={reduce ? undefined : COLUMN_VARIANTS}
        initial={reduce ? false : "hidden"}
        animate={reduce ? false : "visible"}
      >
        <motion.span variants={reduce ? undefined : ITEM_VARIANTS} className="lab-label">
          <span aria-hidden="true" className="lab-eyebrow-dot" />
          {dict.contact.eyebrow}
        </motion.span>

        {/* Color on a child span: the unlayered base heading color rule
            outranks a layered utility on the h2 itself (see Hero). */}
        <motion.h2 variants={reduce ? undefined : ITEM_VARIANTS} className="max-w-xl">
          <span className="text-lab-ink">{dict.contact.title}</span>
        </motion.h2>

        <motion.p variants={reduce ? undefined : ITEM_VARIANTS} className="max-w-sm text-lab-muted">
          {dict.contact.lead}
        </motion.p>

        <motion.div variants={reduce ? undefined : ITEM_VARIANTS} className="mt-2">
          <a
            ref={ctaRef}
            href={contactLink.href}
            className="inline-flex items-center justify-center rounded-full border border-lab-line-strong px-6 py-3 text-sm font-medium text-lab-ink outline-none transition-colors hover:border-lab-signal hover:text-lab-signal focus-visible:ring-2 focus-visible:ring-lab-signal"
          >
            {dict.contact.cta}
          </a>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
