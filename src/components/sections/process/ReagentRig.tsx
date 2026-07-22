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
  RigGate,
  RigMachineBase,
  RigPlatform,
} from "./rigPrimitives";

interface ReagentRigProps {
  /** X position along the shared table path (feature 38 wires real placement). */
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.cyan;

// Column geometry: an open-ended glass tube standing on the machine base,
// tall enough to contain the orb (which sits at the world origin, y≈0, when
// this stage is centred under the camera).
const COLUMN_RADIUS = 0.75;
const COLUMN_HEIGHT = 1.7;
const COLUMN_CENTER_Y = RIG_MACHINE_MOUNT_Y + COLUMN_HEIGHT / 2; // base rests on mount plate
const COLUMN_TOP_Y = RIG_MACHINE_MOUNT_Y + COLUMN_HEIGHT;

const INNER_STREAKS = [0, 1, 2, 3];

// Feature 48 — Stage 1, Reagent Selection: premium rebuild.
//
// A recognisable reagent-intake station matching the reference render: a
// branded machine pedestal (shared RigMachineBase) carrying a glass
// stabilisation column, a "reagent lock" cage around the column base, a dark
// brushed-metal machine head on top, internal cyan energy the orb settles
// into, and a floating periodic-tile motif feeding the reagent in. Entry/exit
// gates keep the shared-table continuity so the orb reads as arriving,
// stabilising inside the column, and leaving toward Measurement. Calm, precise
// "intake" character — this is the genesis point of the journey.
export function ReagentRig({ position = [0, 0, 0] }: ReagentRigProps) {
  const tier = useProcessQualityTier();
  const prefersReducedMotion = usePrefersReducedMotion();

  const plasmaRef = useRef<Mesh>(null);
  const streaksRef = useRef<Group>(null);
  const tileRef = useRef<Group>(null);
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) idle.current += delta;
    const t = idle.current;

    // Internal energy breathes slowly — the chamber reads "stabilising", not
    // reacting (that intensity is Synthesis's job, stage 3).
    if (plasmaRef.current) {
      const mat = plasmaRef.current.material as MeshStandardMaterial;
      const breathe = prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 0.12;
      mat.emissiveIntensity = 0.85 + breathe;
      mat.opacity = 0.16 + (prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 0.03);
    }
    // Faint rising energy streaks drift around the column axis.
    if (streaksRef.current && !prefersReducedMotion) {
      streaksRef.current.rotation.y += delta * 0.35;
    }
    // Periodic tile bobs gently and turns a touch — the reagent waiting to feed.
    if (tileRef.current && !prefersReducedMotion) {
      tileRef.current.position.y = 0.78 + Math.sin(t * 0.8) * 0.04;
      tileRef.current.rotation.y = 0.32 + Math.sin(t * 0.5) * 0.08;
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-RIG_GATE_X} accentColor={ACCENT} />
      <RigGate x={RIG_GATE_X} accentColor={ACCENT} />

      {/* Branded machine pedestal (shared primitive, reused by 49-52) */}
      <RigMachineBase accentColor={ACCENT} />

