"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import {
  PROCESS_CORE_WHITE,
  PROCESS_GLASS_TINT,
  PROCESS_METAL_COLOR,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { RIG_GATE_X } from "@/lib/processLayout";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { EmissiveCoreMaterial, GlassMaterial } from "./processMaterials";
import {
  RIG_MACHINE_MOUNT_Y,
  RIG_PLATFORM_TOP_Y,
  RigGate,
  RigMachineBase,
  RigPlatform,
} from "./rigPrimitives";

interface MeasurementRigProps {
  /** X position along the shared table path (feature 38 wires real placement). */
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.violet;

// Weighing pan sits on the machine-base mount plate; the glass beaker stands on
// the pan, tall/wide enough to contain the orb (which rests at the world origin,
// y≈0, when this stage is centred under the camera).
const PAN_TOP_Y = RIG_MACHINE_MOUNT_Y + 0.05;
const BEAKER_RADIUS = 1.02;
const BEAKER_HEIGHT = 1.7;
const BEAKER_BASE_Y = PAN_TOP_Y + 0.02;
const BEAKER_CENTER_Y = BEAKER_BASE_Y + BEAKER_HEIGHT / 2;
const BEAKER_TOP_Y = BEAKER_BASE_Y + BEAKER_HEIGHT;

// Graduation lines as fractions of the beaker height — the "measurement" read.
const GRADUATIONS = [0.28, 0.44, 0.6, 0.76];
// Vertical travel band of the analysis scan disc.
const SCAN_LOW_Y = BEAKER_BASE_Y + 0.12;
const SCAN_HIGH_Y = BEAKER_TOP_Y - 0.14;

// Holographic analysis-graph bars (echoing the reference's constituent readout).
const GRAPH_BARS = [0.55, 0.78, 0.42, 0.66, 0.5];

// Feature 49 — Stage 2, Measurement: premium rebuild.
//
// A recognisable digital-scale measurement station matching the reference
// render (digital lab scale + holographic beaker readout): the shared branded
// RigMachineBase carrying a brushed-metal weighing pan, a glass beaker the orb
// settles into to be measured (graduation rings + a slow analysis scan disc
// sweeping the specimen), an angled digital display console reading out on the
// front (abstract emissive readout — the HUD panel carries the real copy), and
// a small floating holographic analysis graph beside it. Entry/exit gates keep
// the shared-table continuity so the orb reads as arriving, being weighed, and
// leaving toward Synthesis. Precise, analytical, still character — deliberately
// calm to contrast with Synthesis's reaction energy (stage 3).
export function MeasurementRig({ position = [0, 0, 0] }: MeasurementRigProps) {
  const tier = useProcessQualityTier();
  const prefersReducedMotion = usePrefersReducedMotion();

  const screenRef = useRef<Mesh>(null);
  const scanRef = useRef<Mesh>(null);
  const graphRef = useRef<Group>(null);
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) idle.current += delta;
    const t = idle.current;

    // Display screen holds a steady, barely-there readout pulse — a live
    // instrument, not a reacting one.
    if (screenRef.current) {
      const mat = screenRef.current.material as MeshStandardMaterial;
      const pulse = prefersReducedMotion ? 0 : Math.sin(t * 1.4) * 0.08;
      mat.emissiveIntensity = 0.55 + pulse;
    }

    // Analysis scan disc rises slowly through the beaker and resets — the
    // specimen being measured. Parked mid-beaker under reduced motion.
    if (scanRef.current) {
      const span = SCAN_HIGH_Y - SCAN_LOW_Y;
      const phase = prefersReducedMotion ? 0.5 : (t * 0.22) % 1;
      scanRef.current.position.y = SCAN_LOW_Y + phase * span;
      const mat = scanRef.current.material as MeshStandardMaterial;
      // Fade in/out at the ends so the reset doesn't pop.
      mat.opacity = 0.5 * Math.sin(phase * Math.PI);
    }

    // Holographic graph bars settle with a tiny analytical flicker.
    if (graphRef.current && !prefersReducedMotion) {
      graphRef.current.children.forEach((bar, i) => {
        const base = GRAPH_BARS[i] ?? 0.5;
        bar.scale.y = base + Math.sin(t * 1.3 + i) * 0.05;
      });
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-RIG_GATE_X} accentColor={ACCENT} />
      <RigGate x={RIG_GATE_X} accentColor={ACCENT} />

      {/* Branded machine pedestal (shared primitive) */}
      <RigMachineBase accentColor={ACCENT} />

