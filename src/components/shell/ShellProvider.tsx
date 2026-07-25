"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { ViewKey } from "@/data/navigation";
import type { ProjectId } from "@/data/projects";
import { playSound } from "@/lib/sound";

/**
 * The no-scroll shell's state machine: which full-screen state is showing.
 * Shared between the corner nav (which drives it) and the stage (which renders
 * the active state), so it lives in context above both — mirroring the existing
 * `LocaleProvider` pattern. There is no menu; the corners drive `setView`
 * directly.
 */
interface ShellContextValue {
  view: ViewKey;
  setView: (view: ViewKey) => void;
  /**
   * The project micro-universe currently entered, or `null` for the plain
   * state. Entering a project reorganizes the field into that project's world
   * in place — it is a mode, not a route (see `ProjectWorld` / `ShellStage`).
   */
  activeProject: ProjectId | null;
  openProject: (id: ProjectId) => void;
  closeProject: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<ViewKey>("home");
  const [activeProject, setActiveProject] = useState<ProjectId | null>(null);

  // The shell's semantic actions are exactly the interactions that should make
  // sound, so the blips live here — every caller sounds consistently and none
  // has to remember to play one. `playSound` is a no-op while sound is off.

  // Switching states also leaves any open project world, so a corner action is
  // always a clean exit back to a top-level state.
  const setView = useCallback((next: ViewKey) => {
    setViewState(next);
    setActiveProject(null);
    playSound("navigate");
  }, []);

  // Zoom into a project's world so it owns the screen.
  const openProject = useCallback((id: ProjectId) => {
    setActiveProject(id);
    playSound("navigate");
  }, []);

  // Morph the world back to the Work index. `menuClose` doubles as the "settle
  // back" voice until a dedicated one is tuned (see the sound follow-up).
  const closeProject = useCallback(() => {
    setActiveProject(null);
    playSound("menuClose");
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      activeProject,
      openProject,
      closeProject,
    }),
    [view, setView, activeProject, openProject, closeProject],
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return ctx;
}
