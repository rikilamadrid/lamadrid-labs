"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, PerspectiveCamera } from "@react-three/drei";
import { processStages } from "@/data/process";
import { SPECIMEN_STATE_ORDER } from "@/data/specimenStates";
import { PROCESS_BG_DARK } from "@/lib/narrativeSignals";
import {
  PROCESS_STAGE_X,
  deriveStageBlend,
  deriveTrackX,
} from "@/lib/processLayout";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { Specimen } from "@/components/sections/process/Specimen";
import { ProcessEffects, ProcessEnvironment } from "@/components/sections/process/processMaterials";

// PROTOTYPE — Feature 1 (specimen motion system). Deliberately has no
// equipment/rig models: five bare ring markers standing in for the 5 stages,
// plus a floating ring standing in for the Hero idle zone. Per Ricardo's
// brief ("prove the specimen flow with placeholders first" — if the tiny
// particle doesn't feel alive against simple anchors, it never will against
// fancy models), this harness exists purely to judge the specimen's motion
// and character in isolation, decoupled from how good/bad the final tool
// models look. Scrub heroT to 1 first to reveal the stage anchors (mirrors
// ProcessScene's own `tableSettled` gate), then scrub progress across them.
// Not linked from real nav. Delete once the real equipment pass reuses/
// retires this in favor of the live Process section.

function AnchorMarker({ x, label, active }: { x: number; label: string; active: boolean }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.32, 40]} />
        <meshBasicMaterial
          color={active ? "#8fe9ff" : "#2a3742"}
          transparent
          opacity={active ? 0.9 : 0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 24]} />
        <meshBasicMaterial
          color={active ? "#dff6ff" : "#425160"}
          transparent
          opacity={active ? 0.8 : 0.35}
          toneMapped={false}
        />
      </mesh>
      <Html center distanceFactor={9} style={{ pointerEvents: "none" }}>
        <span
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            color: active ? "#dff6ff" : "#5b6b76",
            transform: "translateY(18px)",
          }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

interface SpecimenMotionSceneProps {
  progress: number;
  heroT: number;
}

function SpecimenMotionScene({ progress, heroT }: SpecimenMotionSceneProps) {
  const tier = useProcessQualityTier();
  const trackX = deriveTrackX(progress);
  const { fromIndex, toIndex, t } = deriveStageBlend(progress, processStages.length);
  const nearestIndex = t < 0.5 ? fromIndex : toIndex;
  const tableSettled = heroT >= 1;

  return (
    <>
      <color attach="background" args={[PROCESS_BG_DARK]} />
      <fog attach="fog" args={[PROCESS_BG_DARK, 16, 32]} />
      <PerspectiveCamera makeDefault position={[0, 0.3, 9]} fov={38} rotation={[-0.03, 0, 0]} />
      <ProcessEnvironment tier={tier} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 4]} intensity={26} color="#ffffff" />
      <pointLight position={[-9, 2, -2]} intensity={12} color="#ffffff" />
      <pointLight position={[9, 2, -2]} intensity={12} color="#ffffff" />

      {tableSettled && (
        <group position={[trackX, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <planeGeometry args={[40, 6]} />
            <meshBasicMaterial color="#0a0f16" toneMapped={false} />
          </mesh>
          {PROCESS_STAGE_X.map((x, i) => (
            <AnchorMarker
              key={i}
              x={x}
              label={`${i + 1} · ${SPECIMEN_STATE_ORDER[i]}`}
              active={i === nearestIndex}
            />
          ))}
        </group>
      )}

      {!tableSettled && (
        <mesh position={[0, 1.2, -2]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.28, 0.34, 32]} />
          <meshBasicMaterial color="#3c5460" transparent opacity={0.4} toneMapped={false} />
        </mesh>
      )}

      <Specimen progress={progress} heroT={heroT} />

      <ProcessEffects tier={tier} theme="dark" />
    </>
  );
}

export function SpecimenMotionDevHarness() {
  const [progress, setProgress] = useState(0);
  const [heroT, setHeroT] = useState(1);

  const { fromIndex, toIndex, t } = deriveStageBlend(progress, processStages.length);
  const nearestIndex = t < 0.5 ? fromIndex : toIndex;
  const nearestStage = SPECIMEN_STATE_ORDER[nearestIndex];

  return (
    <main className="min-h-screen bg-[#060b14] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Prototype — Specimen motion system (Feature 1)
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Placeholder-anchor motion preview
        </h1>
        <p className="mt-2 max-w-lg text-sm text-white/60">
          No equipment here on purpose — five bare ring markers stand in for
          the 5 stages so the particle&apos;s own motion and character can be
          judged before any tool model is touched.
        </p>

        <div className="mt-6">
          <label className="flex items-center justify-between text-xs text-white/50">
            <span>heroT — hero idle → table descent</span>
            <span>{heroT.toFixed(3)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={heroT}
            onChange={(e) => setHeroT(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center justify-between text-xs text-white/50">
            <span>progress — across the 5 stage anchors</span>
            <span>{progress.toFixed(3)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            disabled={heroT < 1}
            className="mt-1 w-full disabled:opacity-30"
          />
        </div>

        <p className="mt-2 text-xs text-white/40">
          Nearest anchor: <span className="text-white">{nearestStage}</span>
        </p>

        <div className="mt-6 h-[28rem] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
            <SpecimenMotionScene progress={progress} heroT={heroT} />
          </Canvas>
        </div>
      </div>
    </main>
  );
}
