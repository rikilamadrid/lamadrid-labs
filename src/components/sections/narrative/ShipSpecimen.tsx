"use client";

import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { DoubleSide } from "three";
import type { Group, Mesh } from "three";

interface ShipSpecimenProps {
  progress: RefObject<number>;
  color: string;
}

const GATE_COUNT = 3;

// The Ship stage's specimen: a package that travels forward through a
// sequence of gate rings as scroll progress advances, shrinking and
// brightening as it nears the camera. It's the last stage before the
// finale, so the motion is deliberately outward/departing rather than
// settling in place, reading as a hand-off rather than an end state.
export function ShipSpecimen({ progress, color }: ShipSpecimenProps) {
  const packageRef = useRef<Mesh>(null);
  const gateGroupRef = useRef<Group>(null);
  const gateRefs = useRef<(Mesh | null)[]>([]);

  const gates = useMemo(
    () =>
      Array.from({ length: GATE_COUNT }).map((_, i) => ({
        baseZ: -0.9 + i * 0.9,
      })),
    [],
  );

  useFrame((_, delta) => {
    const p = progress.current;

    if (packageRef.current) {
      packageRef.current.position.z = -0.6 + p * 1.8;
      packageRef.current.rotation.y += delta * (0.3 + p * 0.6);
      packageRef.current.rotation.x += delta * 0.15;
      const scale = 0.55 - p * 0.2;
      packageRef.current.scale.setScalar(scale);
    }

    if (gateGroupRef.current) {
      gateGroupRef.current.rotation.z += delta * 0.05;
    }

    gateRefs.current.forEach((gate, i) => {
      if (!gate) return;
      const base = gates[i].baseZ;
      gate.position.z = base + p * 1.4;
      const passed = gate.position.z > 0.2;
      const targetScale = passed ? 1.25 : 1;
      gate.scale.setScalar(
        gate.scale.x + (targetScale - gate.scale.x) * 0.1,
      );
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={30} color={color} />

      <group ref={gateGroupRef}>
        {gates.map((gate, i) => (
          <mesh
            key={i}
            ref={(el) => {
              gateRefs.current[i] = el;
            }}
            position={[0, 0, gate.baseZ]}
          >
            <ringGeometry args={[0.7, 0.78, 40]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={packageRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          roughness={0.3}
        />
      </mesh>
    </>
  );
}
