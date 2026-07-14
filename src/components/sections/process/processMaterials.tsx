"use client";

import type { ComponentProps } from "react";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  PROCESS_BENCH_COLOR,
  PROCESS_CORE_WHITE,
  PROCESS_ENV_KEY,
  PROCESS_ENV_RIM,
  PROCESS_GLASS_TINT,
  PROCESS_METAL_COLOR,
} from "@/lib/narrativeSignals";
import type { ProcessQualityTier } from "@/lib/useProcessQualityTier";
import { RIG_PLATFORM_TOP_Y } from "./rigPrimitives";

// ─────────────────────────────────────────────────────────────────────────
// Feature 45 — Premium 3D Foundation.
//
// The shared rendering foundation every later Process stage rebuild (46-52)
// applies rather than hand-rolling: a small premium material toolkit
// (transmission glass, brushed metal, emissive core), a fetch-free generated
// studio environment for real reflections, a reflective bench, and a
// restrained bloom+vignette composer. Every knob is driven by the shared
// quality tier (useProcessQualityTier) so mobile scales down from the same
// primitives — mobile-first, not a later catch-up pass.
// ─────────────────────────────────────────────────────────────────────────

interface GlassMaterialProps {
  tier: ProcessQualityTier;
  /** Optional cyan/teal tint; defaults to the shared cool glass tint. */
  color?: string;
  thickness?: number;
  transparent?: boolean;
  opacity?: number;
}

// Premium glass. Desktop refracts for real via MeshTransmissionMaterial; the
// mobile tier (`transmission: null`) swaps in a cheap physical-material
// approximation that still reads glassy through env reflections + clearcoat,
// with no per-frame transmission render target.
export function GlassMaterial({
  tier,
  color = PROCESS_GLASS_TINT,
  thickness = 0.6,
  transparent = true,
  opacity = 0.4,
}: GlassMaterialProps) {
  if (!tier.transmission) {
    return (
      <meshPhysicalMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        roughness={0.08}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.12}
        ior={1.4}
        envMapIntensity={1.3}
        reflectivity={0.6}
      />
    );
  }

  return (
    <MeshTransmissionMaterial
      samples={tier.transmission.samples}
      resolution={tier.transmission.resolution}
      transmission={1}
      thickness={thickness}
      roughness={0.08}
      ior={1.4}
      chromaticAberration={0.03}
      anisotropicBlur={0.1}
      distortion={0}
      temporalDistortion={0}
      color={color}
    />
  );
}

// Brushed-metal machine bodies (stirrer bases, platforms, legs). Reflects the
// generated environment so it stops reading as flat plastic.
export function BrushedMetalMaterial(
  props: Omit<ComponentProps<"meshStandardMaterial">, "ref">,
) {
  return (
    <meshStandardMaterial
      color={PROCESS_METAL_COLOR}
      metalness={1}
      roughness={0.38}
      envMapIntensity={1.1}
      {...props}
    />
  );
}

interface EmissiveCoreMaterialProps {
  color?: string;
  intensity?: number;
  transparent?: boolean;
  opacity?: number;
}

// The hot glowing core / emissive accents that bloom picks up. Kept
// `toneMapped={false}` so the emissive value survives ACES tone mapping and
// reads as lit, not muddy.
export function EmissiveCoreMaterial({
  color = PROCESS_CORE_WHITE,
  intensity = 1.4,
  transparent = false,
  opacity = 1,
}: EmissiveCoreMaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      toneMapped={false}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

interface ProcessEnvironmentProps {
  tier: ProcessQualityTier;
}

// Fetch-free studio environment (static-export safe — no HDRI URL). Baked once
// (`frames={1}`) from a few cyan key/fill lightformers against a dark base so
// glass and metal have real cool reflections. `background={false}` keeps the
// visible page background the site's own themed surface, not this map.
export function ProcessEnvironment({ tier }: ProcessEnvironmentProps) {
  return (
    <Environment
      resolution={tier.environmentResolution}
      frames={1}
      background={false}
    >
      <Lightformer
        intensity={2.4}
        color={PROCESS_ENV_KEY}
        position={[0, 4, 3]}
        scale={[8, 8, 1]}
      />
      <Lightformer
        intensity={0.9}
        color={PROCESS_ENV_KEY}
        position={[-5, 1, -2]}
        scale={[5, 5, 1]}
      />
      <Lightformer
        intensity={0.6}
        color={PROCESS_ENV_RIM}
        position={[5, -1, -3]}
        scale={[6, 6, 1]}
      />
      <Lightformer
        form="ring"
        intensity={0.4}
        color={PROCESS_CORE_WHITE}
        position={[0, -3, 2]}
        scale={[10, 10, 1]}
      />
    </Environment>
  );
}

interface ProcessBenchProps {
  tier: ProcessQualityTier;
}

// The dark reflective tabletop under the rig track — the reference bench that
// pools the rigs' glow beneath them for depth. Static in world space (the
// track slides above it); wide enough to cover the full horizontal travel.
export function ProcessBench({ tier }: ProcessBenchProps) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, RIG_PLATFORM_TOP_Y - 0.03, 0]}
    >
      <planeGeometry args={[140, 44]} />
      <MeshReflectorMaterial
        resolution={tier.reflectorResolution}
        mixBlur={1}
        mixStrength={2.2}
        blur={[300, 100]}
        mirror={0.55}
        roughness={0.85}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={PROCESS_BENCH_COLOR}
        metalness={0.6}
      />
    </mesh>
  );
}

interface ProcessEffectsProps {
  tier: ProcessQualityTier;
}

// Restrained bloom + subtle vignette, one shared EffectComposer. Returns null
// on the mobile tier: MobileProcessCanvas composites 5 stages through drei
// <View> scissoring, which a full-frame composer can't wrap — mobile glow
// comes from the emissive materials above instead.
export function ProcessEffects({ tier }: ProcessEffectsProps) {
  if (!tier.bloom) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={tier.bloom.intensity}
        luminanceThreshold={tier.bloom.luminanceThreshold}
        luminanceSmoothing={tier.bloom.luminanceSmoothing}
        mipmapBlur={tier.bloom.mipmapBlur}
        resolutionScale={tier.bloom.resolutionScale}
      />
      <Vignette offset={0.28} darkness={0.65} eskil={false} />
    </EffectComposer>
  );
}
