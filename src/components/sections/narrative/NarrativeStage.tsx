"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { View } from "@react-three/drei";
import { MotionReveal } from "@/components/ui/MotionPrimitives";
import type { NarrativeStage as NarrativeStageData } from "@/data/narrative";
import { narrativeSignalColors } from "@/lib/narrativeSignals";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface NarrativeStageContent {
  kicker: string;
  title: string;
  description: string;
  detail: string;
}

export interface NarrativeStageProps {
  stage: NarrativeStageData;
  content: NarrativeStageContent;
  serviceLabels: string[];
  /**
   * Renders the stage's 3D specimen. Receives a live progress ref (0-1,
   * written by this stage's own ScrollTrigger scrub) so the visual can
   * animate per-frame without forcing React re-renders.
   */
  visual: (progress: RefObject<number>) => ReactNode;
  /**
   * Swaps copy/visual columns from `lg` up for an alternating layout across
   * a sequence of stages. Mobile stacking (copy above visual) is unaffected.
   */
  reverse?: boolean;
}

// The reusable template for every narrative stage: a copy column plus a
// scroll-scrubbed specimen visual, stacked on mobile and side-by-side from
// `lg` up. Reduced-motion users get the same content with no scrub wiring.
export function NarrativeStage({
  stage,
  content,
  serviceLabels,
  visual,
  reverse = false,
}: NarrativeStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const trigger = ScrollTrigger.create({
      trigger: stageEl,
      start: "top 80%",
      end: "bottom 20%",
      scrub: 0.5,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, []);

  const signalColor = narrativeSignalColors[stage.signal];

  return (
    <div
      ref={stageRef}
      className="grid grid-cols-1 items-center gap-10 py-12 first:pt-0 last:pb-0 lg:grid-cols-2 lg:gap-16"
      style={{ "--stage-signal": signalColor } as CSSProperties}
    >
      <MotionReveal
        className={`order-1 flex min-w-0 flex-col gap-4 ${reverse ? "lg:order-2" : "lg:order-1"}`}
      >
        <span
          className="lab-card-kicker"
          style={{ color: "var(--stage-signal)" }}
        >
          {content.kicker}
        </span>
        <h3 className="text-lab-ink">{content.title}</h3>
        <p>{content.description}</p>
        <p className="text-sm text-lab-muted">{content.detail}</p>

        {serviceLabels.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {serviceLabels.map((label) => (
              <li key={label} className="lab-token">
                {label}
              </li>
            ))}
          </ul>
        )}
      </MotionReveal>

      <div
        className={`order-2 aspect-square w-full ${reverse ? "lg:order-1" : "lg:order-2"}`}
      >
        <View className="lab-card-surface h-full w-full rounded-lab-lg">
          {visual(progressRef)}
        </View>
      </div>
    </div>
  );
}
