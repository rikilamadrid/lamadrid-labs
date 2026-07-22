"use client";

import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { useIsDesktopViewport } from "@/lib/useIsDesktopViewport";
import {
  useHeroDescentProgress,
  useProcessPinProgress,
  useWithinJourney,
} from "@/lib/useSpecimenJourneyProgress";
import { ProcessScene } from "./ProcessScene";

// The single persistent desktop specimen canvas: mounted once, eagerly (no
// longer deferred behind a dynamic import — the whole point is the
// specimen is alive in Hero on page load), fixed behind every section's
// content from the top of Hero through the bottom of Process. One shared
// ScrollTrigger (useSpecimenJourneyProgress) drives it from hero-idle
// through the table descent into the untouched 5-stage system.
//
// Desktop-only: mobile shares one canvas across Hero + all 5 stage cards via
// drei's View/View.Port instead (see MobileProcessCanvas), since it can't
// run the full-frame EffectComposer this canvas uses for bloom anyway.
//
// Visibility (not unmount) toggles past the journey's end so Work/About/
// Contact's transparent section backgrounds don't let a fixed 3D layer show
// through in the page's remaining scroll — same specimen instance stays
// alive underneath (cheap: it's just idling at its settled crystallization
// pose), just hidden and non-interactive.
export function SpecimenCanvas() {
  const isDesktop = useIsDesktopViewport();
  const prefersReducedMotion = usePrefersReducedMotion();
  // Refs, not state: scrubbing the journey must not re-render this tree.
  // ProcessScene reads `heroT` continuously to scale the table/rigs in and
  // out itself (see ProcessScene's RevealGroup), so no separate boolean
  // mount-gate state is needed here.
  const heroT = useHeroDescentProgress();
  const processProgress = useProcessPinProgress();
  // The only scroll-derived value that legitimately needs a render, since it
  // toggles visibility. Flips at most twice per journey.
  const withinJourney = useWithinJourney();

  if (!isDesktop || prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        visibility: withinJourney ? "visible" : "hidden",
      }}
      className="pointer-events-none"
    >
      <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ProcessScene progress={processProgress} heroT={heroT} />
      </Canvas>
    </div>
  );
}
