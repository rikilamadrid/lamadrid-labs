"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, TubeGeometry, Vector2, Vector3 } from "three";
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

interface PurificationRigProps {
  /** X position along the shared table path (feature 38 wires real placement). */
  position?: [number, number, number];
}

const ACCENT = narrativeSignalColors.rose;

// ─── Vertical anchors ───────────────────────────────────────────────────────
// The round-bottom flask sits on the shared machine-base mount plate, sized so
// the orb (pinned at the world origin, y≈0, when this stage is centred)
// settles into the lower bulb — the processing chamber it's refined inside,
// matching the other stages' "orb settles into the vessel" pattern.
const PAD_TOP_Y = RIG_MACHINE_MOUNT_Y + 0.04;
const FLASK_BASE_Y = PAD_TOP_Y + 0.02;

// Flask-local heights (y=0 at the flask's lowest point, on the heat pad).
const NECK_TOP = 2.3; // flask mouth
const LIQUID_LOCAL_Y = 0.55; // glowing-liquid surface line inside the bulb
const VAPOR_TOP_LOCAL_Y = NECK_TOP + 0.05; // where rising vapor motes reset

// Condenser column, offset to the exit side and set back in depth (behind the
// flask's wide bulb, radius up to 1.42) and built noticeably taller than the
// flask so its coil clears the flask's silhouette and reads as a distinct
// piece of apparatus rather than hiding behind it.
const COND_X = 1.3;
const CONDENSER_Z = -0.75;
const COND_BOTTOM_Y = RIG_PLATFORM_TOP_Y + 0.32;
const COND_TOP_Y = RIG_PLATFORM_TOP_Y + 2.6;
const COND_RADIUS = 0.22;
const COND_SLEEVE_R = 0.32;

// Collection flask, past the condenser near the exit gate — the refined,
// calmer output. Pulled forward in Z (toward camera, clear of the exit
// gate's posts) so it doesn't read as hidden behind the gate.
const COLLECT_X = 1.3;
const COLLECT_Z = 1.05;
const COLLECT_BASE_Y = RIG_PLATFORM_TOP_Y + 0.08;
const COLLECT_NECK_TOP = 0.86;

// ─── Round-bottom (Florence) flask profile ─────────────────────────────────
// A rounded bulb that widens quickly from a small flat foot and holds a wide
// plateau low in the body — unlike a mathematically perfect sphere (which
// pinches to a point at the very bottom), this keeps the vessel wide exactly
// where the orb settles, matching the "orb settles into the vessel" pattern
// the other stage rebuilds rely on — then tapers into a narrow neck with a
// flared ground-glass lip.
function buildFlaskProfile(): Vector2[] {
  return [
    new Vector2(0.001, 0),
    new Vector2(0.85, 0.02),
    new Vector2(1.25, 0.08),
    new Vector2(1.4, 0.22),
    new Vector2(1.42, 0.5),
    new Vector2(1.4, 0.85),
    new Vector2(1.2, 1.15),
    new Vector2(0.85, 1.45),
    new Vector2(0.5, 1.72),
    new Vector2(0.3, 1.95),
    new Vector2(0.26, 2.0),
    new Vector2(0.26, NECK_TOP - 0.05),
    new Vector2(0.26, NECK_TOP),
    new Vector2(0.32, NECK_TOP + 0.05),
    new Vector2(0.29, NECK_TOP + 0.09),
  ];
}

// Small Erlenmeyer profile for the collection flask — the same silhouette
// family as Synthesis's reaction flask, scaled down, empty and calm.
function buildCollectionProfile(): Vector2[] {
  return [
    new Vector2(0.001, 0),
    new Vector2(0.32, 0),
    new Vector2(0.58, 0.06),
    new Vector2(0.66, 0.16),
    new Vector2(0.62, 0.36),
    new Vector2(0.4, 0.66),
    new Vector2(0.24, 0.78),
    new Vector2(0.16, COLLECT_NECK_TOP - 0.04),
    new Vector2(0.16, COLLECT_NECK_TOP),
    new Vector2(0.2, COLLECT_NECK_TOP + 0.04),
  ];
}

