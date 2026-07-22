"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, TubeGeometry, Vector3 } from "three";
import type { BufferGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import {
  PROCESS_CORE_WHITE,
  PROCESS_GLASS_TINT,
  PROCESS_METAL_COLOR,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { RIG_GATE_X } from "@/lib/processLayout";
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

interface CrystallizationRigProps {
  /** X position along the shared table path (feature 38 wires real placement). */
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.teal;

// ─── Vertical anchors ───────────────────────────────────────────────────────
// The sealed case sits on the shared machine-base mount plate, tall enough
// that the orb (pinned at the world origin, y≈0, when this stage is centred)
// rises through its lower third as it settles into its largest, most
// resolved crystal form — the same "orb settles into the vessel" pattern as
// the other stages' vessels.
const CASE_BASE_Y = RIG_MACHINE_MOUNT_Y + 0.06;
const CASE_WIDTH = 1.3;
const CASE_DEPTH = 1.15;
const CASE_HEIGHT = 2.05;
const CASE_TOP_Y = CASE_BASE_Y + CASE_HEIGHT;
const CASE_CENTER_Y = CASE_BASE_Y + CASE_HEIGHT / 2;
const BEAM_BOTTOM_Y = CASE_BASE_Y + 0.12;
const BEAM_TOP_Y = CASE_TOP_Y - 0.12;

// Cryogenic coolant support vessel, offset to the exit side and set back in
// depth (behind the case) — a quiet support instrument, not competing with
// the sealed chamber for attention.
const COOLANT_X = 1.32;
const COOLANT_Z = -0.62;
const COOLANT_BASE_Y = RIG_PLATFORM_TOP_Y + 0.1;
const COOLANT_HEIGHT = 0.95;

// Delivered-specimen pedestal near the exit gate — a small lit stand holding
// a mini crystal, the take-home artifact echoing the sealed chamber's payoff.
const SPEC_X = 1.3;
const SPEC_Z = 1.0;
const SPEC_BASE_Y = RIG_PLATFORM_TOP_Y + 0.1;

// A swept tube along an arbitrary set of world-space waypoints — used for the
// glass/metal connecting arm to the coolant vessel (same technique as
// Purification's connector arms).
function buildConnectorTube(waypoints: Vector3[], tubeRadius: number): BufferGeometry {
  const curve = new CatmullRomCurve3(waypoints);
  return new TubeGeometry(curve, 32, tubeRadius, 8, false);
}

// Feature 52 — Stage 5, Crystallization: premium rebuild.
//
// A sealed glass display case on the shared branded RigMachineBase, matching
// the reference render (`Crystal growing chamber : sealed specimen
// cube.png`): a beveled metal-framed glass chamber with a soft vertical
// growth beam and a small seed crystal resting at its floor (the orb itself
// becomes the large faceted crystal as it rises through, per 46's crystal
// morph target), a cryogenic coolant support vessel to the side, and a
// delivered-specimen pedestal near the exit gate — the take-home artifact
// that closes the sequence. Deliberately the calmest, smallest-amplitude rig
// of the five per the 37 brief: no spin, no vortex, just a slow breathing
// glow and a single faint growth-pulse rising through the beam. Front
// CRYSTAL GROWTH console carries three abstract readouts (field / rate /
// purity — the 47 HUD panel carries the real copy). All motion gates on
// reduced motion; glass scales down via the shared quality tier.
export function CrystallizationRig({ position = [0, 0, 0] }: CrystallizationRigProps) {
  const tier = useProcessQualityTier();
  const prefersReducedMotion = usePrefersReducedMotion();

  const beamRef = useRef<Mesh>(null);
  const seedGroupRef = useRef<Group>(null);
  const pulseRef = useRef<Mesh>(null);
  const coolantGlowRef = useRef<Mesh>(null);
  const specimenGlowRef = useRef<Mesh>(null);
  const fieldReadoutRef = useRef<Mesh>(null);
  const rateReadoutRef = useRef<Mesh>(null);
  const purityReadoutRef = useRef<Mesh>(null);
  const idle = useRef(0);

  const armGeometry = useMemo(
    () =>
      buildConnectorTube(
        [
          new Vector3(CASE_WIDTH / 2 + 0.02, CASE_BASE_Y + 0.3, 0),
          new Vector3((CASE_WIDTH / 2 + COOLANT_X) / 2, CASE_BASE_Y + 0.44, COOLANT_Z / 2),
          new Vector3(COOLANT_X - 0.02, COOLANT_BASE_Y + COOLANT_HEIGHT * 0.4, COOLANT_Z + 0.2),
        ],
        0.026,
      ),
    [],
  );
  useEffect(() => {
    return () => {
      armGeometry.dispose();
    };
  }, [armGeometry]);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) idle.current += delta;
    const t = idle.current;

    // The growth beam breathes gently — the slowest, calmest motion of any
    // rig, no spinning or swirling.
    if (beamRef.current) {
      const mat = beamRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + (prefersReducedMotion ? 0 : Math.sin(t * 0.35) * 0.1);
    }

    // Seed crystal turns almost imperceptibly — a resting specimen, not a
    // reaction.
    if (seedGroupRef.current && !prefersReducedMotion) {
      seedGroupRef.current.rotation.y += delta * 0.05;
    }

    // A single faint growth-pulse rises slowly through the beam and resets —
    // the only "in progress" cue, kept slow and singular (vs. Purification's
    // several faster vapor motes).
    if (pulseRef.current) {
      const span = BEAM_TOP_Y - BEAM_BOTTOM_Y;
      const phase = prefersReducedMotion ? 0.5 : (t * 0.08) % 1;
      pulseRef.current.position.y = BEAM_BOTTOM_Y + phase * span;
      const mat = pulseRef.current.material as MeshStandardMaterial;
      mat.opacity = 0.75 * Math.sin(phase * Math.PI);
    }

    if (coolantGlowRef.current) {
      const mat = coolantGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.7 + (prefersReducedMotion ? 0 : Math.sin(t * 0.5 + 0.8) * 0.12);
    }
    if (specimenGlowRef.current) {
      const mat = specimenGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.9 + (prefersReducedMotion ? 0 : Math.sin(t * 0.6 + 1.5) * 0.15);
    }

    // Console readouts hold a calm, steady instrument flicker.
    if (fieldReadoutRef.current) {
      const mat = fieldReadoutRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.85 + (prefersReducedMotion ? 0 : Math.sin(t * 0.9) * 0.08);
    }
    if (rateReadoutRef.current) {
      const mat = rateReadoutRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.75 + (prefersReducedMotion ? 0 : Math.sin(t * 1.1 + 0.5) * 0.08);
    }
    if (purityReadoutRef.current) {
      const mat = purityReadoutRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.75 + (prefersReducedMotion ? 0 : Math.sin(t * 1.3 + 1) * 0.08);
    }
  });

  const seedShardOffsets: [number, number, number][] = [
    [0, 0.1, 0],
    [0.09, 0.02, 0.05],
    [-0.1, 0, -0.06],
  ];

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-RIG_GATE_X} accentColor={ACCENT} />
      <RigGate x={RIG_GATE_X} accentColor={ACCENT} />

      {/* Branded machine pedestal (shared primitive) */}
      <RigMachineBase accentColor={ACCENT} />

      {/* Sealed case: glass box in a beveled metal frame — the processing
          chamber the orb settles into to crystallize */}
      <mesh position={[0, CASE_CENTER_Y, 0]}>
        <boxGeometry args={[CASE_WIDTH, CASE_HEIGHT, CASE_DEPTH]} />
        <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.3} roughness={0.06} />
      </mesh>
      {/* Corner posts */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}-${sz}`}
            position={[(sx * CASE_WIDTH) / 2, CASE_CENTER_Y, (sz * CASE_DEPTH) / 2]}
          >
            <cylinderGeometry args={[0.03, 0.03, CASE_HEIGHT, 12]} />
            <meshStandardMaterial
              color={PROCESS_METAL_COLOR}
              metalness={1}
              roughness={0.34}
              envMapIntensity={1.1}
            />
          </mesh>
        )),
      )}
      {/* Top and bottom frame caps */}
      {[CASE_BASE_Y - 0.03, CASE_TOP_Y + 0.03].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[CASE_WIDTH + 0.08, 0.06, CASE_DEPTH + 0.08]} />
          <meshStandardMaterial
            color={PROCESS_METAL_COLOR}
            metalness={1}
            roughness={0.36}
            envMapIntensity={1}
          />
        </mesh>
      ))}
      {/* Base glow pad, under-seaming the case footprint */}
      <mesh position={[0, CASE_BASE_Y - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CASE_WIDTH * 0.94, CASE_DEPTH * 0.94]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.25} />
      </mesh>
      {/* Branded seal strip along the top front edge */}
      <mesh position={[0, CASE_TOP_Y - 0.02, CASE_DEPTH / 2 - 0.01]}>
        <boxGeometry args={[CASE_WIDTH - 0.1, 0.01, 0.02]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {/* Vertical growth beam through the case center */}
      <mesh ref={beamRef} position={[0, (BEAM_BOTTOM_Y + BEAM_TOP_Y) / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.14, BEAM_TOP_Y - BEAM_BOTTOM_Y, 16, 1, true]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.55}
          transparent
          opacity={0.2}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>
      {/* Growth pulse travelling slowly up the beam */}
      <mesh ref={pulseRef} position={[0, BEAM_BOTTOM_Y, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.3} transparent opacity={0.75} />
      </mesh>

      {/* Seed crystal resting at the case floor — the growth origin the orb
          settles above as it becomes the large faceted crystal */}
      <group ref={seedGroupRef} position={[0, CASE_BASE_Y + 0.16, 0]}>
        {seedShardOffsets.map((offset, i) => (
          <mesh key={i} position={offset} rotation={[0.2 * i, 0.5 * i, 0.15 * i]}>
            <octahedronGeometry args={[0.11 - i * 0.015, 0]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.8}
              metalness={0.2}
              roughness={0.12}
              transparent
              opacity={0.92}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Cryogenic coolant support vessel */}
      <group position={[COOLANT_X, COOLANT_BASE_Y, COOLANT_Z]}>
        <mesh position={[0, COOLANT_HEIGHT / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.24, COOLANT_HEIGHT, 24]} />
          <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.14} roughness={0.1} />
        </mesh>
        <mesh ref={coolantGlowRef} position={[0, COOLANT_HEIGHT * 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 24]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.7} transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, COOLANT_HEIGHT + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.23, 0.016, 8, 28]} />
          <meshStandardMaterial
            color={PROCESS_METAL_COLOR}
            metalness={1}
            roughness={0.34}
            envMapIntensity={1.1}
          />
        </mesh>
        {/* Small metal foot */}
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.3, 0.32, 0.06, 24]} />
          <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={0.9} roughness={0.36} envMapIntensity={1} />
        </mesh>
      </group>
      {/* Connecting arm from the case to the coolant vessel */}
      <mesh geometry={armGeometry}>
        <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={1} roughness={0.4} envMapIntensity={1} />
      </mesh>

      {/* Delivered-specimen pedestal near the exit gate — the take-home
          artifact, sealed and ready */}
      <group position={[SPEC_X, SPEC_BASE_Y, SPEC_Z]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.3, 0.08, 28]} />
          <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={0.9} roughness={0.36} envMapIntensity={1} />
        </mesh>
        <mesh ref={specimenGlowRef} position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 24]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.24, 0]} rotation={[0.3, 0.6, 0.1]}>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.9}
            metalness={0.15}
            roughness={0.1}
            transparent
            opacity={0.95}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Front CRYSTAL GROWTH control console — three abstract readouts + dial */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.2, 1.02]} rotation={[-0.32, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.9, 0.44, 0.08]} />
          <meshStandardMaterial color="#0c1116" metalness={0.9} roughness={0.42} envMapIntensity={0.9} />
        </mesh>
        {[
          { x: -0.58, w: 0.5, ref: fieldReadoutRef },
          { x: 0, w: 0.44, ref: rateReadoutRef },
          { x: 0.56, w: 0.44, ref: purityReadoutRef },
        ].map(({ x, w, ref }) => (
          <group key={x} position={[x, 0, 0.045]}>
            <mesh>
              <planeGeometry args={[w, 0.3]} />
              <meshStandardMaterial color="#05090d" metalness={0.4} roughness={0.6} side={DoubleSide} />
            </mesh>
            <mesh ref={ref} position={[0, -0.02, 0.006]}>
              <boxGeometry args={[w * 0.72, 0.1, 0.006]} />
              <EmissiveCoreMaterial color={ACCENT} intensity={0.8} transparent opacity={0.85} />
            </mesh>
            <mesh position={[-w * 0.22, 0.1, 0.006]}>
              <boxGeometry args={[w * 0.4, 0.018, 0.006]} />
              <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.5} />
            </mesh>
          </group>
        ))}
        {/* Physical dial knob on the right */}
        <group position={[0.9, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.13, 0.08, 24]} />
            <meshStandardMaterial
              color={PROCESS_METAL_COLOR}
              metalness={1}
              roughness={0.38}
              envMapIntensity={1.1}
            />
          </mesh>
          <mesh position={[0, 0.041, 0.055]}>
            <boxGeometry args={[0.012, 0.006, 0.08]} />
            <EmissiveCoreMaterial color={ACCENT} intensity={1} transparent opacity={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
