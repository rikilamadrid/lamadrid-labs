"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/data/i18n";
import { processStages } from "@/data/process";
import { deriveStageBlend } from "@/lib/processLayout";
import { ProcessHudPanel } from "./ProcessHudPanel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STAGE_COUNT = processStages.length;
// One extra viewport height of scroll per stage past the first gives each
// stage room to breathe instead of a rushed flick-through, per the brief.
const SCROLL_HEIGHT_VH = STAGE_COUNT * 100;

interface ProcessScrollRigProps {
  dict: Dictionary["process"];
}

// The pinned horizontal scroll mechanic: a tall wrapper drives one GSAP
// ScrollTrigger scrub feeding the active stage's copy panel. The 3D canvas
// itself now lives in SpecimenCanvas (mounted once, shared with Hero, from
// the top of the page) — this component only pins the HUD/copy overlay and
// reserves the scroll height; SpecimenCanvas independently derives the same
// progress via useProcessPinProgress (identical trigger bounds), so both
// stay in lockstep with no shared state needed. Only mounted when motion is
// allowed — the reduced-motion fallback lives in ProcessStaticFallback and
// never creates this at all.
export function ProcessScrollRig({ dict }: ProcessScrollRigProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  // Only the *active stage index* is state here, not raw progress. Storing
  // progress meant re-rendering this subtree on every scroll frame purely to
  // recompute a number that changes five times in the whole section — pure
  // waste competing with the 3D render loop for frame budget.
  //
  // Still shares the exact dwell-eased stage blend the 3D track/orb use (see
  // processLayout) so the HUD/copy crossfade switches at the same instant the
  // scene settles into the next stage — no independent rounding that could pop
  // out of sync with what's actually on screen (54).
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pinEl = pinRef.current;
    if (!wrapper || !pinEl) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      pin: pinEl,
      scrub: 0.75,
      onUpdate: (self) => {
        const { fromIndex, toIndex, t } = deriveStageBlend(self.progress, STAGE_COUNT);
        const next = t < 0.5 ? fromIndex : toIndex;
        setActiveIndex((current) => (current === next ? current : next));
      },
    });

    return () => trigger.kill();
  }, []);

  const activeStage = processStages[activeIndex];
  const activeContent = dict.stages[activeStage.id];

  return (
    <div ref={wrapperRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
      <div
        ref={pinRef}
        className="relative flex h-screen w-full flex-col overflow-hidden"
      >
        {/* The 3D specimen/table itself renders in SpecimenCanvas, a fixed
            layer shared with Hero that sits behind this pin (z-index 0) —
            this element only needs to stay transparent so it shows through. */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 max-w-sm p-6 sm:p-10">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.eyebrow}
          </span>
          <h2 className="mt-3 text-lab-ink">{dict.title}</h2>
          <p className="mt-2 max-w-xs text-sm">{dict.lead}</p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="max-w-sm"
            >
              <ProcessHudPanel
                stage={activeStage}
                content={activeContent}
                labels={dict.hud}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
