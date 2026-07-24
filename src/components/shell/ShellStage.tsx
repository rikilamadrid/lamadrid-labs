"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Hero } from "@/components/sections/Hero";
import { PlaceholderState } from "@/components/shell/states/PlaceholderState";
import { useShell } from "@/components/shell/ShellProvider";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Renders the active full-screen state, crossfading between states with no page
 * scroll. Only `home` (the hero) is built; the rest are placeholders reached
 * through the menu until their states land (Features 6+).
 */
export function ShellStage() {
  const { view } = useShell();
  const reduce = useReducedMotion();

  const stateMotion = reduce
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DURATION.base, ease: EASE.resolve },
      };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={view} className="absolute inset-0" {...stateMotion}>
          {view === "home" ? (
            <Hero />
          ) : (
            <PlaceholderState viewKey={view} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
