"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { useIsDesktopViewport } from "@/lib/useIsDesktopViewport";
import { MobileProcessStack } from "./process/MobileProcessStack";
import { ProcessScrollRig } from "./process/ProcessScrollRig";
import { ProcessStaticFallback } from "./process/ProcessStaticFallback";

// The chemistry-lab Process section: on desktop (`lg` and up), a pinned
// horizontal scroll rig drives one shared orb (35) through all 5 stage
// rigs (36/37) with synced copy. Below `lg`, the same 5 stages render as a
// per-stage-scrubbed vertical stack (39) instead — 38's pin ScrollTrigger
// is never created there. `prefers-reduced-motion` overrides both in favor
// of a plain static list, with no Three.js canvas mounted at all.
export function Process() {
  const dict = useDictionary();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktopViewport();

  return (
    <section id="process">
      {prefersReducedMotion ? (
        <div className="lab-section">
          <div className="lab-section-header">
            <span className="lab-eyebrow">
              <span aria-hidden="true" className="lab-eyebrow-dot" />
              {dict.process.eyebrow}
            </span>
            <h2>{dict.process.title}</h2>
            <p className="max-w-md">{dict.process.lead}</p>
          </div>
          <ProcessStaticFallback dict={dict.process} />
        </div>
      ) : isDesktop ? (
        <ProcessScrollRig dict={dict.process} />
      ) : (
        <MobileProcessStack dict={dict.process} />
      )}
    </section>
  );
}
