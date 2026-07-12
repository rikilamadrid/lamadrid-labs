"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/data/i18n";
import { processStages } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { ProcessScene } from "./ProcessScene";

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
// ScrollTrigger scrub, whose progress feeds the 3D track transform (via
// ProcessScene) and the active stage's copy panel from the same source of
// truth. Only mounted when motion is allowed — the reduced-motion fallback
// lives in ProcessStaticFallback and never creates this at all.
export function ProcessScrollRig({ dict }: ProcessScrollRigProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const pinEl = pinRef.current;
    if (!wrapper || !pinEl) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      pin: pinEl,
      scrub: 0.6,
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => trigger.kill();
  }, []);

  const segment = progress * (STAGE_COUNT - 1);
  const activeIndex = Math.min(Math.round(segment), STAGE_COUNT - 1);
  const activeStage = processStages[activeIndex];
  const activeContent = dict.stages[activeStage.id];
  const accentColor = narrativeSignalColors[activeStage.signal];

  return (
    <div ref={wrapperRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }} className="relative">
      <div
        ref={pinRef}
        className="relative flex h-screen w-full flex-col overflow-hidden bg-lab-bg"
      >
        <div className="absolute inset-0">
          <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
            <ProcessScene progress={progress} />
          </Canvas>
        </div>

        <div className="pointer-events-none absolute left-0 top-0 z-10 max-w-sm p-6 sm:p-10">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.eyebrow}
          </span>
          <h2 className="mt-3 text-lab-ink">{dict.title}</h2>
          <p className="mt-2 max-w-xs text-sm">{dict.lead}</p>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 z-10 w-full p-6 sm:p-10"
          style={{ "--stage-signal": accentColor } as CSSProperties}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="lab-card-surface max-w-sm rounded-lab-lg p-5"
            >
              <span className="lab-card-kicker" style={{ color: "var(--stage-signal)" }}>
                {String(activeStage.index + 1).padStart(2, "0")} — {activeContent.title}
              </span>
              <p className="mt-2 text-sm">{activeContent.stageLine}</p>
              <p className="mt-1 text-xs text-lab-muted">{activeContent.serviceLine}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
