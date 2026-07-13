"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { processStages } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { PROCESS_STAGE_X, deriveTrackX } from "@/lib/processLayout";
import { CrystallizationRig } from "./CrystallizationRig";
import { MeasurementRig } from "./MeasurementRig";
import { Orb } from "./Orb";
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
export function ProcessScene({ progress }: ProcessSceneProps) {
  const trackX = deriveTrackX(progress);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.3, 9]} fov={38} rotation={[-0.03, 0, 0]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3, 4]} intensity={40} color="#ffffff" />
      <pointLight position={[-9, 2, -2]} intensity={18} color="#ffffff" />
      <pointLight position={[9, 2, -2]} intensity={18} color="#ffffff" />

      <group position={[trackX, 0, 0]}>
        <ProcessTable stages={TABLE_STAGES} />
        {processStages.map((stage, i) => {
          const RigComponent = RIG_COMPONENTS[i];
          return <RigComponent key={stage.id} position={[PROCESS_STAGE_X[i], 0, 0]} />;
        })}
      </group>

      <Orb progress={progress} />
    </>
  );
}
