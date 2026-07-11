"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { Mesh } from "three";

interface IntakeSpecimenProps {
  progress: RefObject<number>;
  color: string;
}

// The Intake stage's specimen: a wireframe shell around a glowing core.
// Idle motion keeps it alive at rest; scroll progress (written by
// NarrativeStage's ScrollTrigger, read here per-frame) adds directional
// spin and growth as the stage scrubs into and out of view.
export function IntakeSpecimen({ progress, color }: IntakeSpecimenProps) {
  const shellRef = useRef<Mesh>(null);
  const coreRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const p = progress.current;

    if (shellRef.current) {
      shellRef.current.rotation.y += delta * (0.12 + p * 0.5);
      shellRef.current.rotation.x = p * Math.PI * 0.2;
      const scale = 0.9 + p * 0.2;
      shellRef.current.scale.setScalar(scale);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * (0.2 + p * 0.4);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={30} color={color} />

      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.35}
        />
      </mesh>
    </>
  );
}
