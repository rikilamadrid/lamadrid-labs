"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Vector3,
} from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { processStages } from "@/data/process";
import type { OrbState } from "@/data/process";
import {
  PROCESS_CORE_WHITE,
  PROCESS_GLASS_TINT,
  narrativeSignalColors,
} from "@/lib/narrativeSignals";
import { clamp01, lerp } from "@/lib/math";
import { useProcessQualityTier } from "@/lib/useProcessQualityTier";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { EmissiveCoreMaterial, GlassMaterial } from "./processMaterials";

interface OrbProps {
  /** 0-1 across the whole Process section (all 5 stages). */
  progress: number;
}

interface DerivedOrbFrame extends OrbState {
  color: Color;
}

const STAGE_COUNT = processStages.length;

// Content model's orbState.scale (34) is a unitless 1-2.4 range meant for
// this component to translate into a real Three.js value — applied literally
// it overflows the camera frustum, so it's damped into a subtle growth range.
const SCALE_DAMPING = 0.3;

// ─── Shell geometry ────────────────────────────────────────────────────────
// One glass shell that morphs droplet → sphere → crystal via two morph targets
// on a single icosphere (no muddy glass crossfade). Each target carries a
// *normal* delta too: the teardrop keeps the smooth sphere normals (its taper
// is mild), while the crystal target snaps each vertex's normal to its limiting
// facet — so the spheres stay smooth glass and the crystal reads as crisp cut
// facets, all under normal (non-flat) shading.

const BASE_RADIUS = 0.85;
const SHELL_DETAIL = 4; // 2562 verts — smooth shading keeps spheres smooth; facets from the 20 planes
const CRYSTAL_DIST = 0.82; // facet plane distance (unit space) before scaling
const CRYSTAL_SCALE = 1.12; // crystal reads as the largest, most resolved form
const TMP_COLOR = new Color();

// Teardrop target: rounded lower hemisphere (kept spherical), upper hemisphere
// tapered into a pointed spout — pointed top, round bottom, per the reference.
function teardropPosition(v: Vector3, out: Vector3): Vector3 {
  const y = Math.min(1, Math.max(-1, v.y / BASE_RADIUS)); // guard poles
  if (y <= 0) return out.copy(v);
  const horiz = Math.pow(Math.max(0, 1 - y), 0.6); // 1 at equator → 0 at apex
  return out.set(
    v.x * horiz,
    v.y + BASE_RADIUS * 0.35 * Math.pow(y, 1.5),
    v.z * horiz,
  );
}

// Facet normals for the crystal: face centroids of a base icosahedron.
function buildFacetNormals(): Vector3[] {
  const ico = new IcosahedronGeometry(1, 0);
  const pos = ico.attributes.position;
  const normals: Vector3[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    normals.push(a.clone().add(b).add(c).normalize());
  }
  ico.dispose();
  return normals;
}

// Crystal target: project a direction onto a convex polytope (icosahedral
// facet planes) so clusters of verts land coplanar → flat cut facets. Returns
// the limiting facet normal in `facetOut` so the caller can snap the vertex
// normal to it (crisp facets under smooth shading).
function crystalPosition(
  dir: Vector3,
  facets: Vector3[],
  out: Vector3,
  facetOut: Vector3,
): Vector3 {
  let minR = Infinity;
  let best = facets[0];
  for (const n of facets) {
    const dp = dir.dot(n);
    if (dp > 1e-3) {
      const r = CRYSTAL_DIST / dp;
      if (r < minR) {
        minR = r;
        best = n;
      }
    }
  }
  if (!Number.isFinite(minR)) minR = CRYSTAL_DIST;
  facetOut.copy(best);
  out.copy(dir).multiplyScalar(minR * BASE_RADIUS * CRYSTAL_SCALE);
  out.y *= 1.08; // faint vertical elongation for a gem silhouette
  return out;
}

function buildShellGeometry(): BufferGeometry {
  const geo = new IcosahedronGeometry(BASE_RADIUS, SHELL_DETAIL);
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  const facets = buildFacetNormals();

  const teardropP = new Float32Array(pos.count * 3);
  const crystalP = new Float32Array(pos.count * 3);
  // Teardrop keeps base normals (delta 0); crystal snaps to facet normals.
  const teardropN = new Float32Array(pos.count * 3);
  const crystalN = new Float32Array(pos.count * 3);

  const v = new Vector3();
  const dir = new Vector3();
  const out = new Vector3();
  const facet = new Vector3();
  const baseN = new Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    dir.copy(v).normalize();
    baseN.fromBufferAttribute(nrm, i);

    teardropPosition(v, out);
    teardropP[i * 3] = out.x - v.x;
    teardropP[i * 3 + 1] = out.y - v.y;
    teardropP[i * 3 + 2] = out.z - v.z;

    crystalPosition(dir, facets, out, facet);
    crystalP[i * 3] = out.x - v.x;
    crystalP[i * 3 + 1] = out.y - v.y;
    crystalP[i * 3 + 2] = out.z - v.z;
    crystalN[i * 3] = facet.x - baseN.x;
    crystalN[i * 3 + 1] = facet.y - baseN.y;
    crystalN[i * 3 + 2] = facet.z - baseN.z;
  }

  geo.morphAttributes.position = [
    new Float32BufferAttribute(teardropP, 3),
    new Float32BufferAttribute(crystalP, 3),
  ];
  geo.morphAttributes.normal = [
    new Float32BufferAttribute(teardropN, 3),
    new Float32BufferAttribute(crystalN, 3),
  ];
  geo.morphTargetsRelative = true;
  return geo;
}

