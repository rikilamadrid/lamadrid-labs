"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { ProcessScrollRig } from "./process/ProcessScrollRig";
import { ProcessStaticFallback } from "./process/ProcessStaticFallback";

// The chemistry-lab Process section: a pinned horizontal scroll rig drives
// one shared orb (35) through all 5 stage rigs (36/37) with synced copy.
// `prefers-reduced-motion` skips the pin entirely — no ScrollTrigger, no
// Three.js canvas — in favor of a plain stacked list of the same content.
export function Process() {
  const dict = useDictionary();
  const prefersReducedMotion = usePrefersReducedMotion();

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
      ) : (
        <ProcessScrollRig dict={dict.process} />
      )}
    </section>
  );
}
