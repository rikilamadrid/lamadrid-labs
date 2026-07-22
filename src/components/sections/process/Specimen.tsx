"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { AdditiveBlending, CanvasTexture, Color } from "three";
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { processStages } from "@/data/process";
import { specimenStateAt, trailLengthUnits } from "@/data/specimenStates";
import {
  PROCESS_CORE_WHITE,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { clamp01, lerp } from "@/lib/math";
import type { ProgressSource } from "@/lib/progressSource";
import { readProgress } from "@/lib/progressSource";
import {
  deriveArrivalAge,
  deriveChamberIndex,
  deriveMotionEnergy,
  deriveStageBlend,
  deriveTransitPhase,
  deriveTreatmentEnergy,
} from "@/lib/processLayout";
import type { TreatmentSample } from "@/lib/specimenMotion";
import {
  createDriftSeed,
  createMeanderState,
  createMoodState,
  createTreatmentSample,
  createWanderState,
  sampleArrivalFlare,
  sampleArrivalPunch,
  sampleDrift,
  samplePulse,
  sampleTreatment,
  stepMeander,
  stepMood,
  stepWander,
} from "@/lib/specimenMotion";
import { sampleHeroOffset, sampleTransitOffset } from "@/lib/specimenPath";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { EmissiveCoreMaterial } from "./processMaterials";

interface SpecimenProps {
  /** 0-1 across the existing 5-stage Process system. Pass a ref (not a
   *  number) from anything scroll-driven so scrubbing costs no renders. */
  progress: ProgressSource;
  /**
   * 0-1 across the hero-idle -> table-descent phase that precedes the 5
   * stages; 1 once the specimen has settled at the table (the only value
   * standalone previews need to pass). Defaults to 1 so existing mounts stay
   * put at their settled pose.
   */
  heroT?: ProgressSource;
}

// ─────────────────────────────────────────────────────────────────────────
// Feature: specimen motion system rebuild. Ricardo's brief was explicit that
// the previous glass-icosahedron "Orb" (morphing droplet -> sphere ->
// faceted crystal) read as a rigid, oversized ball on rails — not a living
// particle. This rebuild throws out that geometry entirely in favor of a
// tiny composition that carries "alive" through motion and glow rather than
// mass or facets:
//   - a minute white-hot point core (the only lit/shaded mesh)
//   - a soft camera-facing glow halo (additive gradient sprite, stage-tinted)
//   - a camera-facing comet trail, visible only while actually in transit
//   - a few always-on orbiting sparks
// Per-stage "shape" differences from the brief (seed / measured-orb /
// liquid-energy / polished-particle / faceted-seed) are expressed through
// glow strength, trail length, idle noise, and spark count instead of
// literal geometry morphing — the geometry morph was a large part of what
// made the old version read as a solid object instead of a point of energy.
// ─────────────────────────────────────────────────────────────────────────

// Baseline particle envelope in world units — deliberately tiny next to the
// old shell's BASE_RADIUS of 0.85. Per-stage `scale` (see specimenStates.ts)
// multiplies this in a narrow 0.82-1.22 band; it can never approach "orb."
const SPECIMEN_BASE_SCALE = 0.17;

interface DerivedSpecimenFrame {
  scale: number;
  glow: number;
  noise: number;
  trailUnits: number;
  sparkVisibility: number;
  /** Glow-halo color, already blended toward white by the stage's `heat`. */
  color: Color;
  /** 0-1, peaks mid-transit between stages, 0 while settled — drives the trail. */
  motionEnergy: number;
  /** -1 (just departed) -> 0 (mid-transit) -> +1 (about to settle). */
  transitPhase: number;
  /** Which of the 4 stage-to-stage transit curves is active (specimenPath.ts). */
  transitionIndex: number;
  /** 1 while parked inside a chamber, 0 mid-transit — gates the treatment. */
  treatmentEnergy: number;
  /** 0 the instant the specimen settles into a chamber -> 1 by dwell's end. */
  arrivalAge: number;
  /** Which stage's equipment currently holds the specimen. */
  chamberIndex: number;
}

const TMP_SIGNAL_COLOR = new Color();
const TMP_WHITE_COLOR = new Color(PROCESS_CORE_WHITE);
const TMP_ARC = { x: 0, y: 0 };
const TMP_HERO = { x: 0, y: 0 };

function deriveSpecimenFrame(progress: number, out: DerivedSpecimenFrame): void {
  const blend = deriveStageBlend(progress, processStages.length);
  const { fromIndex, toIndex, t, rawT } = blend;

  const fromState = specimenStateAt(fromIndex);
  const toState = specimenStateAt(toIndex);
  const fromStage = processStages[fromIndex];
  const toStage = processStages[toIndex];

  out.scale = lerp(fromState.scale, toState.scale, t);
  out.glow = lerp(fromState.glow, toState.glow, t);
  out.noise = lerp(fromState.noise, toState.noise, t);
  out.trailUnits = lerp(
    trailLengthUnits(fromState.trailLength),
    trailLengthUnits(toState.trailLength),
    t,
  );
  out.sparkVisibility = lerp(fromState.sparkCount, toState.sparkCount, t);

  const heat = lerp(fromState.heat, toState.heat, t);
  out.color
    .set(narrativeSignalColors[fromStage.signal])
    .lerp(TMP_SIGNAL_COLOR.set(narrativeSignalColors[toStage.signal]), t)
    .lerp(TMP_WHITE_COLOR, heat * 0.7);

  out.motionEnergy = deriveMotionEnergy(rawT);
  out.transitPhase = deriveTransitPhase(rawT);
  out.transitionIndex = fromIndex;
  out.treatmentEnergy = deriveTreatmentEnergy(rawT);
  out.arrivalAge = deriveArrivalAge(rawT);
  out.chamberIndex = deriveChamberIndex(blend);
}

// ─── Soft, camera-facing textures (fetch-free, in-memory canvas — matching
// ProcessBackdrop's convention) ─────────────────────────────────────────────

function buildGlowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Bright "head" near one edge, fading to nothing at the other — a soft comet
// tail rather than a hard-edged cone. Reused for both the trailing and
// leading streak by mirroring the mesh's own scale.x (see render below).
function buildCometTexture(): CanvasTexture {
  const w = 128;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(
      w * 0.82,
      h * 0.5,
      0,
      w * 0.82,
      h * 0.5,
      w * 0.86,
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Orbiting sparks — small always-on points of light, each on its own
// inclined parametric orbit so the cluster reads as loose/organic rather
// than one spinning ring. ────────────────────────────────────────────────
interface SparkConfig {
  radius: number;
  incline: number;
  speed: number;
  phase: number;
}

const SPARK_CONFIGS: SparkConfig[] = [
  { radius: 0.46, incline: 0.6, speed: 0.9, phase: 0 },
  { radius: 0.58, incline: -0.9, speed: 0.7, phase: 2.1 },
  { radius: 0.4, incline: 1.7, speed: 1.15, phase: 4.4 },
];

// The single persistent specimen particle: a tiny living point of light that
// exists from page load, drifts organically at rest, and follows a curved,
// per-transition path between stages. Reads `progress` (0-1) and derives its
// own stage blend — no scroll wiring here (that's the scroll rig's job).
//
// Renders no camera or lights of its own so it stays mountable in the shared
// desktop scene and the mobile scene.
export function Specimen({ progress, heroT = 1 }: SpecimenProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const trailBackRef = useRef<Mesh>(null);
  const trailFrontRef = useRef<Mesh>(null);
  const sparkRefs = useRef<(Mesh | null)[]>([]);

  const glowTexture = useMemo(() => buildGlowTexture(), []);
  const cometTexture = useMemo(() => buildCometTexture(), []);
  useEffect(() => {
    return () => {
      glowTexture.dispose();
      cometTexture.dispose();
    };
  }, [glowTexture, cometTexture]);

  // Stable per-mount seed so hero/process and any standalone preview don't
  // drift in lockstep with each other.
  const driftSeed = useMemo(() => createDriftSeed(), []);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const heroTRef = useRef(heroT);
  useEffect(() => {
    heroTRef.current = heroT;
  }, [heroT]);

  const frame = useMemo<DerivedSpecimenFrame>(
    () => ({
      scale: 1,
      glow: 0,
      noise: 0,
      trailUnits: 0,
      sparkVisibility: 0,
      color: new Color(),
      motionEnergy: 0,
      transitPhase: 0,
      transitionIndex: 0,
      treatmentEnergy: 1,
      arrivalAge: 1,
      chamberIndex: 0,
    }),
    [],
  );
  const idle = useRef({ time: 0 });
  const drift = useMemo(() => ({ x: 0, y: 0, z: 0 }), []);
  const wander = useMemo(() => createWanderState(), []);
  const meander = useMemo(() => createMeanderState(), []);
  const mood = useMemo(() => createMoodState(), []);
  const treatment = useMemo<TreatmentSample>(() => createTreatmentSample(), []);

  useFrame((_, delta) => {
    // Read scroll progress out of a ref rather than a prop: scrubbing never
    // re-renders, it just moves numbers this loop already reads every frame.
    deriveSpecimenFrame(readProgress(progressRef.current), frame);

    if (!prefersReducedMotion) idle.current.time += delta;
    const t = idle.current.time;

    // ── What the current chamber's equipment is doing to the specimen ──
    const chamber = specimenStateAt(frame.chamberIndex);
    if (!prefersReducedMotion) {
      sampleTreatment(
        t,
        chamber.treatment,
        frame.treatmentEnergy,
        frame.arrivalAge,
        driftSeed,
        treatment,
      );
    }
    // One-shot reaction to being caught by the tool: a damped squash that
    // rings out, plus a brightness flare, scaled by how hard this particular
    // tool grabs (see `reaction` in specimenStates).
    const punch = prefersReducedMotion
      ? 0
      : sampleArrivalPunch(frame.arrivalAge) * chamber.reaction;
    const flare = prefersReducedMotion
      ? 0
      : sampleArrivalFlare(frame.arrivalAge) * chamber.reaction;
    const treatedGlow = clamp01(frame.glow + treatment.glow + flare * 0.55);

    // ── Group: idle drift + treatment + transit arc + hero descent + scale ──
    if (groupRef.current) {
      const g = groupRef.current;
      const pulse = prefersReducedMotion ? 0 : samplePulse(t, driftSeed);
      g.scale.setScalar(
        SPECIMEN_BASE_SCALE *
          frame.scale *
          Math.max(0.4, 1 + pulse + treatment.scale + punch * 0.22),
      );

      if (!prefersReducedMotion) {
        g.rotation.y += delta * (0.15 + treatment.spin);

        // Ambient float — always on, at every point of the journey. The
        // treatment's `damp` is a grip multiplier, never a stop: a tool can
        // tighten the wander (Measurement clamps it, Crystallization locks
        // it) but the specimen never stops moving.
        sampleDrift(t, driftSeed, frame.noise, drift, treatment.damp);
        // Slow, unpredictable modulator on the two wander layers' rate (not
        // the deterministic sines above, which stay steady on purpose) — see
        // stepMood's comment. Without this the wander/meander below are
        // random in *position* but constant in *rhythm*, which is what kept
        // reading as a cycle even after they were added.
        const moodMul = prefersReducedMotion ? 1 : stepMood(mood, delta);
        // Genuinely random on top of the deterministic drift above — see
        // stepWander's comment. Same `noise`/`damp` budget so a tool's grip
        // tightens this layer too, not just the sine-driven one.
        stepWander(wander, delta, (0.5 + frame.noise) * treatment.damp * moodMul);
        // A slow, wide-roaming second layer (specimenMotion.ts's stepMeander)
        // so the specimen actually explores the space around its chamber
        // instead of oscillating in place — floored well above zero (0.55+)
        // so it keeps roaming even at a tool's tightest grip.
        stepMeander(meander, delta, (0.55 + frame.noise * 0.4 * treatment.damp) * moodMul);
        g.position.set(
          drift.x + treatment.x + wander.x + meander.x,
          drift.y + treatment.y + wander.y + meander.y,
          drift.z + treatment.z + wander.z + meander.z,
        );

        // Curved swoop through the transit between two stages — a distinct
        // curve per transition (specimenPath.ts), continuous with the
        // settled pose at both dwell boundaries.
        if (frame.motionEnergy > 0) {
          const u = clamp01((frame.transitPhase + 1) / 2);
          sampleTransitOffset(u, frame.transitionIndex, TMP_ARC);
          g.position.y += TMP_ARC.y * frame.motionEnergy;
          g.position.z += TMP_ARC.x * frame.motionEnergy;
        }

        // Hero -> table descent (heroT < 1): still floating/settling into
        // place before the 5-stage system begins.
        const currentHeroT = readProgress(heroTRef.current, 1);
        if (currentHeroT < 1) {
          sampleHeroOffset(currentHeroT, TMP_HERO);
          g.position.x += TMP_HERO.x;
          g.position.y += TMP_HERO.y;
        }
      } else {
        g.position.set(0, 0, 0);
      }
    }

    // ── White-hot point core — small and intense, not a bloom blob ──
    if (coreRef.current) {
      const mat = coreRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 2.2 + treatedGlow * 1.6 + flare * 2.4;
      const breathe = prefersReducedMotion
        ? 0
        : Math.sin(t * 1.4 + driftSeed) * 0.02;
      coreRef.current.scale.setScalar(
        Math.max(0.12, 0.3 + treatedGlow * 0.08 + breathe - punch * 0.06),
      );
    }

    // ── Soft glow halo — camera-facing additive sprite, stage-tinted ──
    if (glowRef.current) {
      const mat = glowRef.current.material as MeshBasicMaterial;
      mat.color.copy(frame.color);
      mat.opacity = 0.35 + treatedGlow * 0.4 + flare * 0.3;
      // The halo takes the punch in the opposite direction to the core: the
      // core compresses while the halo expands, so an arrival reads as energy
      // being knocked *out* of the specimen by the tool.
      const size = 0.85 + treatedGlow * 0.55 + punch * 0.5;
      glowRef.current.scale.setScalar(Math.max(0.2, size));
    }

    // ── Comet trail — only visible while actually in transit, never while
    // settled inside a chamber. Trailing streak (behind, departure) and a
    // smaller leading glow (ahead, arrival), matching the existing
    // departing/arriving bias so a stage-to-stage handoff reads as a single
    // arcing streak of light rather than a symmetric blur. ──
    const energy = frame.motionEnergy;
    const departing = clamp01(-frame.transitPhase);
    const arriving = clamp01(frame.transitPhase);

    if (trailBackRef.current) {
      const mat = trailBackRef.current.material as MeshBasicMaterial;
      mat.color.copy(frame.color);
      const strength = energy * (0.5 + 0.5 * departing);
      mat.opacity = strength * 0.85;
      const length = frame.trailUnits * (0.5 + strength);
      trailBackRef.current.scale.set(length, 0.5, 1);
      trailBackRef.current.position.x = -(0.4 + length / 2);
    }

    if (trailFrontRef.current) {
      const mat = trailFrontRef.current.material as MeshBasicMaterial;
      mat.color.copy(frame.color);
      const strength = energy * (0.3 + 0.5 * arriving);
      mat.opacity = strength * 0.55;
      const length = frame.trailUnits * (0.3 + strength * 0.6);
      // Mirrored (negative scale.x) so the comet texture's bright head still
      // sits nearest the core, fading outward, on this side too.
      trailFrontRef.current.scale.set(-length, 0.4, 1);
      trailFrontRef.current.position.x = 0.35 + length / 2;
    }

    // ── Orbiting sparks — count fades in/out per stage via sparkVisibility ──
    // Their orbits breathe and precess rather than holding a fixed radius on a
    // fixed plane: a spark cluster locked to constant circles is the single
    // most mechanical-looking thing a particle can do, and it was reading
    // straight through the rest of the motion.
    SPARK_CONFIGS.forEach((cfg, i) => {
      const mesh = sparkRefs.current[i];
      if (!mesh) return;
      const angle = prefersReducedMotion
        ? cfg.phase
        : cfg.phase + t * cfg.speed * (1 + treatment.spin * 0.8);
      // Slow, per-spark precession of the orbital plane plus a breathing
      // radius, both on frequencies unrelated to the orbit itself.
      const precess = prefersReducedMotion
        ? 0
        : Math.sin(t * 0.11 + driftSeed * 0.3 + i * 2.1) * 0.55;
      const breath = prefersReducedMotion
        ? 1
        : 1 + Math.sin(t * 0.37 + driftSeed + i * 1.7) * 0.16;
      // Arrival knocks the sparks outward before they are drawn back in.
      const radius = cfg.radius * breath * (1 + punch * 0.45);
      const incline = cfg.incline + precess;
      const cosI = Math.cos(incline);
      const sinI = Math.sin(incline);
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * sinI,
        Math.sin(angle) * radius * cosI,
      );
      const visibility = clamp01(frame.sparkVisibility - i);
      const mat = mesh.material as MeshStandardMaterial;
      mat.color.copy(frame.color);
      mat.emissive.copy(frame.color);
      mat.opacity = visibility * (0.4 + treatedGlow * 0.3 + flare * 0.35);
      mat.emissiveIntensity = 1.4 + treatedGlow * 0.8 + flare * 1.2;
    });
  });

  return (
    <group ref={groupRef}>
      {/* White-hot point core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 20, 20]} />
        <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={2.5} />
      </mesh>

      {/* Soft glow halo */}
      <Billboard>
        <mesh ref={glowRef}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            opacity={0}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>

      {/* Comet trail — trailing streak (departure) + leading glow (arrival) */}
      <Billboard>
        <mesh ref={trailBackRef}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={cometTexture}
            transparent
            opacity={0}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      <Billboard>
        <mesh ref={trailFrontRef}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={cometTexture}
            transparent
            opacity={0}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>

      {/* Orbiting sparks — always-on, reads as alive at rest */}
      {SPARK_CONFIGS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            sparkRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <EmissiveCoreMaterial intensity={1.4} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
