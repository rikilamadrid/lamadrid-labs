"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { DoubleSide } from "three";
import type { Group, Mesh } from "three";

interface ArchitectureSpecimenProps {
  progress: RefObject<number>;
  color: string;
}

const PLATE_COUNT = 4;

// The Architecture stage's specimen: a stack of wireframe blueprint plates
// around a rotating structural frame. Scroll progress explodes the plates
// apart along Y to read as a blueprint being pulled into layers, then
// settles them back as the stage scrubs out of view.
export function ArchitectureSpecimen({
  progress,
  color,
}: ArchitectureSpecimenProps) {
  const frameRef = useRef<Mesh>(null);
  const plateGroupRef = useRef<Group>(null);
  const plateRefs = useRef<(Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const p = progress.current;

    if (frameRef.current) {
      frameRef.current.rotation.y += delta * (0.1 + p * 0.3);
      frameRef.current.rotation.x = p * Math.PI * 0.15;
    }

    if (plateGroupRef.current) {
      plateGroupRef.current.rotation.y += delta * 0.08;
    }

    plateRefs.current.forEach((plate, i) => {
      if (!plate) return;
      const centered = i - (PLATE_COUNT - 1) / 2;
      plate.position.y = centered * (0.22 + p * 0.35);
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={30} color={color} />

      <mesh ref={frameRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>

      <group ref={plateGroupRef}>
        {Array.from({ length: PLATE_COUNT }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              plateRefs.current[i] = el;
            }}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[0.55, 0.62, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
