"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { View } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionReveal } from "@/components/ui/MotionPrimitives";
import type { Dictionary } from "@/data/i18n";
import type { ProcessStage } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { MobileProcessScene } from "./MobileProcessScene";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface MobileProcessStageProps {
  stage: ProcessStage;
  content: Dictionary["process"]["stages"][ProcessStage["id"]];
}

// The mobile fallback's per-stage unit: a self-scrubbed vertical stack item
// (copy above visual, matching NarrativeStage's mobile ordering) instead of
// 38's shared horizontal-pin scrub. Each instance owns its own
// ScrollTrigger scoped to its own bounds, so stages don't compete for one
// pinned viewport.
export function MobileProcessStage({ stage, content }: MobileProcessStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const trigger = ScrollTrigger.create({
      trigger: stageEl,
      start: "top 80%",
      end: "bottom 20%",
      scrub: 0.5,
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => trigger.kill();
  }, []);

  const signalColor = narrativeSignalColors[stage.signal];

  return (
    <div
      ref={stageRef}
      className="flex flex-col gap-6 py-10 first:pt-0 last:pb-0"
      style={{ "--stage-signal": signalColor } as CSSProperties}
    >
      <MotionReveal className="flex min-w-0 flex-col gap-3">
        <span className="lab-card-kicker" style={{ color: "var(--stage-signal)" }}>
          {String(stage.index + 1).padStart(2, "0")} — {content.title}
        </span>
        <p>{content.stageLine}</p>
        <p className="text-sm text-lab-muted">{content.serviceLine}</p>
      </MotionReveal>

      <div className="aspect-square w-full">
        <View className="lab-card-surface h-full w-full rounded-lab-lg">
          <MobileProcessScene stage={stage} progress={progress} />
        </View>
      </div>
    </div>
  );
}
