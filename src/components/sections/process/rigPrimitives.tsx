import { DoubleSide } from "three";

// Shared dimensions/materials so all stage device rigs (36, 37) read as one
// physical table rather than disconnected dioramas: same platform height,
// depth, and frame material regardless of which device sits on top.
export const RIG_PLATFORM_WIDTH = 4.4;
export const RIG_PLATFORM_DEPTH = 1.8;
export const RIG_PLATFORM_HEIGHT = 0.14;
export const RIG_PLATFORM_TOP_Y = -0.88;
export const RIG_FRAME_COLOR = "#141a20";

interface RigPlatformProps {
  accentColor: string;
}

// The table segment every rig sits on. A thin emissive strip along the
// front edge carries the stage's accent color so the shared surface still
// reads as stage-specific at a glance.
export function RigPlatform({ accentColor }: RigPlatformProps) {
  return (
    <group>
      <mesh position={[0, RIG_PLATFORM_TOP_Y - RIG_PLATFORM_HEIGHT / 2, 0]}>
        <boxGeometry args={[RIG_PLATFORM_WIDTH, RIG_PLATFORM_HEIGHT, RIG_PLATFORM_DEPTH]} />
        <meshStandardMaterial color={RIG_FRAME_COLOR} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh
        position={[
          0,
          RIG_PLATFORM_TOP_Y - RIG_PLATFORM_HEIGHT + 0.005,
          RIG_PLATFORM_DEPTH / 2 - 0.02,
        ]}
      >
        <boxGeometry args={[RIG_PLATFORM_WIDTH - 0.2, 0.01, 0.02]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

interface RigGateProps {
  /** X position along the shared table path (entry side negative, exit side positive). */
  x: number;
  accentColor: string;
  height?: number;
  width?: number;
}

// Two pillars + a connecting arch bar marking the point the orb passes
// through on its way in or out of a rig — the "clear entry/exit point"
// the brief calls for, reused identically across every rig for continuity.
export function RigGate({ x, accentColor, height = 1.5, width = 1.5 }: RigGateProps) {
  const pillarHeight = height;
  const pillarY = RIG_PLATFORM_TOP_Y + pillarHeight / 2;
  const pillarRadius = 0.035;

  return (
    <group position={[x, 0, 0]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, pillarY, (side * width) / 2]}>
          <cylinderGeometry args={[pillarRadius, pillarRadius, pillarHeight, 10]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.45}
            metalness={0.3}
            roughness={0.25}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
      <mesh
        position={[0, pillarY + pillarHeight / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[pillarRadius * 0.8, pillarRadius * 0.8, width, 10]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.45}
          metalness={0.3}
          roughness={0.25}
          transparent
          opacity={0.85}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
