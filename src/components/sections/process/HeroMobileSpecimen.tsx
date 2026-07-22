"use client";

import { useEffect, useRef, useState } from "react";
import { PerspectiveCamera, View } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { Specimen } from "./Specimen";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Mobile's equivalent of desktop's Hero -> table descent: shares the same
// canvas the 5 stage cards use (MobileProcessCanvas's View/View.Port,
// feature 39 — a <View> doesn't need to be a DOM/tree neighbor of the
// Canvas it tunnels into, only for that Canvas to exist somewhere on the
// page), with the specimen idle-floating here in Hero before the first
// stage's own View picks it up. heroT drives the same hero curve the
// desktop Specimen samples (specimenPath.ts), just measured against this
// view's own scroll bounds instead of #hero's.
export function HeroMobileSpecimen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heroT, setHeroT] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 65%",
      end: "bottom 35%",
      scrub: 0.6,
      onUpdate: (self) => setHeroT(self.progress),
    });

    return () => trigger.kill();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div ref={containerRef} className="mx-auto mt-8 aspect-square w-full max-w-xs">
      <View className="h-full w-full">
        <PerspectiveCamera makeDefault position={[0, 0.3, 5]} fov={40} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 3, 3]} intensity={22} color="#ffffff" />
        <Specimen progress={0} heroT={heroT} />
      </View>
    </div>
  );
}
