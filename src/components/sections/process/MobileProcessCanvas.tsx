"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

// One shared WebGL context for every mobile Process stage, mirroring
// NarrativeCanvas's precedent — 5 stacked stages sharing a single Canvas
// instead of 5 separate GL contexts. Each MobileProcessStage renders its
// own <View> in normal document flow; this fixed, transparent canvas is
// what actually paints into each View's on-screen rect via scissor.
//
// z-index must outrank the stage cards' `.lab-card-surface` background:
// `backdrop-filter` promotes that div to its own stacking context, which
// beats this canvas's `position: fixed` at z-index 0 — without a higher
// value here the rig renders but is fully hidden behind every card.
//
// Clipped below Nav's fixed pill (top-4, z-50): at that z-index a stage
// card scrolling past the very top of the viewport would otherwise paint
// its rig through Nav's translucent `.lab-glass` background.
export function MobileProcessCanvas() {
  return (
    <Canvas
      className="pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10,
        clipPath: "inset(5rem 0 0 0)",
      }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <View.Port />
    </Canvas>
  );
}
