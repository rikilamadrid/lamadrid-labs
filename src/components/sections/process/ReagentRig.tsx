"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshStandardMaterial } from "three";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { RIG_FRAME_COLOR, RIG_PLATFORM_TOP_Y, RigGate, RigPlatform } from "./rigPrimitives";

interface ReagentRigProps {
  /** X position along the shared table path (feature 38 wires real placement). */
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.cyan;
const TILE_COLS = 3;
const TILE_ROWS = 2;
const ACTIVE_TILE_INDEX = 2;

// Stage 1 — Reagent Selection: a periodic-table tile rack (the source
// material) and a small vial tray in front, framed by entry/exit gates so
// the orb reads as arriving small, condensed, and stable, then leaving
// through the exit gate toward Measurement. One tile stays lit to imply the
// reagent has just been selected from the rack.
export function ReagentRig({ position = [0, 0, 0] }: ReagentRigProps) {
  const activeTileRef = useRef<Mesh>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      idle.current += delta;
    }
    if (activeTileRef.current) {
      const mat = activeTileRef.current.material as MeshStandardMaterial;
      const pulse = prefersReducedMotion ? 0 : Math.sin(idle.current * 2) * 0.25;
      mat.emissiveIntensity = 0.9 + pulse;
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Tile rack: back-of-table reagent source */}
      <group position={[-0.7, 0, -0.45]}>
        {Array.from({ length: TILE_ROWS }).map((_, row) =>
          Array.from({ length: TILE_COLS }).map((__, col) => {
            const index = row * TILE_COLS + col;
            const isActive = index === ACTIVE_TILE_INDEX;
            const x = (col - (TILE_COLS - 1) / 2) * 0.26;
            const y = RIG_PLATFORM_TOP_Y + 0.14 + row * 0.26;
            return (
              <mesh
                key={index}
                ref={isActive ? activeTileRef : undefined}
                position={[x, y, 0]}
              >
                <boxGeometry args={[0.2, 0.2, 0.06]} />
                <meshStandardMaterial
                  color={isActive ? ACCENT : "#2a333c"}
                  emissive={isActive ? ACCENT : "#000000"}
                  emissiveIntensity={isActive ? 0.9 : 0}
                  metalness={0.4}
                  roughness={0.4}
                />
              </mesh>
            );
          }),
        )}
      </group>

      {/* Sample vial tray: front-of-table, closer to the orb's path */}
      <mesh position={[0.4, RIG_PLATFORM_TOP_Y + 0.03, 0.4]}>
        <boxGeometry args={[1.1, 0.06, 0.4]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.5} roughness={0.4} />
      </mesh>
      {[-0.35, 0, 0.35].map((offset) => (
        <group key={offset} position={[0.4 + offset, RIG_PLATFORM_TOP_Y + 0.28, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.45, 10]} />
            <meshStandardMaterial
              color="#0e1216"
              transparent
              opacity={0.35}
              metalness={0.1}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.18, 10]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
