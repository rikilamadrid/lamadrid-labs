"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Two independently-bounded ScrollTriggers rather than one combined trigger
// split by a fixed fraction — Hero and Process are adjacent DOM siblings, so
// anchoring the hero trigger's end to "bottom top" makes it end at exactly
// the scroll position where Process's own "top top" trigger begins (no gap,
// no fudge-factor fraction to keep in sync as either section's real height
// changes across viewports/content). Each hook creates its own trigger
// instance against the same stable ids rather than sharing one via context —
// cheap, and keeps every consumer independently mountable, mirroring how
// processLayout.ts's deriveStageBlend is a shared *function* consumed
// independently rather than a shared trigger instance.
//
// Progress is published through a **ref, not state**. Pushing scroll progress
// through useState re-renders the entire R3F tree (table + 5 rigs + bench +
// backdrop + effect composer) on every single scroll frame, which is what made
// scrolling feel heavy and sticky rather than frictionless — React
// reconciliation was competing with the render loop for the same 16ms. Writing
// to a ref and reading it inside `useFrame` (see ProgressSource) means
// scrolling causes exactly zero renders; the scene mounts once and animates
// itself.

// Slightly higher than the previous 0.6: the scrub is the only smoothing
// between raw wheel/trackpad deltas and the scene, and now that scrolling no
// longer costs a render there's headroom to let it glide.
const SCRUB = 0.75;

function useScrubProgressRef(config: {
  triggerId: string;
  start: string;
  end: string;
}): { readonly current: number } {
  const progressRef = useRef(0);

  useEffect(() => {
    const el = document.getElementById(config.triggerId);
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: config.start,
      end: config.end,
      scrub: SCRUB,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    progressRef.current = trigger.progress;

    return () => trigger.kill();
  }, [config.triggerId, config.start, config.end]);

  return progressRef;
}

// 0-1 across the hero-idle -> table-descent phase, ending exactly where
// Process's own pin trigger begins.
export function useHeroDescentProgress(): { readonly current: number } {
  return useScrubProgressRef({ triggerId: "hero", start: "top top", end: "bottom top" });
}

// 0-1 across the existing 5-stage Process system — identical bounds to
// ProcessScrollRig's own pin trigger, so a second independent instance of
// this (e.g. from SpecimenCanvas) always agrees with it.
export function useProcessPinProgress(): { readonly current: number } {
  return useScrubProgressRef({ triggerId: "process", start: "top top", end: "bottom bottom" });
}

// Whether the fixed specimen layer should still be visible — false once the
// user has scrolled past Process, so Work/About/Contact's transparent
// backgrounds don't let it show through underneath them. Uses a ScrollTrigger
// rather than a scroll listener that reads getBoundingClientRect: that read
// forces a synchronous layout on every single scroll event, which is a real
// and avoidable source of scroll jank.
export function useWithinJourney(): boolean {
  const [within, setWithin] = useState(true);

  useEffect(() => {
    const el = document.getElementById("process");
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "bottom top",
      // Literal "max" (not a function returning it) — GSAP only re-corrects
      // an end bound against the document's real max scroll after every
      // trigger has refreshed (including Process's own pin, which is mounted
      // later via dynamic import and adds ~5x the page height) when
      // `vars.end === "max"` exactly. A function returning "max" bypasses
      // that correction, so this trigger's end would freeze at whatever the
      // tiny pre-Process document height was on first mount.
      end: "max",
      onRefresh: (self) => setWithin(!self.isActive),
      onToggle: (self) => setWithin(!self.isActive),
    });

    return () => trigger.kill();
  }, []);

  return within;
}
