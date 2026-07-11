"use client";

import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { DoubleSide } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";

interface TestSpecimenProps {
  progress: RefObject<number>;
  color: string;
}

const MARKER_COUNT = 6;

// The Test stage's specimen: a wireframe core under inspection, ringed by
// marker nodes that light up one by one as scroll progress advances (each
// standing in for a passing check), while a scanning plane sweeps up and
// down through the core to read as active verification in progress.
export function TestSpecimen({ progress, color }: TestSpecimenProps) {
  const coreRef = useRef<Mesh>(null);
  const markerGroupRef = useRef<Group>(null);
  const markerRefs = useRef<(Mesh | null)[]>([]);
  const scanRef = useRef<Mesh>(null);

  const markers = useMemo(() => {
    const radius = 0.95;
    return Array.from({ length: MARKER_COUNT }).map((_, i) => {
      const angle = (i / MARKER_COUNT) * Math.PI * 2;
      return {
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
      };
    });
  }, []);

  useFrame(({ clock }, delta) => {
    const p = progress.current;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (0.1 + p * 0.3);
    }

    if (markerGroupRef.current) {
      markerGroupRef.current.rotation.y -= delta * 0.12;
    }

    markerRefs.current.forEach((marker, i) => {
      if (!marker) return;
      const threshold = i / MARKER_COUNT;
      const active = p > threshold;
      const target = active ? 1 : 0.3;
      const material = marker.material as MeshStandardMaterial;
      material.emissiveIntensity +=
        (target - material.emissiveIntensity) * 0.15;
      const scale = active ? 1 : 0.6;
      marker.scale.setScalar(scale);
    });

    if (scanRef.current) {
      const sweep = (Math.sin(clock.elapsedTime * (0.6 + p * 1.2)) + 1) / 2;
      scanRef.current.position.y = (sweep - 0.5) * 1.6;
      scanRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={30} color={color} />

      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>

      <group ref={markerGroupRef}>
        {markers.map((marker, i) => (
          <mesh
            key={i}
            ref={(el) => {
              markerRefs.current[i] = el;
            }}
            position={marker.position}
          >
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 1.15, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          transparent
          opacity={0.35}
          side={DoubleSide}
        />
      </mesh>
    </>
  );
}
