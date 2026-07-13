"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

// One shared WebGL context for every mobile Process stage, mirroring
// NarrativeCanvas's precedent — 5 stacked stages sharing a single Canvas
// instead of 5 separate GL contexts. Each MobileProcessStage renders its
// own <View> in normal document flow; this fixed, transparent canvas is
// what actually paints into each View's on-screen rect via scissor.
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
        zIndex: 0,
      }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <View.Port />
    </Canvas>
  );
}
