"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import type { BufferGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import {
  PROCESS_CORE_WHITE,
  PROCESS_GLASS_TINT,
  PROCESS_METAL_COLOR,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { EmissiveCoreMaterial, GlassMaterial } from "./processMaterials";
import {
  RIG_MACHINE_MOUNT_Y,
  RIG_PLATFORM_TOP_Y,
  RigGate,
  RigMachineBase,
  RigPlatform,
} from "./rigPrimitives";

interface SynthesisRigProps {
  /** X position along the shared table path (feature 38 wires real placement). */
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.amber; // Synthesis — brightest/hottest cyan.

// ─── Vertical anchors ───────────────────────────────────────────────────────
// The stir plate sits on the shared machine-base mount plate; the flask stands
// on the stir plate, sized/positioned so the orb (pinned at the world origin,
// y≈0, when this stage is centred) settles into the lower reaction volume — the
// processing chamber the orb reacts inside, matching the other stages' pattern.
const STIR_PLATE_Y = RIG_MACHINE_MOUNT_Y + 0.03; // top of the stir plate
const FLASK_BASE_Y = STIR_PLATE_Y + 0.02;

// Flask-local heights (y=0 at the flask base, on the stir plate).
const LIQUID_TOP = 1.02; // glowing-liquid surface line inside the flask
const VORTEX_BOTTOM = 0.06; // where the vortex funnel converges (hot spot)
const NECK_TOP = 1.92; // flask mouth

// Abstract graduation marks up the flask wall (the reference's ml ticks — no
// baked text, just emissive marks so the vessel reads as calibrated glass).
const GRADUATIONS = [0.34, 0.5, 0.66, 0.82];

// ─── Erlenmeyer flask profile ───────────────────────────────────────────────
// A surface-of-revolution silhouette for the reaction flask: flat domed bottom,
// wide conical body, short cylindrical neck, flared lip. Wide enough at the
// waist to contain the orb; revolved as premium transmission glass.
function buildFlaskProfile(): Vector2[] {
  return [
    new Vector2(0.001, 0.0),
    new Vector2(0.6, 0.0),
    new Vector2(1.12, 0.01),
    new Vector2(1.32, 0.06),
    new Vector2(1.36, 0.14),
    new Vector2(1.36, 0.2),
    new Vector2(1.3, 0.32),
    new Vector2(1.02, 0.78),
    new Vector2(0.66, 1.32),
    new Vector2(0.42, 1.66),
    new Vector2(0.32, 1.74),
    new Vector2(0.3, NECK_TOP - 0.06),
    new Vector2(0.3, NECK_TOP),
    new Vector2(0.37, NECK_TOP + 0.06),
    new Vector2(0.35, NECK_TOP + 0.1),
  ];
}

// ─── Vortex helix ───────────────────────────────────────────────────────────
// The spinning liquid tornado inside the flask, built as a tube swept along a
// helix that starts wide at the liquid surface and spirals down to a point at
// the flask bottom. Rotating the whole vortex group makes the funnel read as
// spinning — the strongest, most energetic motion of the five stages, but
// controlled (one swept tube, not a particle storm).
function buildVortexHelix(
  turns: number,
  phase: number,
  topRadius: number,
  tubeRadius: number,
): BufferGeometry {
  const points: Vector3[] = [];
  const samples = 90;
  for (let i = 0; i <= samples; i++) {
    const tt = i / samples; // 0 at surface → 1 at the convergence point
    const y = LIQUID_TOP - (LIQUID_TOP - VORTEX_BOTTOM) * tt;
    const radius = topRadius * Math.pow(1 - tt, 1.35);
    const angle = phase + tt * Math.PI * 2 * turns;
    points.push(new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
  }
  const curve = new CatmullRomCurve3(points);
  return new TubeGeometry(curve, 110, tubeRadius, 8, false);
}

// Feature 50 — Stage 3, Synthesis: premium rebuild.
//
// A recognisable magnetic-stirrer synthesis station matching the reference
// render (magnetic stirrer + glowing liquid vortex): the shared branded
// RigMachineBase carrying a circular stir plate with a bright accent under-glow
// where the flask sits, a glass Erlenmeyer flask (feature 45's transmission
// glass) holding a spinning glowing liquid vortex the orb reacts inside, and a
// front control console reading out SPEED / TEMP (abstract emissive readouts —
// the HUD panel carries the real copy) with a physical dial. Entry/exit gates
// keep the shared-table continuity. Peak reaction energy — deliberately the
// most animated rig, contrasting Measurement's (stage 2) analytical stillness,
// but controlled/expensive, not chaotic. All motion gates on reduced motion
// (the vortex parks static); the glass scales down via the shared quality tier.
export function SynthesisRig({ position = [0, 0, 0] }: SynthesisRigProps) {
  const tier = useProcessQualityTier();
  const prefersReducedMotion = usePrefersReducedMotion();

  const vortexRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const hotSpotRef = useRef<Mesh>(null);
  const surfaceRef = useRef<Mesh>(null);
  const plateGlowRef = useRef<Mesh>(null);
  const sparksRef = useRef<Group>(null);
  const speedRef = useRef<Mesh>(null);
  const tempRef = useRef<Mesh>(null);
  const idle = useRef(0);

  const flaskProfile = useMemo(() => buildFlaskProfile(), []);
  const helixA = useMemo(() => buildVortexHelix(4, 0, 0.78, 0.05), []);
  const helixB = useMemo(() => buildVortexHelix(4, Math.PI, 0.6, 0.038), []);
  useEffect(() => {
    return () => {
      helixA.dispose();
      helixB.dispose();
    };
  }, [helixA, helixB]);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) idle.current += delta;
    const t = idle.current;

    // Vortex spins fast — the reaction's peak energy. Parked under reduced motion.
    if (vortexRef.current && !prefersReducedMotion) {
      vortexRef.current.rotation.y += delta * 3.0;
    }
    // Hot convergence point + core column pulse hard (the boiling reaction).
    if (coreRef.current) {
      const mat = coreRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 1.6 + (prefersReducedMotion ? 0 : Math.sin(t * 6) * 0.6);
    }
    if (hotSpotRef.current) {
      const mat = hotSpotRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 2.2 + (prefersReducedMotion ? 0 : Math.abs(Math.sin(t * 5)) * 1.2);
    }
    // Liquid surface swirls the opposite way, slower, so the read isn't rigid.
    if (surfaceRef.current && !prefersReducedMotion) {
      surfaceRef.current.rotation.z -= delta * 1.1;
    }
    // Rising energy sparks spiral up and reset.
    if (sparksRef.current && !prefersReducedMotion) {
      sparksRef.current.rotation.y += delta * 1.6;
      sparksRef.current.children.forEach((spark, i) => {
        const phase = (t * 0.5 + i * 0.31) % 1;
        spark.position.y = VORTEX_BOTTOM + phase * (LIQUID_TOP - VORTEX_BOTTOM);
        const s = Math.sin(phase * Math.PI);
        spark.scale.setScalar(0.4 + s * 0.7);
      });
    }
    // Under-flask stir-plate glow breathes with the reaction.
    if (plateGlowRef.current) {
      const mat = plateGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 1 + (prefersReducedMotion ? 0 : Math.sin(t * 3) * 0.4);
    }
    // Console SPEED/TEMP readouts hold a live-instrument flicker.
    if (speedRef.current) {
      const mat = speedRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.9 + (prefersReducedMotion ? 0 : Math.sin(t * 7) * 0.15);
    }
    if (tempRef.current) {
      const mat = tempRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.7 + (prefersReducedMotion ? 0 : Math.sin(t * 2.2) * 0.08);
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Branded machine pedestal (shared primitive) */}
      <RigMachineBase accentColor={ACCENT} />

      {/* Circular magnetic-stirrer plate on the mount plate, with a bright
          accent under-glow ring where the flask stands (the reference's glowing
          ring beneath the flask). */}
      <mesh position={[0, STIR_PLATE_Y - 0.04, 0]}>
        <cylinderGeometry args={[1.42, 1.46, 0.1, 56]} />
        <meshStandardMaterial
          color={PROCESS_METAL_COLOR}
          metalness={1}
          roughness={0.32}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={[0, STIR_PLATE_Y + 0.012, 0]}>
        <cylinderGeometry args={[1.24, 1.28, 0.04, 56]} />
        <meshStandardMaterial
          color="#0e141a"
          metalness={0.9}
          roughness={0.4}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh ref={plateGlowRef} position={[0, STIR_PLATE_Y + 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.24, 0.03, 10, 72]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={1} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, STIR_PLATE_Y + 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 56]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.22} />
      </mesh>

