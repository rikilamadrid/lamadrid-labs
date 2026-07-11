"use client";

import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { Group, Mesh } from "three";

interface BuildSpecimenProps {
  progress: RefObject<number>;
  color: string;
}

const GRID_SIZE = 3;
const SPACING = 0.55;

// The Build stage's specimen: a cluster of blocks that assembles into a
// grid as scroll progress advances, each block scaling in with a small
// stagger based on its distance from center so the structure reads as
// being built outward rather than popping in at once.
export function BuildSpecimen({ progress, color }: BuildSpecimenProps) {
  const groupRef = useRef<Group>(null);
  const blockRefs = useRef<(Mesh | null)[]>([]);

  const blocks = useMemo(() => {
    const offset = (GRID_SIZE - 1) / 2;
    const items: { position: [number, number, number]; delay: number }[] = [];

    for (let x = 0; x < GRID_SIZE; x += 1) {
      for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let z = 0; z < GRID_SIZE; z += 1) {
          const position: [number, number, number] = [
            (x - offset) * SPACING,
            (y - offset) * SPACING,
            (z - offset) * SPACING,
          ];
          const delay = Math.sqrt(
            (x - offset) ** 2 + (y - offset) ** 2 + (z - offset) ** 2,
          );
          items.push({ position, delay });
        }
      }
    }

    return items;
  }, []);

  const maxDelay = useMemo(
    () => Math.max(...blocks.map((block) => block.delay)),
    [blocks],
  );

  useFrame((_, delta) => {
    const p = progress.current;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.1 + p * 0.35);
    }

    blocks.forEach((block, i) => {
      const mesh = blockRefs.current[i];
      if (!mesh) return;

      const staggered = Math.min(
        1,
        Math.max(0, p * 1.6 - (block.delay / maxDelay) * 0.6),
      );
      mesh.scale.setScalar(0.25 + staggered * 0.75);
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={30} color={color} />

      <group ref={groupRef}>
        {blocks.map((block, i) => (
          <mesh
            key={i}
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
            position={block.position}
          >
            <boxGeometry args={[0.32, 0.32, 0.32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
