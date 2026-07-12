"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { Mesh, MeshStandardMaterial } from "three";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { RIG_FRAME_COLOR, RIG_PLATFORM_TOP_Y, RigGate, RigPlatform } from "./rigPrimitives";

interface MeasurementRigProps {
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.violet;

// Stage 2 — Measurement: a digital scale pad the orb rests on at rig center
// (its natural entry/exit point, since it enters and leaves along the same
// axis it's weighed on), a holographic readout panel behind it, and two
// measuring cylinders as supporting detail. The readout panel's emissive
// strip pulses gently to read as "actively analyzing."
export function MeasurementRig({ position = [0, 0, 0] }: MeasurementRigProps) {
  const readoutRef = useRef<Mesh>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      idle.current += delta;
    }
    if (readoutRef.current) {
      const mat = readoutRef.current.material as MeshStandardMaterial;
      const pulse = prefersReducedMotion ? 0 : Math.sin(idle.current * 1.6) * 0.3;
      mat.emissiveIntensity = 0.7 + pulse;
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Scale base + pad: the orb's resting/measuring point at rig center */}
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.04, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.08, 24]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.09, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 24]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.35}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Holographic readout panel */}
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.85, -0.68]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[0.9, 0.55]} />
        <meshStandardMaterial
          color={RIG_FRAME_COLOR}
          metalness={0.4}
          roughness={0.5}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        ref={readoutRef}
        position={[0, RIG_PLATFORM_TOP_Y + 0.85, -0.665]}
        rotation={[-0.1, 0, 0]}
      >
        <planeGeometry args={[0.72, 0.4]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.7}
          transparent
          opacity={0.55}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.42, -0.68]}>
        <boxGeometry args={[0.06, 0.85, 0.06]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Measuring cylinders, supporting detail */}
      {[-1.15, 1.15].map((x) => (
        <group key={x} position={[x, RIG_PLATFORM_TOP_Y + 0.28, 0.5]}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.11, 0.5, 12]} />
            <meshStandardMaterial
              color="#0e1216"
              transparent
              opacity={0.3}
              metalness={0.1}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.085, 0.1, 0.25, 12]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
