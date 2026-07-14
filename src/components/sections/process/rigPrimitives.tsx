import { DoubleSide } from "three";
import { PROCESS_METAL_COLOR } from "@/lib/narrativeSignals";

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

interface RigMachineBaseProps {
  accentColor: string;
  /** Outer radius of the pedestal foot. */
  radius?: number;
}

// Feature 48 — the branded machine pedestal a premium stage device mounts on:
// a brushed-metal foot disc, a glowing under-seam in the stage accent, a
// tapered body with a small control-panel readout notch, and a mount plate the
// device (glass column, scale, etc.) sits on. Extracted here as a shared
// primitive so the later premium rebuilds (49-52) reuse the same branded base
// rather than each hand-rolling one — keeping the five stations a matched set.
// Material is written inline (brushed metal + toneMapped-false emissive) rather
// than importing processMaterials to avoid a module cycle (processMaterials
// already imports RIG_PLATFORM_TOP_Y from here).
export function RigMachineBase({ accentColor, radius = 0.95 }: RigMachineBaseProps) {
  const topY = RIG_PLATFORM_TOP_Y;
  return (
    <group>
      {/* Foot disc */}
      <mesh position={[0, topY + 0.06, 0]}>
        <cylinderGeometry args={[radius, radius * 1.04, 0.12, 48]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.36}
          envMapIntensity={1.1}
        />
      </mesh>
      {/* Under-seam glow ring in the stage accent */}
      <mesh position={[0, topY + 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.96, 0.012, 8, 72]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
      {/* Tapered body */}
      <mesh position={[0, topY + 0.29, 0]}>
        <cylinderGeometry args={[radius * 0.82, radius * 0.92, 0.3, 48]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.42}
          envMapIntensity={1}
        />
      </mesh>
      {/* Control-panel readout hint, sitting proud of the tapered front face */}
      <mesh position={[0, topY + 0.26, radius * 0.94]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.34, 0.1, 0.015]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.55}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Mount plate the device sits on */}
      <mesh position={[0, topY + 0.47, 0]}>
        <cylinderGeometry args={[radius * 0.86, radius * 0.82, 0.08, 48]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

/** World-space Y of the machine-base mount plate top — where a device mounts. */
export const RIG_MACHINE_MOUNT_Y = RIG_PLATFORM_TOP_Y + 0.51;

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
