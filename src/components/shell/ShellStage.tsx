"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Hero } from "@/components/sections/Hero";
import { ProjectWorld } from "@/components/shell/ProjectWorld";
import { AboutState } from "@/components/shell/states/AboutState";
import { ContactState } from "@/components/shell/states/ContactState";
import { WorkState } from "@/components/shell/states/WorkState";
import { useShell } from "@/components/shell/ShellProvider";
import { useStageViewPresence } from "@/components/shell/stage-transition";
import { LAYERS } from "@/lib/signal/layers";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Renders the active full-screen state, transitioning between states with no
 * page scroll. `home` is the hero, `work` is the project index, `about` is the
 * founder statement, and `contact` is the closing invitation to reach out.
 *
 * The state DOM crossfades *per z-band*, not per state: this wrapper only
 * broadcasts variant labels and each state fades its own bands (see
 * `stage-transition`). The field underneath never crossfades at all — it morphs
 * toward the new state's configuration on the one persistent canvas.
 *
 * A project micro-universe layers *over* the active state (it is entered from
 * the Work index, which stays mounted underneath): entering a project zooms the
 * world in, "back" zooms it out to reveal the index again — a mode change, not a
 * page transition.
 */
export function ShellStage() {
  const { view, activeProject } = useShell();
  const reduce = useReducedMotion();
  const viewPresence = useStageViewPresence();

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
        {/* Neither a z-index nor an animated property here, on purpose: this
            wrapper must NOT establish a stacking context, or Home's <h1>
            (LAYERS.contentBelow) could not sit *below* the global field while
            its copy (LAYERS.content) sits above. It carries variant labels only
            and each state fades its own bands, so every band's z-index resolves
            against the root context and stays interleaved with the fixed
            SignalSurface canvas for the whole transition. */}
        <motion.div
          key={view}
          className="absolute inset-0"
          // While a project world owns the screen, the state underneath is
          // visually occluded — `inert` takes it out of the tab order and the
          // accessibility tree too, so keyboard and screen-reader users can't
          // wander into the hidden index behind the world.
          inert={activeProject ? true : undefined}
          {...viewPresence}
        >
          {view === "home" ? (
            <Hero />
          ) : view === "work" ? (
            <WorkState />
          ) : view === "about" ? (
            <AboutState />
          ) : (
            <ContactState />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject}
            className="absolute inset-0 origin-center"
            style={{ zIndex: LAYERS.projectWorld }}
            {...worldMotion}
          >
            <ProjectWorld id={activeProject} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
