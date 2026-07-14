"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { processStages } from "@/data/process";
import { Orb } from "@/components/sections/process/Orb";
import {
  ProcessEffects,
  ProcessEnvironment,
} from "@/components/sections/process/processMaterials";
import { PROCESS_BG_DARK } from "@/lib/narrativeSignals";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";

function OrbStage({ progress }: { progress: number }) {
  // Feature 46: the orb now uses feature 45's glass/emissive materials, which
  // need the shared studio environment (and bloom) to read correctly — this
  // preview mirrors the desktop scene's foundation so it looks as it ships.
  const tier = useProcessQualityTier();
  return (
    <>
      <color attach="background" args={[PROCESS_BG_DARK]} />
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ProcessEnvironment tier={tier} />
      {/* Mirror ProcessScene's lighting (top-center key + soft side fills) so
          the preview's highlights land where they will in production. */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 4]} intensity={22} color="#ffffff" />
      <pointLight position={[-4, 1, -2]} intensity={6} color="#ffffff" />
      <pointLight position={[4, 1, -2]} intensity={6} color="#ffffff" />
      <Orb progress={progress} />
      <ProcessEffects tier={tier} />
    </>
  );
}

export function OrbDevHarness() {
  const [progress, setProgress] = useState(0);

  const segment = progress * (processStages.length - 1);
  const nearestStage = processStages[Math.round(segment)];

  return (
    <main className="min-h-screen bg-[#060b14] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Prototype — Orb component (feature 46)
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
            <OrbStage progress={progress} />
          </Canvas>
        </div>
      </div>
    </main>
  );
}
