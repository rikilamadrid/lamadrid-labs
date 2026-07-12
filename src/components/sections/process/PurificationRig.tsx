"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import type { Mesh, MeshStandardMaterial } from "three";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { RIG_FRAME_COLOR, RIG_PLATFORM_TOP_Y, RigGate, RigPlatform } from "./rigPrimitives";

interface PurificationRigProps {
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.rose;
const FILTER_LAYERS = 3;

// Stage 4 — Purification: a glass filtration column at rig center (the
// processing chamber, per the brief) with layered filter media the orb
// passes down through, a condenser coil wrapped around the upper column,
// and a collection vessel at the base catching the clarified result. Motion
// is deliberately calmer and slower than Synthesis's stirrer/swirl — this
// stage reads as refinement settling down, not a reaction ramping up.
export function PurificationRig({ position = [0, 0, 0] }: PurificationRigProps) {
  const coilGlowRef = useRef<Mesh>(null);
  const collectionGlowRef = useRef<Mesh>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      idle.current += delta;
    }
    const t = idle.current;

    if (coilGlowRef.current) {
      const mat = coilGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + (prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 0.15);
    }
    if (collectionGlowRef.current) {
      const mat = collectionGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.75 + (prefersReducedMotion ? 0 : Math.sin(t * 0.9 + 1) * 0.2);
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Filtration column: the orb's entry-to-exit processing chamber */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.15, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.85, 20, 1, true]} />
          <meshStandardMaterial
            color={ACCENT}
            transparent
            opacity={0.28}
            metalness={0.1}
            roughness={0.1}
            side={DoubleSide}
          />
        </mesh>
        {Array.from({ length: FILTER_LAYERS }).map((_, i) => {
          const layerOpacity = 0.75 - i * 0.18;
          return (
            <mesh key={i} position={[0, 0.18 + i * 0.22, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.03, 20]} />
              <meshStandardMaterial
                color={ACCENT}
                emissive={ACCENT}
                emissiveIntensity={0.4}
                transparent
                opacity={layerOpacity}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* Condenser coil wrapped around the upper column */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.75, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            ref={i === 3 ? coilGlowRef : undefined}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, i * 0.12, 0]}
          >
            <torusGeometry args={[0.34, 0.02, 8, 24]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.5}
              metalness={0.3}
              roughness={0.2}
              transparent
              opacity={0.85}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Collection vessel: the clarified, calmer output pooling at the base */}
      <mesh position={[0, RIG_PLATFORM_TOP_Y + 0.06, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.12, 20]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh ref={collectionGlowRef} position={[0, RIG_PLATFORM_TOP_Y + 0.1, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.03, 20]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.75}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
