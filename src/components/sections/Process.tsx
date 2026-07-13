"use client";

import dynamic from "next/dynamic";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { processStages } from "@/data/process";
import { useIsDesktopViewport } from "@/lib/useIsDesktopViewport";
import { ProcessStaticFallback } from "./process/ProcessStaticFallback";

// One extra viewport height of scroll per stage — mirrors ProcessScrollRig's
// own SCROLL_HEIGHT_VH constant. Duplicated here (rather than imported) so
// the desktop loading placeholder below can reserve the pin's real height
// without pulling in ProcessScrollRig's GSAP/Three.js weight just to read one
// number.
const DESKTOP_SCROLL_HEIGHT_VH = processStages.length * 100;

// GSAP + Three.js/R3F/drei add ~900KB of JS (see feature 21's dependency
// spike). Both scroll-driven variants are code-split out of the initial
// bundle so that weight never lands on Hero's critical path — only the
// variant actually needed gets fetched. Each gets a `loading` placeholder
// sized/shaped close to its real content so Work/About/Contact don't jump
// once the chunk resolves — an unstyled dynamic import measured as a 0.6
// CLS regression in Lighthouse (the section's real height collapses to
// nothing until its JS arrives).
const ProcessScrollRig = dynamic(
  () => import("./process/ProcessScrollRig").then((mod) => mod.ProcessScrollRig),
  {
    ssr: false,
    loading: () => <div style={{ height: `${DESKTOP_SCROLL_HEIGHT_VH}vh` }} />,
  },
);
const MobileProcessStack = dynamic(
  () => import("./process/MobileProcessStack").then((mod) => mod.MobileProcessStack),
  {
    ssr: false,
    loading: () => <ProcessStaticFallbackLoading />,
  },
);

// Mirrors MobileProcessStack's header + ProcessStaticFallback's copy-only
// stage list (no GSAP/Three.js) as a same-shaped stand-in while its chunk
// loads — closer to final layout height than an empty div, though the real
// stack's per-stage aspect-square rig placeholders add some extra height
// once it mounts.
function ProcessStaticFallbackLoading() {
  const dict = useDictionary();
  return (
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
  );
}

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
