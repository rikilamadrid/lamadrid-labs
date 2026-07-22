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
import type { Theme } from "@/lib/theme";
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
  /** Surface roughness. Lower is more mirror-like; the orb (46) raises it a
   *  little so its env highlights don't bloom into hard white balls. */
  roughness?: number;
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
  roughness = 0.08,
}: GlassMaterialProps) {
  if (!tier.transmission) {
    return (
      <meshPhysicalMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        roughness={roughness}
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
      roughness={roughness}
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

// A pale slate bench for light theme — the near-black `PROCESS_BENCH_COLOR`
// reads fine against dark theme's own near-black background, but against
// light theme's pale page it turned the whole lower half of the canvas into
// a stark black bar. This keeps the same "reflective lab bench" material,
// just re-tinted so it recedes into the light background instead of
// fighting it. Darker/more saturated than the page background on purpose —
// at near-bg luminance (the original #c3cdd6) the mirror had nothing to
// anchor against, so the env lightformers' reflection bloomed into a flat
// white-cyan flood instead of reading as a surface.
const PROCESS_BENCH_COLOR_LIGHT = "#7c8fa0";

interface ProcessBenchProps {
  tier: ProcessQualityTier;
  theme: Theme;
}

// The reflective tabletop under the rig track — the reference bench that
// pools the rigs' glow beneath them for depth. Static in world space (the
// track slides above it); wide enough to cover the full horizontal travel.
export function ProcessBench({ tier, theme }: ProcessBenchProps) {
  const light = theme === "light";
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, RIG_PLATFORM_TOP_Y - 0.03, 0]}
    >
      <planeGeometry args={[140, 44]} />
      <MeshReflectorMaterial
        resolution={tier.reflectorResolution}
        mixBlur={1}
        // Light theme's blur was inherited from dark theme's [300, 100] —
        // against a near-black background that heavy a blur still reads as
        // a moody, unified reflection, but against light theme's very pale
        // background it blends every reflection toward that pale colour,
        // which is what actually produced the "wall of white glare" (the
        // mixStrength/mirror numbers alone weren't the culprit: even at
        // mirror≈0, a heavily-blurred mix still washes toward whatever's
        // being blurred in). A much tighter blur keeps the effect localised
        // under the equipment instead of smearing it into a bright fog bank.
        blur={light ? [70, 30] : [300, 100]}
        mixStrength={light ? 0.16 : 2.2}
        mirror={light ? 0.03 : 0.55}
        roughness={light ? 1 : 0.85}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={light ? PROCESS_BENCH_COLOR_LIGHT : PROCESS_BENCH_COLOR}
        metalness={light ? 0.05 : 0.6}
      />
    </mesh>
  );
}

interface ProcessEffectsProps {
  tier: ProcessQualityTier;
  theme: Theme;
}

// Restrained bloom + subtle vignette, one shared EffectComposer. Returns null
// on the mobile tier: MobileProcessCanvas composites 5 stages through drei
// <View> scissoring, which a full-frame composer can't wrap — mobile glow
// comes from the emissive materials above instead.
//
// The vignette's dark corners were tuned against dark theme's own near-black
// background, where they're invisible; against light theme's pale background
// they crushed the edges of the canvas into a visible black frame. Backed
// off (not removed — some depth cue still helps) for light theme, along with
// a touch less bloom so the equipment doesn't blow out against a bright page.
export function ProcessEffects({ tier, theme }: ProcessEffectsProps) {
  if (!tier.bloom) return null;
  const light = theme === "light";

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={light ? tier.bloom.intensity * 0.6 : tier.bloom.intensity}
        luminanceThreshold={tier.bloom.luminanceThreshold}
        luminanceSmoothing={tier.bloom.luminanceSmoothing}
        mipmapBlur={tier.bloom.mipmapBlur}
        resolutionScale={tier.bloom.resolutionScale}
      />
      <Vignette offset={0.28} darkness={light ? 0.18 : 0.65} eskil={false} />
    </EffectComposer>
  );
}
