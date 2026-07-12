"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Color, DoubleSide } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { processStages } from "@/data/process";
import type { OrbState } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { clamp01, lerp } from "@/lib/math";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";

interface OrbProps {
  /** 0-1 across the whole Process section (all 5 stages). */
  progress: number;
}

interface DerivedOrbFrame extends OrbState {
  color: Color;
}

const STAGE_COUNT = processStages.length;

// Content model's orbState.scale (34) is a unitless 1-2.4 range meant for
// this component to translate into a real Three.js value — applied
// literally it overflows the camera frustum, so it's damped into a subtle
// growth range instead.
const SCALE_DAMPING = 0.3;

// Blends orbState + signal color between the two stages `progress` sits
// between, so the orb reads as one object evolving rather than 5 swapped
// models. Kept pure/allocation-light since it runs every frame.
function deriveOrbFrame(progress: number): DerivedOrbFrame {
  const segment = clamp01(progress) * (STAGE_COUNT - 1);
  const fromIndex = Math.min(Math.floor(segment), STAGE_COUNT - 2);
  const t = segment - fromIndex;

  const from = processStages[fromIndex];
  const to = processStages[fromIndex + 1];

  const fromColor = narrativeSignalColors[from.signal];
  const toColor = narrativeSignalColors[to.signal];

  const rawScale = lerp(from.orbState.scale, to.orbState.scale, t);

  return {
    scale: 1 + (rawScale - 1) * SCALE_DAMPING,
    glow: lerp(from.orbState.glow, to.orbState.glow, t),
    geometryMorph: lerp(from.orbState.geometryMorph, to.orbState.geometryMorph, t),
    motionIntensity: lerp(from.orbState.motionIntensity, to.orbState.motionIntensity, t),
    color: new Color(fromColor).lerp(new Color(toColor), t),
  };
}

// The single persistent specimen orb: a glass shell around a core that
// crossfades from a smooth sphere to a faceted crystal as `geometryMorph`
// advances, ringed by two orbit bands echoing the brand mark's atom motif.
// Reads `progress` (0-1) and derives its own stage blend — no scroll wiring
// here, that's feature 38's job.
export function Orb({ progress }: OrbProps) {
  const groupRef = useRef<Group>(null);
  const smoothCoreRef = useRef<Mesh>(null);
  const crystalCoreRef = useRef<Mesh>(null);
  const shellRef = useRef<Mesh>(null);
  const ringARef = useRef<Mesh>(null);
  const ringBRef = useRef<Mesh>(null);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef({ time: 0 });

  const baseColor = useMemo(() => new Color(), []);

  useFrame((_, delta) => {
    const frame = deriveOrbFrame(progressRef.current);
    baseColor.copy(frame.color);

    if (!prefersReducedMotion) {
      idle.current.time += delta;
    }
    const t = idle.current.time;

    if (groupRef.current) {
      groupRef.current.scale.setScalar(frame.scale);
      if (!prefersReducedMotion) {
        groupRef.current.rotation.y += delta * (0.08 + frame.motionIntensity * 0.35);
      }
    }

    if (smoothCoreRef.current) {
      const opacity = 1 - frame.geometryMorph;
      const mat = smoothCoreRef.current.material as MeshStandardMaterial;
      mat.opacity = opacity;
      mat.emissive.copy(baseColor);
      mat.emissiveIntensity = 0.4 + frame.glow * 0.8;
      const breathe = prefersReducedMotion
        ? 0
        : Math.sin(t * (1 + frame.motionIntensity * 2)) * 0.05 * frame.motionIntensity;
      smoothCoreRef.current.scale.setScalar(0.42 + breathe);
    }

    if (crystalCoreRef.current) {
      const opacity = frame.geometryMorph;
      const mat = crystalCoreRef.current.material as MeshStandardMaterial;
      mat.opacity = opacity;
      mat.emissive.copy(baseColor);
      mat.emissiveIntensity = 0.5 + frame.glow;
      if (!prefersReducedMotion) {
        crystalCoreRef.current.rotation.y -= delta * (0.1 + frame.motionIntensity * 0.2);
      }
    }

    if (shellRef.current) {
      const mat = shellRef.current.material as MeshStandardMaterial;
      mat.color.copy(baseColor);
      mat.emissive.copy(baseColor);
      mat.emissiveIntensity = 0.15 + frame.glow * 0.25;
    }

    [ringARef, ringBRef].forEach((ring, i) => {
      if (!ring.current) return;
      const mat = ring.current.material as MeshStandardMaterial;
      mat.color.copy(baseColor);
      mat.emissive.copy(baseColor);
      mat.emissiveIntensity = 0.3 + frame.glow * 0.6;
      mat.opacity = 0.25 + frame.glow * 0.35;
      if (!prefersReducedMotion) {
        const direction = i === 0 ? 1 : -1;
        ring.current.rotation.z += delta * direction * (0.05 + frame.motionIntensity * 0.25);
      }
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 2, 3]} intensity={35} color="#ffffff" />
      <pointLight position={[-2, -1, -2]} intensity={12} color="#ffffff" />

      <group ref={groupRef}>
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.85, 48, 48]} />
          <meshStandardMaterial
            roughness={0.15}
            metalness={0.05}
            transparent
            opacity={0.32}
          />
        </mesh>

        <mesh ref={smoothCoreRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial roughness={0.25} metalness={0.1} transparent />
        </mesh>

        <mesh ref={crystalCoreRef}>
          <icosahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial roughness={0.15} metalness={0.2} transparent flatShading />
        </mesh>

        <mesh ref={ringARef} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.65, 0.01, 8, 64]} />
          <meshStandardMaterial transparent side={DoubleSide} />
        </mesh>
        <mesh ref={ringBRef} rotation={[Math.PI / 1.6, Math.PI / 5, 0]}>
          <torusGeometry args={[0.72, 0.008, 8, 64]} />
          <meshStandardMaterial transparent side={DoubleSide} />
        </mesh>
      </group>
    </>
  );
}
