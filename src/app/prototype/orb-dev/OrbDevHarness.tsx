"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { processStages } from "@/data/process";
import { Orb } from "@/components/sections/process/Orb";

export function OrbDevHarness() {
  const [progress, setProgress] = useState(0);

  const segment = progress * (processStages.length - 1);
  const nearestStage = processStages[Math.round(segment)];

  return (
    <main className="min-h-screen bg-[#0c0e11] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Prototype — Orb component (feature 35)
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Scrub through progress 0 → 1
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Nearest stage: <span className="text-white">{nearestStage.id}</span>{" "}
          (index {nearestStage.index})
        </p>

        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="mt-4 w-full"
        />
        <p className="mt-1 text-xs text-white/40">
          progress = {progress.toFixed(3)}
        </p>

        <div className="mt-8 h-96 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
            <Orb progress={progress} />
          </Canvas>
        </div>
      </div>
    </main>
  );
}