// ─── Per-stage blend ─────────────────────────────────────────────────────
// Blends orbState + signal color between the two stages `progress` sits
// between, so the orb reads as one object evolving rather than 5 swapped
// models. Pure/allocation-light — mutates `out`, runs every frame.
function deriveOrbFrame(progress: number, out: DerivedOrbFrame): void {
  const segment = clamp01(progress) * (STAGE_COUNT - 1);
  const fromIndex = Math.min(Math.floor(segment), STAGE_COUNT - 2);
  const t = segment - fromIndex;

  const from = processStages[fromIndex];
  const to = processStages[fromIndex + 1];

  const rawScale = lerp(from.orbState.scale, to.orbState.scale, t);
  out.scale = 1 + (rawScale - 1) * SCALE_DAMPING;
  out.glow = lerp(from.orbState.glow, to.orbState.glow, t);
  out.geometryMorph = lerp(from.orbState.geometryMorph, to.orbState.geometryMorph, t);
  out.motionIntensity = lerp(from.orbState.motionIntensity, to.orbState.motionIntensity, t);
  out.color
    .set(narrativeSignalColors[from.signal])
    .lerp(TMP_COLOR.set(narrativeSignalColors[to.signal]), t);
}

// Gaussian weight for per-stage accents (bands/rings/dots peak at one stage).
function bell(x: number, center: number, width: number): number {
  const d = (x - center) / width;
  return Math.exp(-0.5 * d * d);
}