      {/* Glass Erlenmeyer flask — the reaction chamber (feature 45 transmission
          glass, revolved from the profile). */}
      <group position={[0, FLASK_BASE_Y, 0]}>
        <mesh>
          <latheGeometry args={[flaskProfile, 56]} />
          <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.3} roughness={0.1} />
        </mesh>
        {/* Metal rim seal at the flask mouth */}
        <mesh position={[0, NECK_TOP + 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.022, 10, 40]} />
          <meshStandardMaterial
            color={PROCESS_METAL_COLOR}
            metalness={1}
            roughness={0.34}
            envMapIntensity={1.1}
          />
        </mesh>
        {/* Abstract graduation marks up the front of the flask wall */}
        {GRADUATIONS.map((f, i) => {
          const y = f * NECK_TOP;
          // radius of the conical wall at this height (linear approx of the body)
          const r = 1.3 - (1.3 - 0.42) * ((y - 0.32) / (1.66 - 0.32));
          return (
            <mesh key={i} position={[0, y, r + 0.005]}>
              <boxGeometry args={[0.14, 0.008, 0.004]} />
              <EmissiveCoreMaterial color={ACCENT} intensity={0.6} transparent opacity={0.4} />
            </mesh>
          );
        })}

        {/* ── Reaction contents ── */}
        {/* Bright emissive floor glow at the flask base — reads as the reaction's
            hot base and washes out the orb's dark underside where it dips below. */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.24, 48]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.55} />
        </mesh>

        {/* Spinning vortex funnel (two counter-weighted helices) — bright/white
            so the tornado reads crisply in front of the orb's blue reaction glow. */}
        <group ref={vortexRef}>
          <mesh geometry={helixA}>
            <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={2} transparent opacity={1} />
          </mesh>
          <mesh geometry={helixB}>
            <EmissiveCoreMaterial color={ACCENT} intensity={1.5} transparent opacity={0.85} />
          </mesh>
        </group>

        {/* Bright vortex core column (the eye) */}
        <mesh ref={coreRef} position={[0, (LIQUID_TOP + VORTEX_BOTTOM) / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.07, LIQUID_TOP - VORTEX_BOTTOM, 8]} />
          <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.8} transparent opacity={0.95} />
        </mesh>

        {/* Hot convergence point at the flask bottom (the reference's bright base) */}
        <mesh ref={hotSpotRef} position={[0, VORTEX_BOTTOM, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={2.4} />
        </mesh>

        {/* Swirling liquid surface at the top of the reaction volume */}
        <mesh ref={surfaceRef} position={[0, LIQUID_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.86, 40, 1]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.7} transparent opacity={0.3} />
        </mesh>
        <mesh position={[0, LIQUID_TOP, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.84, 0.012, 8, 48]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.6} />
        </mesh>

        {/* Rising energy sparks spiralling up through the reaction */}
        <group ref={sparksRef}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 5) * 0.5,
                VORTEX_BOTTOM,
                Math.sin((i * Math.PI * 2) / 5) * 0.5,
              ]}
            >
              <sphereGeometry args={[0.025, 8, 8]} />
              <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.4} transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Front control console — SPEED / TEMP readouts + a physical dial. */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.2, 1.02]} rotation={[-0.32, 0, 0]}>
        {/* Bezel */}
        <mesh>
          <boxGeometry args={[1.7, 0.44, 0.08]} />
          <meshStandardMaterial
            color="#0c1116"
            metalness={0.9}
            roughness={0.42}
            envMapIntensity={0.9}
          />
        </mesh>
        {/* SPEED readout (bright accent value) */}
        <group position={[-0.42, 0, 0.045]}>
          <mesh>
            <planeGeometry args={[0.56, 0.3]} />
            <meshStandardMaterial color="#05090d" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh ref={speedRef} position={[0, -0.02, 0.006]}>
            <boxGeometry args={[0.42, 0.12, 0.006]} />
            <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.14, 0.1, 0.006]}>
            <boxGeometry args={[0.22, 0.02, 0.006]} />
            <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.5} />
          </mesh>
        </group>
        {/* TEMP readout (cooler, calmer value) */}
        <group position={[0.18, 0, 0.045]}>
          <mesh>
            <planeGeometry args={[0.5, 0.3]} />
            <meshStandardMaterial color="#05090d" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh ref={tempRef} position={[0, -0.02, 0.006]}>
            <boxGeometry args={[0.34, 0.11, 0.006]} />
            <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={0.7} transparent opacity={0.8} />
          </mesh>
          <mesh position={[-0.12, 0.1, 0.006]}>
            <boxGeometry args={[0.2, 0.02, 0.006]} />
            <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.5} />
          </mesh>
        </group>
        {/* Physical dial knob on the right */}
        <group position={[0.66, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.13, 0.14, 0.08, 24]} />
            <meshStandardMaterial
              color={PROCESS_METAL_COLOR}
              metalness={1}
              roughness={0.38}
              envMapIntensity={1.1}
            />
          </mesh>
          {/* Accent indicator line on the knob face */}
          <mesh position={[0, 0.041, 0.06]}>
            <boxGeometry args={[0.012, 0.006, 0.09]} />
            <EmissiveCoreMaterial color={ACCENT} intensity={1} transparent opacity={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
