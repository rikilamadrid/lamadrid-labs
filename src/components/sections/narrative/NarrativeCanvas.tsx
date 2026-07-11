"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

// One persistent WebGL context shared by every narrative stage's specimen
// visual, instead of a Canvas per stage (5 stages x 5 GL contexts). Each
// NarrativeStage renders its own <View> in normal document flow; this
// fixed, transparent, pointer-events-none canvas is what actually paints
// into each View's on-screen rect via scissor. Mount once per page.
export function NarrativeCanvas() {
  return (
    <Canvas
      className="pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 20,
      }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <View.Port />
    </Canvas>
  );
}