// The single persistent specimen orb (feature 46 rebuild): a premium glass
// shell around a white-hot core, evolving droplet → measured sphere →
// energetic liquid-core → refined orb → faceted crystal across the 5 stages,
// in a locked cyan/teal + white palette. Reads `progress` (0-1) and derives
// its own stage blend — no scroll wiring here (that's the scroll rig's job).
//
// Renders no camera or lights of its own so it stays mountable in the shared
// desktop scene and the mobile scene. It consumes feature 45's shared glass +
// emissive-core materials via the quality tier; a standalone preview (orb-dev)
// must supply the same environment/lighting for the glass to read.
export function Orb({ progress }: OrbProps) {
  const tier = useProcessQualityTier();
  const prefersReducedMotion = usePrefersReducedMotion();

  const groupRef = useRef<Group>(null);
  const shellRef = useRef<Mesh>(null);
  const whiteCoreRef = useRef<Mesh>(null);
  const glowCoreRef = useRef<Mesh>(null);
  const plasmaARef = useRef<Mesh>(null);
  const plasmaBRef = useRef<Mesh>(null);
  const bandARef = useRef<Mesh>(null);
  const bandBRef = useRef<Mesh>(null);
  const ringARef = useRef<Mesh>(null);
  const ringBRef = useRef<Mesh>(null);

  const shellGeometry = useMemo(() => buildShellGeometry(), []);
  useEffect(() => {
    return () => {
      shellGeometry.dispose();
    };
  }, [shellGeometry]);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const frame = useMemo<DerivedOrbFrame>(
    () => ({ scale: 1, glow: 0, geometryMorph: 0, motionIntensity: 0, color: new Color() }),
    [],
  );
  const idle = useRef({ time: 0 });

  useFrame((_, delta) => {
    deriveOrbFrame(progressRef.current, frame);
    const m = frame.geometryMorph;
    const color = frame.color;

    if (!prefersReducedMotion) idle.current.time += delta;
    const t = idle.current.time;

    // Stage-character weights.
    const teardropInf = clamp01(1 - m / 0.25);
    const crystalInf = clamp01((m - 0.75) / 0.25);
    const bandW = bell(m, 0.25, 0.12);
    const swirlW = bell(m, 0.5, 0.16);
    const ringW = 0.14 + 0.86 * bell(m, 0.75, 0.16);

    // ── Group: float/drift + compact droplet + growth ──
    if (groupRef.current) {
      const g = groupRef.current;
      const compact = lerp(1, 0.72, teardropInf); // droplet reads smaller
      g.scale.setScalar(frame.scale * compact);
      if (!prefersReducedMotion) {
        g.rotation.y += delta * (0.05 + frame.motionIntensity * 0.25);
        g.position.y = Math.sin(t * 0.6) * 0.04;
        g.position.x = Math.sin(t * 0.4 + 1.3) * 0.02;
      }
    }

    // ── Shell: morph droplet ↔ sphere ↔ crystal ──
    // (morphTargetInfluences is initialised in the mesh's onUpdate, which runs
    // at commit before the first render — see the shell mesh below.)
    const influences = shellRef.current?.morphTargetInfluences;
    if (influences) {
      influences[0] = teardropInf;
      influences[1] = crystalInf;
    }

    // ── White-hot point core — a small, intense point (not a big bloom blob) ──
    if (whiteCoreRef.current) {
      const mat = whiteCoreRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 2 + frame.glow * 1.4;
      const breathe = prefersReducedMotion
        ? 0
        : Math.sin(t * (1.4 + frame.motionIntensity * 2)) * 0.008 * (0.4 + frame.motionIntensity);
      whiteCoreRef.current.scale.setScalar(0.07 + frame.glow * 0.03 + breathe);
    }

    // ── Stage-colored core glow — a tight halo around the point ──
    if (glowCoreRef.current) {
      const mat = glowCoreRef.current.material as MeshStandardMaterial;
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.emissiveIntensity = 0.5 + frame.glow * 0.8;
      mat.opacity = 0.4 + frame.glow * 0.3;
      glowCoreRef.current.scale.setScalar(0.14 + frame.glow * 0.06 + swirlW * 0.05);
    }

    // ── Synthesis liquid-swirl plasma (peaks at stage 3) — internal wisps, not a fill ──
    [plasmaARef, plasmaBRef].forEach((ref, i) => {
      if (!ref.current) return;
      const mat = ref.current.material as MeshStandardMaterial;
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.opacity = swirlW * (0.32 - i * 0.1);
      mat.emissiveIntensity = 0.7 + frame.glow * 0.6;
      const dir = i === 0 ? 1 : -1;
      ref.current.scale.setScalar(0.24 + swirlW * 0.16 + i * 0.05);
      if (!prefersReducedMotion) {
        ref.current.rotation.y += delta * dir * (0.6 + frame.motionIntensity * 2.2);
        ref.current.rotation.x += delta * dir * 0.4;
      }
    });

    // ── Measurement graticule bands (peak at stage 2) ──
    [bandARef, bandBRef].forEach((ref) => {
      if (!ref.current) return;
      const mat = ref.current.material as MeshStandardMaterial;
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.emissiveIntensity = 0.5 + frame.glow * 0.5;
      mat.opacity = bandW * 0.7;
    });

    // ── Orbit rings — atom motif, emphasised at purification (stage 4) ──
    [ringARef, ringBRef].forEach((ref, i) => {
      if (!ref.current) return;
      const mat = ref.current.material as MeshStandardMaterial;
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.emissiveIntensity = 0.3 + frame.glow * 0.5;
      mat.opacity = ringW * (0.4 + i * 0.1);
      if (!prefersReducedMotion) {
        const dir = i === 0 ? 1 : -1;
        ref.current.rotation.z += delta * dir * (0.08 + frame.motionIntensity * 0.2);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Glass shell — morphs droplet ↔ sphere ↔ crystal */}
      <mesh
        ref={shellRef}
        geometry={shellGeometry}
        onUpdate={(self) => self.updateMorphTargets()}
      >
        <GlassMaterial
          tier={tier}
          color={PROCESS_GLASS_TINT}
          thickness={0.25}
          roughness={0.16}
        />
      </mesh>

      {/* White-hot point core */}
      <mesh ref={whiteCoreRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <EmissiveCoreMaterial color={PROCESS_CORE_WHITE} intensity={3} />
      </mesh>

      {/* Stage-colored core glow */}
      <mesh ref={glowCoreRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <EmissiveCoreMaterial intensity={1} transparent opacity={0.6} />
      </mesh>

      {/* Synthesis liquid-swirl plasma */}
      <mesh ref={plasmaARef}>
        <icosahedronGeometry args={[1, 2]} />
        <EmissiveCoreMaterial intensity={1} transparent opacity={0} />
      </mesh>
      <mesh ref={plasmaBRef} rotation={[0.6, 0.4, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <EmissiveCoreMaterial intensity={1} transparent opacity={0} />
      </mesh>

      {/* Measurement graticule bands */}
      <mesh ref={bandARef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.006, 8, 96]} />
        <EmissiveCoreMaterial intensity={0.5} transparent opacity={0} />
      </mesh>
      <mesh ref={bandBRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.34, 0]}>
        <torusGeometry args={[0.66, 0.005, 8, 96]} />
        <EmissiveCoreMaterial intensity={0.5} transparent opacity={0} />
      </mesh>

      {/* Orbit rings — atom motif */}
      <mesh ref={ringARef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.62, 0.008, 8, 80]} />
        <EmissiveCoreMaterial intensity={0.4} transparent opacity={0} />
      </mesh>
      <mesh ref={ringBRef} rotation={[Math.PI / 1.6, Math.PI / 5, 0]}>
        <torusGeometry args={[0.7, 0.006, 8, 80]} />
        <EmissiveCoreMaterial intensity={0.4} transparent opacity={0} />
      </mesh>
    </group>
  );
}
