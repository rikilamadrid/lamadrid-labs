"use client";

import { useSyncExternalStore } from "react";

export type Locale = "en" | "fr" | "es";

/** English is the default and the fallback for any missing string. */
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: Locale[] = ["en", "fr", "es"];
export const LOCALE_STORAGE_KEY = "lab-locale";
const LOCALE_CHANGE_EVENT = "lab-locale-change";

/** Full language names for accessible labels, keyed by locale. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr" || value === "es";
}

/**
 * Inline pre-hydration script. Runs before paint so `<html lang>` is correct on
 * first render — no flash and no hydration mismatch. Prefers an explicit stored
 * choice, otherwise honors `navigator.language` on first visit, otherwise falls
 * back to English. Kept dependency free because it is injected as a raw string.
 */
export const LOCALE_INIT_SCRIPT = `(function(){try{var k="${LOCALE_STORAGE_KEY}";var supported=["en","fr","es"];var s=localStorage.getItem(k);var l=supported.indexOf(s)>-1?s:null;if(!l){var n=(navigator.language||"en").slice(0,2).toLowerCase();l=supported.indexOf(n)>-1?n:"${DEFAULT_LOCALE}";}document.documentElement.lang=l;}catch(e){document.documentElement.lang="${DEFAULT_LOCALE}";}})();`;

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;
}

function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

// The `lang` attribute on <html> is the single source of truth; the inline
// script sets it before hydration so React can read it without a flash.
function getSnapshot(): Locale {
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(onChange: () => void) {
  // Keep other tabs in sync when the choice changes.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LOCALE_STORAGE_KEY) return;
    const stored = readStoredLocale();
    if (stored) applyLocale(stored);
    onChange();
  };

  window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Reads the active locale (set pre-hydration on `<html lang>`), keeps React in
 * sync via `useSyncExternalStore` — hydration-safe, no flash — and persists
 * explicit choices to `localStorage`.
 */
export function useLocale() {
  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setLocale = (next: Locale) => {
    applyLocale(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort (e.g. private mode); the switch still works.
    }
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  };

  return { locale, setLocale };
}
