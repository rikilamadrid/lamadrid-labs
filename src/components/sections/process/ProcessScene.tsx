"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { processStages } from "@/data/process";
import {
  PROCESS_BG_DARK,
  PROCESS_BG_LIGHT,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { PROCESS_STAGE_X, deriveTrackX } from "@/lib/processLayout";
import { useTheme } from "@/lib/theme";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { CrystallizationRig } from "./CrystallizationRig";
import { MeasurementRig } from "./MeasurementRig";
import { Orb } from "./Orb";
import {
  ProcessBench,
  ProcessEffects,
  ProcessEnvironment,
} from "./processMaterials";
import { ProcessTable } from "./ProcessTable";
import { PurificationRig } from "./PurificationRig";
import { ReagentRig } from "./ReagentRig";
import { SynthesisRig } from "./SynthesisRig";

interface ProcessSceneProps {
  /** 0-1 across the whole Process section (all 5 stages). */
  progress: number;
}

const RIG_COMPONENTS = [
  ReagentRig,
  MeasurementRig,
  SynthesisRig,
  PurificationRig,
  CrystallizationRig,
];

const TABLE_STAGES = processStages.map((stage, i) => ({
  x: PROCESS_STAGE_X[i],
  accentColor: narrativeSignalColors[stage.signal],
}));

// The shared scene the pinned scroll rig drives: one fixed camera and the
// Orb (35) both stay put at the world origin, while the rig track (table +
// all 5 stage rigs, 36/37) slides horizontally beneath them as `progress`
// advances — the orb reads as travelling because the equipment moves past
// it, not the other way around.
//
// Feature 45 installs the premium foundation on top of that unchanged
// choreography: a generated studio environment for glass/metal reflections, a
// reflective bench, and a restrained bloom+vignette composer — all driven by
// the shared quality tier so mobile scales down from the same primitives. The
// scene paints its own themed background (mirroring --lab-bg) so the composer
// can't force it to opaque black and light mode doesn't hard-break.
export function ProcessScene({ progress }: ProcessSceneProps) {
  const trackX = deriveTrackX(progress);
  const tier = useProcessQualityTier();
  const { theme } = useTheme();
  const bg = theme === "light" ? PROCESS_BG_LIGHT : PROCESS_BG_DARK;

  return (
    <>
      <color attach="background" args={[bg]} />
      <PerspectiveCamera makeDefault position={[0, 0.3, 9]} fov={38} rotation={[-0.03, 0, 0]} />
      <ProcessEnvironment tier={tier} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 4]} intensity={26} color="#ffffff" />
      <pointLight position={[-9, 2, -2]} intensity={12} color="#ffffff" />
      <pointLight position={[9, 2, -2]} intensity={12} color="#ffffff" />

      <ProcessBench tier={tier} />

      <group position={[trackX, 0, 0]}>
        <ProcessTable stages={TABLE_STAGES} />
        {processStages.map((stage, i) => {
          const RigComponent = RIG_COMPONENTS[i];
          return <RigComponent key={stage.id} position={[PROCESS_STAGE_X[i], 0, 0]} />;
        })}
      </group>

      <Orb progress={progress} />

      <ProcessEffects tier={tier} />
    </>
  );
}
