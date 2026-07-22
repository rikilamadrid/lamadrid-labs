"use client";

import { useIsDesktopViewport } from "@/lib/useIsDesktopViewport";
import { MobileProcessCanvas } from "./MobileProcessCanvas";

// Mobile's counterpart to desktop's SpecimenCanvas: hoists the shared
// View/View.Port canvas (feature 39) up to page level so it's available to
// Hero's HeroMobileSpecimen view as well as MobileProcessStack's 5 stage
// views, instead of only mounting once Process's mobile stack renders.
// Desktop mounts its own SpecimenCanvas instead — self-gates here rather
// than at the page.tsx call site so both layers can sit side by side.
export function MobileSpecimenLayer() {
  const isDesktop = useIsDesktopViewport();
  if (isDesktop) return null;
  return <MobileProcessCanvas />;
}
