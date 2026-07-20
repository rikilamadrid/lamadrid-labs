"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshStandardMaterial } from "three";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { BrushedMetalMaterial } from "./processMaterials";
import {
  RIG_FRAME_COLOR,
  RIG_PLATFORM_DEPTH,
  RIG_PLATFORM_HEIGHT,
  RIG_PLATFORM_TOP_Y,
} from "./rigPrimitives";

interface StageAnchor {
  /** Rig center X, matching the `position` prop passed to that stage's rig. */
  x: number;
  accentColor: string;
}

interface ProcessTableProps {
  /** Ordered left-to-right (ascending X) — one entry per rig on the table. */
  stages: StageAnchor[];
  /** Half-width of each rig's own platform, so connectors start just past its edge. */
  rigHalfWidth?: number;
}

const LEG_HEIGHT = 0.6;

// The connective tissue between individual rigs (36, 37): fills the table
// gaps rig-to-rig with matching platform material, adds a glowing conduit
// rail that blends from one stage's accent color into the next so the path
// reads as directional flow, and drops support legs under the full span.
// Without this, 5 independently-positioned rigs read as disconnected
// dioramas rather than one physical lab table — the anti-goal the brief
// warns against.
export function ProcessTable({ stages, rigHalfWidth = 2.2 }: ProcessTableProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const idle = useRef(0);
  const railRefs = useRef<(Mesh | null)[]>([]);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) {
      idle.current += delta;
    }
    const t = idle.current;
    railRefs.current.forEach((rail, i) => {
      if (!rail) return;
      const mat = rail.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + (prefersReducedMotion ? 0 : Math.sin(t * 0.8 + i) * 0.15);
    });
  });

  const legX: number[] = [];
  if (stages.length > 0) {
    const minX = stages[0].x - rigHalfWidth;
    const maxX = stages[stages.length - 1].x + rigHalfWidth;
    const legCount = Math.max(2, Math.round((maxX - minX) / 3));
    for (let i = 0; i <= legCount; i++) {
      legX.push(minX + ((maxX - minX) * i) / legCount);
    }
  }

  return (
    <group>
      {stages.slice(0, -1).map((from, i) => {
        const to = stages[i + 1];
        const gapStart = from.x + rigHalfWidth;
        const gapEnd = to.x - rigHalfWidth;
        const gapWidth = gapEnd - gapStart;
        const gapCenter = (gapStart + gapEnd) / 2;
        if (gapWidth <= 0) return null;

        return (
          <group key={`${from.x}-${to.x}`}>
            {/* Floor filler: same platform material/height as each rig's base */}
            <mesh position={[gapCenter, RIG_PLATFORM_TOP_Y - RIG_PLATFORM_HEIGHT / 2, 0]}>
              <boxGeometry args={[gapWidth, RIG_PLATFORM_HEIGHT, RIG_PLATFORM_DEPTH]} />
              <BrushedMetalMaterial color={RIG_FRAME_COLOR} roughness={0.38} />
            </mesh>

            {/* Glowing conduit rail, blended left-stage color to right-stage color */}
            <mesh
              position={[
                gapStart + gapWidth * 0.25,
                RIG_PLATFORM_TOP_Y + 0.02,
                RIG_PLATFORM_DEPTH / 2 - 0.06,
              ]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.012, 0.012, gapWidth / 2, 8]} />
              <meshStandardMaterial
                color={from.accentColor}
                emissive={from.accentColor}
                emissiveIntensity={0.6}
                toneMapped={false}
              />
            </mesh>
            <mesh
              ref={(el) => {
                railRefs.current[i] = el;
              }}
              position={[
                gapStart + gapWidth * 0.75,
                RIG_PLATFORM_TOP_Y + 0.02,
                RIG_PLATFORM_DEPTH / 2 - 0.06,
              ]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.012, 0.012, gapWidth / 2, 8]} />
              <meshStandardMaterial
                color={to.accentColor}
                emissive={to.accentColor}
                emissiveIntensity={0.6}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* Support legs beneath the full span, giving the table physical weight */}
      {legX.map((x) => (
        <mesh
          key={x}
          position={[x, RIG_PLATFORM_TOP_Y - RIG_PLATFORM_HEIGHT - LEG_HEIGHT / 2, 0]}
        >
          <boxGeometry args={[0.08, LEG_HEIGHT, 0.08]} />
          <BrushedMetalMaterial color={RIG_FRAME_COLOR} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}