      {/* Brushed-metal weighing pan on the mount plate */}
      <mesh position={[0, PAN_TOP_Y - 0.03, 0]}>
        <boxGeometry args={[1.55, 0.06, 1.55]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={[0, PAN_TOP_Y + 0.01, 0]}>
        <boxGeometry args={[1.3, 0.04, 1.3]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.24}
          envMapIntensity={1.3}
        />
      </mesh>
      {/* Lit weighing-surface glow under the beaker + accent seam around the pan */}
      <mesh position={[0, PAN_TOP_Y + 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BEAKER_RADIUS * 0.94, 40]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.28} />
      </mesh>
      <mesh position={[0, PAN_TOP_Y - 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.01, 8, 4]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.8} />
      </mesh>

      {/* Glass beaker — the processing chamber the orb settles into */}
      <mesh position={[0, BEAKER_CENTER_Y, 0]}>
        <cylinderGeometry args={[BEAKER_RADIUS, BEAKER_RADIUS, BEAKER_HEIGHT, 48, 1, true]} />
        <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.18} roughness={0.12} />
      </mesh>
      {/* Beaker floor */}
      <mesh position={[0, BEAKER_BASE_Y + 0.02, 0]}>
        <cylinderGeometry args={[BEAKER_RADIUS - 0.02, BEAKER_RADIUS - 0.02, 0.04, 48]} />
        <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.12} roughness={0.14} />
      </mesh>
      {/* Metal rim seal at the beaker mouth */}
      <mesh position={[0, BEAKER_TOP_Y - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[BEAKER_RADIUS, 0.028, 10, 56]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.34}
          envMapIntensity={1.1}
        />
      </mesh>
      {/* Graduation rings up the beaker wall */}
      {GRADUATIONS.map((f, i) => (
        <mesh
          key={i}
          position={[0, BEAKER_BASE_Y + f * BEAKER_HEIGHT, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[BEAKER_RADIUS + 0.004, 0.004, 6, 64]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.6} transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Analysis scan disc sweeping the specimen inside the beaker */}
      <mesh ref={scanRef} position={[0, SCAN_LOW_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, BEAKER_RADIUS - 0.06, 40]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.85} transparent opacity={0.4} />
      </mesh>

      {/* Angled digital display console on the front of the scale */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.24, 1.08]} rotation={[-0.4, 0, 0]}>
        {/* Bezel */}
        <mesh>
          <boxGeometry args={[1.5, 0.5, 0.07]} />
          <meshStandardMaterial
            color="#0c1116"
            metalness={0.9}
            roughness={0.42}
            envMapIntensity={0.9}
          />
        </mesh>
        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0.04]}>
          <planeGeometry args={[1.34, 0.36]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.55}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>
        {/* Abstract readout — a bright "value" bar + small "label" ticks (no baked text) */}
        <mesh position={[0.24, -0.02, 0.05]}>
          <boxGeometry args={[0.62, 0.12, 0.006]} />
          <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.1} transparent opacity={0.85} />
        </mesh>
        {[-0.5, -0.36, -0.22].map((x) => (
          <mesh key={x} position={[x, 0.09, 0.05]}>
            <boxGeometry args={[0.08, 0.02, 0.006]} />
            <EmissiveCoreMaterial color={ACCENT} intensity={0.8} transparent opacity={0.7} />
          </mesh>
        ))}
        <mesh position={[-0.4, -0.09, 0.05]}>
          <boxGeometry args={[0.28, 0.02, 0.006]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.6} transparent opacity={0.5} />
        </mesh>
        {/* Status indicator dot */}
        <mesh position={[0.6, 0.13, 0.05]}>
          <circleGeometry args={[0.022, 16]} />
          <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.3} transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Floating holographic analysis graph — echoes the reference's constituent readout */}
      <group position={[-1.55, BEAKER_CENTER_Y + 0.1, 0.3]} rotation={[0, 0.5, 0]}>
        {/* Glass frame */}
        <mesh>
          <boxGeometry args={[0.66, 0.5, 0.015]} />
          <meshPhysicalMaterial
            color="#0b1a24"
            transparent
            opacity={0.34}
            roughness={0.1}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.15}
            ior={1.4}
            envMapIntensity={1.2}
          />
        </mesh>
        {/* Emissive frame edges */}
        {[
          { p: [0, 0.245, 0.012] as const, s: [0.66, 0.01, 0.005] as const },
          { p: [0, -0.245, 0.012] as const, s: [0.66, 0.01, 0.005] as const },
        ].map((bar, i) => (
          <mesh key={i} position={bar.p}>
            <boxGeometry args={bar.s} />
            <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.75} />
          </mesh>
        ))}
        {/* Analysis bars */}
        <group ref={graphRef} position={[0, -0.18, 0.012]}>
          {GRAPH_BARS.map((h, i) => (
            <mesh key={i} position={[-0.24 + i * 0.12, h * 0.16, 0]} scale={[1, h, 1]}>
              <boxGeometry args={[0.05, 0.32, 0.006]} />
              <EmissiveCoreMaterial color={ACCENT} intensity={0.95} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
