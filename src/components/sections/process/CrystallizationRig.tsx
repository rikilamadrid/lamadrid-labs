"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { RIG_FRAME_COLOR, RIG_PLATFORM_TOP_Y, RigGate, RigPlatform } from "./rigPrimitives";

interface CrystallizationRigProps {
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.teal;

// Stage 5 — Crystallization: a sealed glass chamber at rig center housing a
// faceted crystal cluster, lit from below by an illuminated pedestal beam —
// the "output station" where the orb settles into its final, most refined
// form. Per the brief this is the deliberate calm resting point of the whole
// sequence: the slowest, smallest-amplitude motion of any rig (only a faint
// beam/crystal shimmer), no spinning or swirling.
export function CrystallizationRig({ position = [0, 0, 0] }: CrystallizationRigProps) {
  const beamGlowRef = useRef<Mesh>(null);
  const crystalGroupRef = useRef<Group>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      idle.current += delta;
    }
    const t = idle.current;

    if (beamGlowRef.current) {
      const mat = beamGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + (prefersReducedMotion ? 0 : Math.sin(t * 0.5) * 0.12);
    }
    if (crystalGroupRef.current && !prefersReducedMotion) {
      crystalGroupRef.current.rotation.y += delta * 0.08;
    }
  });

  const shardOffsets: [number, number, number][] = [
    [0, 0.36, 0],
    [0.14, 0.2, 0.08],
    [-0.16, 0.16, -0.1],
    [0.05, 0.5, -0.06],
  ];

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Illuminated pedestal beneath the sealed chamber */}
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.05, 0]}>
        <cylinderGeometry args={[0.34, 0.4, 0.1, 24]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={beamGlowRef} position={[0, RIG_PLATFORM_TOP_Y + 0.45, 0]}>
        <cylinderGeometry args={[0.05, 0.16, 0.8, 16, 1, true]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.6}
          transparent
          opacity={0.22}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Sealed chamber: a faceted enclosure around the crystal cluster */}
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.5, 0]}>
        <boxGeometry args={[0.62, 0.85, 0.62]} />
        <meshStandardMaterial
          color={ACCENT}
          transparent
          opacity={0.12}
          metalness={0.1}
          roughness={0.05}
          side={DoubleSide}
        />
      </mesh>

      {/* Crystal cluster: the orb's final, most refined resting form */}
      <group ref={crystalGroupRef} position={[0, RIG_PLATFORM_TOP_Y + 0.12, 0]}>
        {shardOffsets.map((offset, i) => (
          <mesh key={i} position={offset} rotation={[0.2 * i, 0.4 * i, 0.1 * i]}>
            <octahedronGeometry args={[0.14 - i * 0.015, 0]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.7}
              metalness={0.2}
              roughness={0.15}
              transparent
              opacity={0.92}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
