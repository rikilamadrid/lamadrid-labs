"use client";

import { PerspectiveCamera } from "@react-three/drei";
import type { ProcessStage } from "@/data/process";
import { processStages } from "@/data/process";
import { lerp } from "@/lib/math";
import { useTheme } from "@/lib/theme";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { CrystallizationRig } from "./CrystallizationRig";
import { MeasurementRig } from "./MeasurementRig";
import { ProcessBackdrop } from "./ProcessBackdrop";
import { ProcessBench, ProcessEnvironment } from "./processMaterials";
import { PurificationRig } from "./PurificationRig";
import { ReagentRig } from "./ReagentRig";
import { Specimen } from "./Specimen";
import { SynthesisRig } from "./SynthesisRig";

const RIG_COMPONENTS = [
  ReagentRig,
  MeasurementRig,
  SynthesisRig,
  PurificationRig,
  CrystallizationRig,
];

const STAGE_COUNT = processStages.length;
// Every rig shares this gate x-spacing (see rigPrimitives) — the orb rides
// between them so it still reads as entering/exiting the device.
const GATE_X = 1.7;
const ORB_Y = -0.35;

interface MobileProcessSceneProps {
  stage: ProcessStage;
  /** 0-1 within this stage's own scroll scrub. */
  progress: number;
}

// Simplified per-stage scene for the mobile fallback (39): one rig, one
// orb, two lights — never more than a single rig mounted/lit at a time,
// unlike desktop's persistent table + all 5 rigs. Reuses the exact rig
// components from 36/37 (same visual identity) and the same Specimen, just
// under a lighter scene and a different (non-pinned) trigger.
export function MobileProcessScene({ stage, progress }: MobileProcessSceneProps) {
  const RigComponent = RIG_COMPONENTS[stage.index];
  const tier = useProcessQualityTier();
  const { theme } = useTheme();
  const orbX = lerp(-GATE_X, GATE_X, progress);
  // Blends this stage's state into the next stage's as the scrub advances,
  // same neighbor-blend Specimen already does for the desktop track.
  const orbProgress = (stage.index + progress) / (STAGE_COUNT - 1);

  // Mobile-first (feature 45): the same premium foundation as desktop, scaled
  // down by the shared quality tier — a low-res generated environment for
  // glass/metal reflections and a low-res reflective bench. The one desktop
  // primitive that can't run here is the EffectComposer: MobileProcessCanvas
  // composites every stage through a drei <View> scissor, which a full-frame
  // composer can't wrap, so mobile glow stays emissive-driven (ProcessEffects
  // returns null for the mobile tier). Materials still visibly upgrade.
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 5.5]} fov={40} />
      <ProcessEnvironment tier={tier} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 3]} intensity={22} color="#ffffff" />

      <ProcessBackdrop theme={theme} z={-6} width={14} repeat={2} />
      <ProcessBench tier={tier} theme={theme} />

      <RigComponent />
      <group position={[orbX, ORB_Y, 0.6]}>
        <Specimen progress={orbProgress} />
      </group>
    </>
  );
}
