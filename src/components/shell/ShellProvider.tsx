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
import { playSound } from "@/lib/sound";

/**
 * The no-scroll shell's state machine: which full-screen state is showing and
 * whether the menu overlay is open. Shared between the corner nav (which drives
 * it) and the stage (which renders the active state), so it lives in context
 * above both — mirroring the existing `LocaleProvider` pattern.
 */
interface ShellContextValue {
  view: ViewKey;
  setView: (view: ViewKey) => void;
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<ViewKey>("home");
  const [menuOpen, setMenuOpen] = useState(false);

  // The shell's semantic actions are exactly the interactions that should make
  // sound, so the blips live here — every caller sounds consistently and none
  // has to remember to play one. `playSound` is a no-op while sound is off.

  // Choosing a destination is also what closes the menu — the two always move
  // together, so callers never have to remember to close it.
  const setView = useCallback((next: ViewKey) => {
    setViewState(next);
    setMenuOpen(false);
    playSound("navigate");
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    playSound("menuOpen");
  }, []);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    playSound("menuClose");
  }, []);
  const toggleMenu = useCallback(() => {
    setMenuOpen(!menuOpen);
    playSound(menuOpen ? "menuClose" : "menuOpen");
  }, [menuOpen]);

  const value = useMemo(
    () => ({ view, setView, menuOpen, openMenu, closeMenu, toggleMenu }),
    [view, menuOpen, setView, openMenu, closeMenu, toggleMenu],
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