      {/* Glass stabilisation column — the processing chamber the orb settles into */}
      <mesh position={[0, COLUMN_CENTER_Y, 0]}>
        <cylinderGeometry args={[COLUMN_RADIUS, COLUMN_RADIUS, COLUMN_HEIGHT, 48, 1, true]} />
        <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.2} roughness={0.14} />
      </mesh>
      {/* Thin rim seals top and bottom of the tube so it reads as real glassware */}
      {[RIG_MACHINE_MOUNT_Y + 0.01, COLUMN_TOP_Y - 0.01].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COLUMN_RADIUS, 0.03, 10, 56]} />
          <meshStandardMaterial
            color={PROCESS_METAL_COLOR}
            metalness={1}
            roughness={0.35}
            envMapIntensity={1.1}
          />
        </mesh>
      ))}

      {/* Internal cyan energy the orb stabilises within */}
      <mesh ref={plasmaRef} position={[0, COLUMN_CENTER_Y, 0]}>
        <cylinderGeometry args={[COLUMN_RADIUS * 0.72, COLUMN_RADIUS * 0.72, COLUMN_HEIGHT * 0.9, 32, 1, true]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.85} transparent opacity={0.16} />
      </mesh>
      {/* Faint rising energy streaks */}
      <group ref={streaksRef}>
        {INNER_STREAKS.map((i) => {
          const angle = (i / INNER_STREAKS.length) * Math.PI * 2;
          const r = COLUMN_RADIUS * 0.5;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, COLUMN_CENTER_Y, Math.sin(angle) * r]}
            >
              <cylinderGeometry args={[0.006, 0.006, COLUMN_HEIGHT * 0.8, 6]} />
              <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={0.8} transparent opacity={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* Reagent-lock cage around the column base */}
      {[RIG_MACHINE_MOUNT_Y + 0.28, RIG_MACHINE_MOUNT_Y + 0.62].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COLUMN_RADIUS + 0.16, 0.014, 8, 64]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.6} transparent opacity={0.7} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const r = COLUMN_RADIUS + 0.16;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, RIG_MACHINE_MOUNT_Y + 0.45, Math.sin(angle) * r]}
          >
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial
              color={PROCESS_METAL_COLOR}
              metalness={1}
              roughness={0.4}
              envMapIntensity={1}
            />
          </mesh>
        );
      })}

      {/* Machine head — dark brushed-metal piston on top of the column */}
      <group position={[0, COLUMN_TOP_Y, 0]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[COLUMN_RADIUS + 0.05, COLUMN_RADIUS + 0.05, 0.16, 48]} />
          <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={1} roughness={0.34} envMapIntensity={1.1} />
        </mesh>
        <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COLUMN_RADIUS + 0.02, 0.01, 8, 56]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.8} />
        </mesh>
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.42, 0.5, 0.42, 40]} />
          <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={1} roughness={0.4} envMapIntensity={1} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.5, 0.46, 0.1, 40]} />
          <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={1} roughness={0.32} envMapIntensity={1.2} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.08, 32]} />
          <meshStandardMaterial color="#0c1116" metalness={0.9} roughness={0.5} />
        </mesh>
      </group>

      {/* Floating periodic-tile motif — the reagent waiting to feed into the column */}
      <group ref={tileRef} position={[-1.15, 0.78, 0.35]} rotation={[0, 0.32, 0]}>
        {/* Glass plate */}
        <mesh>
          <boxGeometry args={[0.54, 0.66, 0.02]} />
          <meshPhysicalMaterial
            color="#0b1a24"
            transparent
            opacity={0.42}
            roughness={0.1}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.15}
            ior={1.4}
            envMapIntensity={1.2}
          />
        </mesh>
        {/* Emissive frame */}
        {[
          { p: [0, 0.32, 0.012] as const, s: [0.54, 0.014, 0.006] as const },
          { p: [0, -0.32, 0.012] as const, s: [0.54, 0.014, 0.006] as const },
          { p: [-0.26, 0, 0.012] as const, s: [0.014, 0.66, 0.006] as const },
          { p: [0.26, 0, 0.012] as const, s: [0.014, 0.66, 0.006] as const },
        ].map((bar, i) => (
          <mesh key={i} position={bar.p}>
            <boxGeometry args={bar.s} />
            <EmissiveCoreMaterial color={ACCENT} intensity={1} transparent opacity={0.85} />
          </mesh>
        ))}
        {/* Atomic-number / element hint — a small emissive dot cluster (no baked text) */}
        <mesh position={[0, 0.16, 0.02]}>
          <boxGeometry args={[0.18, 0.03, 0.006]} />
          <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.1} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, -0.02, 0.02]}>
          <circleGeometry args={[0.11, 24]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={1.3} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.24, 0.02]}>
          <boxGeometry args={[0.26, 0.02, 0.006]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.7} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}
