"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Hero } from "@/components/sections/Hero";
import { ProjectWorld } from "@/components/shell/ProjectWorld";
import { AboutState } from "@/components/shell/states/AboutState";
import { PlaceholderState } from "@/components/shell/states/PlaceholderState";
import { WorkState } from "@/components/shell/states/WorkState";
import { useShell } from "@/components/shell/ShellProvider";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Renders the active full-screen state, crossfading between states with no page
 * scroll. `home` is the hero, `work` is the project index, and `about` is the
 * founder statement; `contact` is still a placeholder until its state lands.
 *
 * A project micro-universe layers *over* the active state (it is entered from
 * the Work index, which stays mounted underneath): entering a project zooms the
 * world in, "back" zooms it out to reveal the index again — a mode change, not a
 * page transition.
 */
export function ShellStage() {
  const { view, activeProject } = useShell();
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

  // Zoom-into-another-system: the world scales up from just behind the plane and
  // fades in; leaving reverses it. Reduced motion gets a plain cut.
  const worldMotion = reduce
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.94 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.04 },
        transition: { duration: DURATION.slow, ease: EASE.resolve },
      };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          className="absolute inset-0"
          // While a project world owns the screen, the state underneath is
          // visually occluded — `inert` takes it out of the tab order and the
          // accessibility tree too, so keyboard and screen-reader users can't
          // wander into the hidden index behind the world.
          inert={activeProject ? true : undefined}
          {...stateMotion}
        >
          {view === "home" ? (
            <Hero />
          ) : view === "work" ? (
            <WorkState />
          ) : view === "about" ? (
            <AboutState />
          ) : (
            <PlaceholderState viewKey={view} />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject}
            className="absolute inset-0 z-30 origin-center"
            {...worldMotion}
          >
            <ProjectWorld id={activeProject} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
