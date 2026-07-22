"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { Group } from "three";
import { processStages } from "@/data/process";
import {
  PROCESS_BG_DARK,
  PROCESS_BG_LIGHT,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { PROCESS_STAGE_X, deriveTrackX } from "@/lib/processLayout";
import { smoothstep } from "@/lib/math";
import type { ProgressSource } from "@/lib/progressSource";
import { readProgress } from "@/lib/progressSource";
import { useTheme } from "@/lib/theme";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { CrystallizationRig } from "./CrystallizationRig";
import { MeasurementRig } from "./MeasurementRig";
import { ProcessBackdrop } from "./ProcessBackdrop";
import {
  ProcessBench,
  ProcessEffects,
  ProcessEnvironment,
} from "./processMaterials";
import { ProcessTable } from "./ProcessTable";
import { PurificationRig } from "./PurificationRig";
import { ReagentRig } from "./ReagentRig";
import { Specimen } from "./Specimen";
import { SynthesisRig } from "./SynthesisRig";

interface ProcessSceneProps {
  /** 0-1 across the existing 5-stage Process system. Pass a ref from anything
   *  scroll-driven — see ProgressSource. */
  progress: ProgressSource;
  /**
   * 0-1 across the hero-idle -> table-descent phase that precedes the 5
   * stages; defaults to 1 (table already present) for any mount that
   * doesn't share the Hero->Process journey, e.g. dev harnesses. Also drives
   * the table/rigs' own reveal (see REVEAL_START below) — continuous, so
   * scrubbing back up through Hero fades the table back out just as smoothly
   * as it faded in, instead of a hard mount/unmount pop in either direction.
   */
  heroT?: ProgressSource;
}

// Table/rigs/bench/backdrop rise into place over most of the hero descent
// rather than mounting on a hard boolean flip (which read as the whole lab
// table popping into existence with no transition) or scaling in from a
// point (the previous approach: scaling the whole group around its local
// origin made every off-centre rig visibly fly in from the middle of the
// screen as it grew, on top of the reveal window being compressed into the
// last ~28% of an already-short hero section — well under one scroll wheel
// tick in practice). Always mounted — reading `heroT` every frame and
// driving a group's transform is much cheaper than remounting the table/5
// rigs/bench/backdrop/environment every time the user scrolls back and
// forth across the Hero/Process boundary, and it makes the reveal trivially
// reversible for free.
const REVEAL_START = 0.15;
const REVEAL_END = 1;
// World-Y the whole assembly starts below at reveal=0 — comfortably below
// the camera's vertical frustum (see ProcessScene's camera) so the table
// rises up into frame from out of view instead of scaling in from nothing.
const REVEAL_RISE = 3.6;

// The rig track slides via useFrame off the same progress source the specimen
// reads, rather than off a re-rendered prop. Scrubbing therefore mutates one
// matrix per frame instead of reconciling the table, all 5 rigs, the bench,
// the backdrop and the effect composer on every scroll event — which is what
// made scrolling feel like it was dragging something heavy.
function RigTrack({
  progress,
  children,
}: {
  progress: ProgressSource;
  children: React.ReactNode;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = deriveTrackX(readProgress(progress));
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// Rises the table/rigs/bench/backdrop into place off `heroT`, continuously,
// instead of a hard mount/unmount or an origin-scale burst.
function RevealGroup({
  heroT,
  children,
}: {
  heroT: ProgressSource;
  children: React.ReactNode;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const reveal = smoothstep(REVEAL_START, REVEAL_END, readProgress(heroT, 1));
    groupRef.current.position.y = -REVEAL_RISE * (1 - reveal);
    groupRef.current.visible = reveal > 0.002;
  });

  return <group ref={groupRef}>{children}</group>;
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
// specimen both stay put at the world origin, while the rig track (table +
// all 5 stage rigs, 36/37) slides horizontally beneath them as `progress`
// advances — the specimen reads as travelling because the equipment moves
// past it, not the other way around.
//
// Feature 45 installs the premium foundation on top of that unchanged
// choreography: a generated studio environment for glass/metal reflections, a
// reflective bench, and a restrained bloom+vignette composer — all driven by
// the shared quality tier so mobile scales down from the same primitives. The
// scene paints its own themed background (mirroring --lab-bg) so the composer
// can't force it to opaque black and light mode doesn't hard-break.
export function ProcessScene({
  progress,
  heroT = 1,
}: ProcessSceneProps) {
  const tier = useProcessQualityTier();
  const { theme } = useTheme();
  const light = theme === "light";
  const bg = light ? PROCESS_BG_LIGHT : PROCESS_BG_DARK;
  // Dark theme's fog fades toward a near-black bg, which reads as shadowy
  // depth even over most of the reflective bench's 44-unit run. Light
  // theme's bg is near-white, so the identical 16-32 range faded the same
  // large a share of the visible floor toward *that* — the actual source of
  // the "wall of glare" (the MeshReflectorMaterial's own settings barely
  // moved it, see ProcessBench). Pushed much further out so only a soft hint
  // of atmosphere remains at the true back of the bench, leaving the
  // reflective surface itself legible as a surface instead of a fade-to-white.
  const fogNear = light ? 30 : 16;
  const fogFar = light ? 60 : 32;

  return (
    <>
      <color attach="background" args={[bg]} />
      {/* Near/far kept beyond the rig track's own depth so stages stay crisp;
          only the bench's far reaches and the backdrop plane behind it fade
          toward the page background, reading as depth rather than haze. */}
      <fog attach="fog" args={[bg, fogNear, fogFar]} />
      <PerspectiveCamera makeDefault position={[0, 0.3, 9]} fov={38} rotation={[-0.03, 0, 0]} />
      <ProcessEnvironment tier={tier} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 4]} intensity={26} color="#ffffff" />
      <pointLight position={[-9, 2, -2]} intensity={12} color="#ffffff" />
      <pointLight position={[9, 2, -2]} intensity={12} color="#ffffff" />

      <RevealGroup heroT={heroT}>
        <ProcessBackdrop theme={theme} />
        <ProcessBench tier={tier} theme={theme} />

        <RigTrack progress={progress}>
          <ProcessTable stages={TABLE_STAGES} />
          {processStages.map((stage, i) => {
            const RigComponent = RIG_COMPONENTS[i];
            return <RigComponent key={stage.id} position={[PROCESS_STAGE_X[i], 0, 0]} />;
          })}
        </RigTrack>
      </RevealGroup>

      <Specimen progress={progress} heroT={heroT} />

      <ProcessEffects tier={tier} theme={theme} />
    </>
  );
}
