"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { RIG_FRAME_COLOR, RIG_PLATFORM_TOP_Y, RigGate, RigPlatform } from "./rigPrimitives";

interface SynthesisRigProps {
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.amber;

// Stage 3 — Synthesis: a magnetic stirrer base beneath a reaction flask (the
// processing chamber the orb enters/exits through, per the brief), with
// glass tubes swirling around it. The strongest motion moment of the first
// half — stirrer plate and tube swirl both animate continuously, faster
// than the idle pulses on the other two rigs.
export function SynthesisRig({ position = [0, 0, 0] }: SynthesisRigProps) {
  const stirBarRef = useRef<Mesh>(null);
  const flaskGlowRef = useRef<Mesh>(null);
  const tubeSwirlRef = useRef<Group>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      idle.current += delta;
    }
    const t = idle.current;

    if (stirBarRef.current && !prefersReducedMotion) {
      stirBarRef.current.rotation.y += delta * 3.2;
    }
    if (flaskGlowRef.current) {
      const mat = flaskGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + (prefersReducedMotion ? 0 : Math.sin(t * 3) * 0.35);
    }
    if (tubeSwirlRef.current && !prefersReducedMotion) {
      tubeSwirlRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Stirrer base */}
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.06, 0]}>
        <cylinderGeometry args={[0.46, 0.5, 0.12, 20]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh ref={stirBarRef} position={[0, RIG_PLATFORM_TOP_Y + 0.13, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.06]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* Reaction flask: the processing chamber the orb passes through */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.15, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.42, 0.6, 16, 1, true]} />
          <meshStandardMaterial
            color={ACCENT}
            transparent
            opacity={0.35}
            metalness={0.1}
            roughness={0.1}
            side={DoubleSide}
          />
        </mesh>
        <mesh ref={flaskGlowRef} position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={1}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 12, 1, true]} />
          <meshStandardMaterial
            color={ACCENT}
            transparent
            opacity={0.35}
            metalness={0.1}
            roughness={0.1}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Connected glass tubes swirling around the flask */}
      <group ref={tubeSwirlRef} position={[0, RIG_PLATFORM_TOP_Y + 0.4, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation={[Math.PI / 2, 0, (i * Math.PI * 2) / 3]}
            position={[
              Math.cos((i * Math.PI * 2) / 3) * 0.62,
              0,
              Math.sin((i * Math.PI * 2) / 3) * 0.62,
            ]}
          >
            <torusGeometry args={[0.16, 0.015, 8, 20, Math.PI]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.65}
              transparent
              opacity={0.9}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
