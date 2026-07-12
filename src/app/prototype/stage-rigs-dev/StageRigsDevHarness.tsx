"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Color, PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { processStages } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { ReagentRig } from "@/components/sections/process/ReagentRig";
import { MeasurementRig } from "@/components/sections/process/MeasurementRig";
import { SynthesisRig } from "@/components/sections/process/SynthesisRig";
import { lerp } from "@/lib/math";

// Same spacing/positions the real horizontal scroll rig (feature 38) will
// place these at — kept here only so this harness can render a believable
// preview of the shared table path.
const RIG_X = { reagent: -5, measurement: 0, synthesis: 5 };
const PATH_START_X = -7;
const PATH_END_X = 7;
// These three rigs only cover the first 3 of 5 process stages.
const MAX_PROGRESS = 2 / (processStages.length - 1);

// A simplified stand-in for the real Orb (feature 35) — that component
// bakes in its own PerspectiveCamera, which conflicts with this harness's
// wide table-view camera when nested at a moving X offset. Wiring the real
// Orb into a shared-camera scene is feature 38's job (the scroll rig); this
// marker is only here to verify each rig's entry/exit gates line up with
// something travelling along the shared path.
function OrbMarker({ x, color }: { x: number; color: string }) {
  return (
    <mesh position={[x, 0.4, 0]}>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        transparent
        opacity={0.85}
        toneMapped={false}
      />
    </mesh>
  );
}

export function StageRigsDevHarness() {
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  // Drei's <PerspectiveCamera> only applies position/fov — it doesn't aim
  // at the scene by default, so without this the camera points along its
  // own -Z axis instead of down at the table.
  useEffect(() => {
    cameraRef.current?.lookAt(0, -0.1, 0);
  }, []);

  const localProgress = progress / MAX_PROGRESS;
  const segment = progress * (processStages.length - 1);
  const fromIndex = Math.min(Math.floor(segment), processStages.length - 2);
  const t = segment - fromIndex;
  const nearestStage = processStages[Math.round(segment)];
  const orbX = lerp(PATH_START_X, PATH_END_X, localProgress);
  const orbColor = new Color(narrativeSignalColors[processStages[fromIndex].signal])
    .lerp(new Color(narrativeSignalColors[processStages[fromIndex + 1].signal]), t)
    .getStyle();

  return (
    <main className="min-h-screen bg-[#0c0e11] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-widest text-white/40">
          Prototype — Stage device rigs 1–3 (feature 36)
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Scrub through Reagent Selection → Measurement → Synthesis
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Nearest stage: <span className="text-white">{nearestStage.id}</span>{" "}
          (index {nearestStage.index})
        </p>

        <input
          type="range"
          min={0}
          max={MAX_PROGRESS}
          step={0.001}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="mt-4 w-full"
        />
        <p className="mt-1 text-xs text-white/40">
          progress = {progress.toFixed(3)}
        </p>

        <div className="mt-8 h-[28rem] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.3, 9]} fov={50} />
            <ambientLight intensity={0.55} />
            <pointLight position={[0, 4, 4]} intensity={40} color="#ffffff" />
            <pointLight position={[-4, 2, -2]} intensity={15} color="#ffffff" />

            <ReagentRig position={[RIG_X.reagent, 0, 0]} />
            <MeasurementRig position={[RIG_X.measurement, 0, 0]} />
            <SynthesisRig position={[RIG_X.synthesis, 0, 0]} />

            <OrbMarker x={orbX} color={orbColor} />
          </Canvas>
        </div>
      </div>
    </main>
  );
}
