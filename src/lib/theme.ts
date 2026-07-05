"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/** Dark is the signature default; light is a deliberate variant. */
export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "lab-theme";
const THEME_CHANGE_EVENT = "lab-theme-change";

/**
 * Inline pre-hydration script. Runs before paint so the correct theme is on
 * <html> before first render — no flash of the wrong theme. Kept dependency
 * free and self-contained because it is injected as a raw string.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME}");}})();`;

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

// The applied attribute on <html> is the single source of truth; the inline
// script sets it before hydration so React can read it without a flash.
function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: light)");

  // Follow OS preference only while the visitor has made no explicit choice.
  const onMedia = () => {
    if (readStoredTheme() === null) {
      applyTheme(systemTheme());
      onChange();
    }
  };

  // Keep other tabs in sync when the choice changes.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const stored = readStoredTheme();
    if (stored) applyTheme(stored);
    onChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  media.addEventListener("change", onMedia);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    media.removeEventListener("change", onMedia);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Reads the applied theme (set pre-hydration), keeps React in sync via
 * `useSyncExternalStore` — hydration-safe, no flash — and persists explicit
 * choices. With no explicit choice, OS preference is followed silently.
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setTheme = (next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort (e.g. private mode); the toggle still works.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