// A swept tube along an arbitrary set of world-space waypoints — used for the
// glass connecting arms between flask, condenser, and collection vessel.
function buildConnectorTube(waypoints: Vector3[], tubeRadius: number): BufferGeometry {
  const curve = new CatmullRomCurve3(waypoints);
  return new TubeGeometry(curve, 48, tubeRadius, 8, false);
}

// The condenser's glowing internal coil — a constant-radius helix (unlike
// Synthesis's converging vortex funnel), read as a still, precise spiral
// rather than a spinning reaction. Built in the condenser group's local
// space (x=0 at the sleeve's own axis).
function buildCondenserCoil(): BufferGeometry {
  const turns = 8;
  const samples = 140;
  const points: Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const y = COND_BOTTOM_Y + 0.15 + t * (COND_TOP_Y - COND_BOTTOM_Y - 0.3);
    const angle = t * Math.PI * 2 * turns;
    points.push(new Vector3(Math.cos(angle) * COND_RADIUS, y, Math.sin(angle) * COND_RADIUS));
  }
  const curve = new CatmullRomCurve3(points);
  return new TubeGeometry(curve, 160, 0.032, 8, false);
}

// Feature 51 — Stage 4, Purification: premium rebuild.
//
// A recognisable glass distillation station matching the reference render
// (round-bottom flask + condenser coil + collection flask): the shared
// branded RigMachineBase carrying a glass round-bottom flask (feature 45
// transmission glass, revolved as a true sphere silhouette) the orb settles
// into to be refined, gently rising vapor motes reading as distillation in
// progress, a glass connecting arm up to a vertical condenser (a glowing
// constant-radius coil inside an open glass sleeve, mounted on a simple
// support stand), a second connecting arm down to a small collection flask
// near the exit gate, and a front DISTILLATION control console reading out
// three abstract values (vapor temp / pressure / rate — the HUD panel
// carries the real copy). Deliberately calmer and more precise than
// Synthesis's reaction energy: no spinning vortex, just a slow rising vapor
// and an occasional condensate drip — refinement settling down, not ramping
// up. All motion gates on reduced motion; glass scales down via the shared
// quality tier.
export function PurificationRig({ position = [0, 0, 0] }: PurificationRigProps) {
  const tier = useProcessQualityTier();
  const prefersReducedMotion = usePrefersReducedMotion();

  const liquidSurfaceRef = useRef<Mesh>(null);
  const vaporRef = useRef<Group>(null);
  const coilGlowRef = useRef<Mesh>(null);
  const dripRef = useRef<Mesh>(null);
  const collectionGlowRef = useRef<Mesh>(null);
  const vaporReadoutRef = useRef<Mesh>(null);
  const pressureReadoutRef = useRef<Mesh>(null);
  const rateReadoutRef = useRef<Mesh>(null);
  const idle = useRef(0);

  const flaskProfile = useMemo(() => buildFlaskProfile(), []);
  const collectionProfile = useMemo(() => buildCollectionProfile(), []);
  const coilGeometry = useMemo(() => buildCondenserCoil(), []);
  const armUpGeometry = useMemo(
    () =>
      buildConnectorTube(
        [
          new Vector3(0, FLASK_BASE_Y + NECK_TOP + 0.08, 0),
          new Vector3(0.55, FLASK_BASE_Y + NECK_TOP + 0.3, -0.3),
          new Vector3(COND_X - 0.05, COND_TOP_Y - 0.1, CONDENSER_Z + 0.1),
        ],
        0.045,
      ),
    [],
  );
  const armDownGeometry = useMemo(
    () =>
      buildConnectorTube(
        [
          new Vector3(COND_X + 0.04, COND_BOTTOM_Y - 0.02, CONDENSER_Z + 0.1),
          new Vector3(COND_X + 0.32, COLLECT_BASE_Y + COLLECT_NECK_TOP + 0.14, CONDENSER_Z / 2),
          new Vector3(COLLECT_X, COLLECT_BASE_Y + COLLECT_NECK_TOP + 0.02, COLLECT_Z),
        ],
        0.038,
      ),
    [],
  );
  useEffect(() => {
    return () => {
      coilGeometry.dispose();
      armUpGeometry.dispose();
      armDownGeometry.dispose();
    };
  }, [coilGeometry, armUpGeometry, armDownGeometry]);

  useFrame((_, delta) => {
    if (!prefersReducedMotion) idle.current += delta;
    const t = idle.current;

    // The liquid surface breathes gently — a still specimen being refined,
    // not a reaction. No rotation, just a slow shimmer.
    if (liquidSurfaceRef.current) {
      const mat = liquidSurfaceRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + (prefersReducedMotion ? 0 : Math.sin(t * 0.8) * 0.12);
    }

    // Vapor motes rise slowly from the liquid surface up through the neck and
    // reset — the calm, continuous "distillation in progress" read.
    if (vaporRef.current) {
      const span = VAPOR_TOP_LOCAL_Y - LIQUID_LOCAL_Y;
      vaporRef.current.children.forEach((mote, i) => {
        const phase = prefersReducedMotion ? (i + 0.5) / 3 : (t * 0.16 + i * 0.34) % 1;
        mote.position.y = LIQUID_LOCAL_Y + phase * span;
        const mat = (mote as Mesh).material as MeshStandardMaterial;
        mat.opacity = 0.7 * Math.sin(phase * Math.PI);
      });
    }

    // Condenser coil holds a steady, precise glow — a live instrument, not a
    // reacting one.
    if (coilGlowRef.current) {
      const mat = coilGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 1.1 + (prefersReducedMotion ? 0 : Math.sin(t * 1.4) * 0.2);
    }

    // A single condensate droplet travels slowly down the lower arm and
    // resets — the refined output arriving in the collection flask.
    if (dripRef.current) {
      const phase = prefersReducedMotion ? 0.5 : (t * 0.22) % 1;
      const startX = COND_X + 0.04;
      const startY = COND_BOTTOM_Y - 0.02;
      const startZ = CONDENSER_Z + 0.1;
      const endX = COLLECT_X;
      const endY = COLLECT_BASE_Y + COLLECT_NECK_TOP + 0.02;
      const endZ = COLLECT_Z;
      dripRef.current.position.set(
        startX + (endX - startX) * phase,
        startY + (endY - startY) * phase,
        startZ + (endZ - startZ) * phase,
      );
      const mat = dripRef.current.material as MeshStandardMaterial;
      mat.opacity = 0.9 * Math.sin(phase * Math.PI);
    }

    // Collection glow breathes slowly as the refined result accumulates.
    if (collectionGlowRef.current) {
      const mat = collectionGlowRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + (prefersReducedMotion ? 0 : Math.sin(t * 0.7 + 1) * 0.15);
    }

    // Console readouts hold a calm, precise instrument flicker.
    if (vaporReadoutRef.current) {
      const mat = vaporReadoutRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.85 + (prefersReducedMotion ? 0 : Math.sin(t * 1.2) * 0.1);
    }
    if (pressureReadoutRef.current) {
      const mat = pressureReadoutRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.75 + (prefersReducedMotion ? 0 : Math.sin(t * 1.6 + 0.6) * 0.1);
    }
    if (rateReadoutRef.current) {
      const mat = rateReadoutRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.75 + (prefersReducedMotion ? 0 : Math.sin(t * 1.9 + 1.2) * 0.1);
    }
  });

  return (
    <group position={position}>
      <RigPlatform accentColor={ACCENT} />
      <RigGate x={-1.7} accentColor={ACCENT} />
      <RigGate x={1.7} accentColor={ACCENT} />

      {/* Branded machine pedestal (shared primitive) */}
      <RigMachineBase accentColor={ACCENT} />

      {/* Heat-pad glow under the flask */}
      <mesh position={[0, PAD_TOP_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 40]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.5} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, PAD_TOP_Y - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.02, 8, 56]} />
        <EmissiveCoreMaterial color={ACCENT} intensity={0.9} transparent opacity={0.8} />
      </mesh>

      {/* Round-bottom flask — the processing chamber the orb settles into */}
      <group position={[0, FLASK_BASE_Y, 0]}>
        <mesh>
          <latheGeometry args={[flaskProfile, 48]} />
          <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.32} roughness={0.09} />
        </mesh>
        {/* Metal rim seal at the flask mouth */}
        <mesh position={[0, NECK_TOP + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.02, 10, 36]} />
          <meshStandardMaterial
            color={PROCESS_METAL_COLOR}
            metalness={1}
            roughness={0.34}
            envMapIntensity={1.1}
          />
        </mesh>

        {/* Liquid surface, low in the bulb — a still specimen, not a reaction */}
        <mesh ref={liquidSurfaceRef} position={[0, LIQUID_LOCAL_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.36, 40]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.55} transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, LIQUID_LOCAL_Y + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.36, 0.01, 8, 48]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={0.8} transparent opacity={0.6} />
        </mesh>

        {/* Vapor motes rising slowly from the liquid, up through the neck */}
        <group ref={vaporRef}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * 2.1) * 0.06, LIQUID_LOCAL_Y, Math.sin(i * 2.1) * 0.06]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.2} transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Connecting arm from the flask neck up to the condenser inlet */}
      <mesh geometry={armUpGeometry}>
        <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.14} roughness={0.12} />
      </mesh>

      {/* Condenser: open glass sleeve around a glowing constant-radius coil,
          set back and taller than the flask so it reads as a distinct piece
          of apparatus rather than hiding behind it */}
      <group position={[COND_X, 0, CONDENSER_Z]}>
        <mesh position={[0, (COND_BOTTOM_Y + COND_TOP_Y) / 2, 0]}>
          <cylinderGeometry
            args={[COND_SLEEVE_R, COND_SLEEVE_R, COND_TOP_Y - COND_BOTTOM_Y, 32, 1, true]}
          />
          <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.16} roughness={0.12} />
        </mesh>
        <mesh ref={coilGlowRef} geometry={coilGeometry}>
          <EmissiveCoreMaterial color={ACCENT} intensity={1.1} transparent opacity={0.95} />
        </mesh>
        {/* Metal rim seals top and bottom of the sleeve */}
        {[COND_BOTTOM_Y, COND_TOP_Y].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[COND_SLEEVE_R, 0.022, 10, 32]} />
            <meshStandardMaterial
              color={PROCESS_METAL_COLOR}
              metalness={1}
              roughness={0.34}
              envMapIntensity={1.1}
            />
          </mesh>
        ))}
      </group>

      {/* Connecting arm from the condenser down to the collection flask */}
      <mesh geometry={armDownGeometry}>
        <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.12} roughness={0.12} />
      </mesh>

      {/* Condensate drip travelling slowly down the lower arm */}
      <mesh ref={dripRef} position={[COND_X + 0.04, COND_BOTTOM_Y - 0.02, CONDENSER_Z + 0.1]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={1.4} transparent opacity={0.9} />
      </mesh>

      {/* Collection flask — the refined, calmer output near the exit gate */}
      <group position={[COLLECT_X, COLLECT_BASE_Y, COLLECT_Z]}>
        <mesh>
          <latheGeometry args={[collectionProfile, 32]} />
          <GlassMaterial tier={tier} color={PROCESS_GLASS_TINT} thickness={0.14} roughness={0.1} />
        </mesh>
        <mesh ref={collectionGlowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 32]} />
          <EmissiveCoreMaterial color={ACCENT} intensity={1.3} transparent opacity={0.75} />
        </mesh>
        {/* Metal rim seal at the collection flask mouth, matching the other vessels */}
        <mesh position={[0, COLLECT_NECK_TOP + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.014, 8, 28]} />
          <meshStandardMaterial
            color={PROCESS_METAL_COLOR}
            metalness={1}
            roughness={0.34}
            envMapIntensity={1.1}
          />
        </mesh>
      </group>
      {/* Small metal pedestal disc under the collection flask */}
      <mesh position={[COLLECT_X, COLLECT_BASE_Y - 0.03, COLLECT_Z]}>
        <cylinderGeometry args={[0.62, 0.66, 0.06, 32]} />
        <meshStandardMaterial color={PROCESS_METAL_COLOR} metalness={0.9} roughness={0.36} envMapIntensity={1} />
      </mesh>

      {/* Front DISTILLATION control console — three abstract readouts + dial */}
      <group position={[0, RIG_PLATFORM_TOP_Y + 0.2, 1.02]} rotation={[-0.32, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.9, 0.44, 0.08]} />
          <meshStandardMaterial color="#0c1116" metalness={0.9} roughness={0.42} envMapIntensity={0.9} />
        </mesh>
        {[
          { x: -0.58, w: 0.5, ref: vaporReadoutRef },
          { x: 0, w: 0.44, ref: pressureReadoutRef },
          { x: 0.56, w: 0.44, ref: rateReadoutRef },
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
