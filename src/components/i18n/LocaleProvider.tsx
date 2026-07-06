"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { dictionaries, type Dictionary } from "@/data/i18n";
import { en } from "@/data/i18n/en";
import { useLocale, type Locale } from "@/lib/locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Deep-merges a locale dictionary over English so any key that is missing at
 * runtime falls back to English. The shared `Dictionary` type already forces
 * completeness at compile time; this is the belt-and-braces runtime safety net.
 */
function withFallback<T>(base: T, override: T): T {
  if (
    typeof base !== "object" ||
    base === null ||
    typeof override !== "object" ||
    override === null ||
    Array.isArray(base) ||
    Array.isArray(override)
  ) {
    return override ?? base;
  }

  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base as Record<string, unknown>)) {
    result[key] = withFallback(
      (base as Record<string, unknown>)[key],
      (override as Record<string, unknown>)[key],
    );
  }
  return result as T;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useLocale();

  const dict = useMemo(
    () => withFallback(en, dictionaries[locale]),
    [locale],
  );

  // The static HTML ships English metadata (the default) for crawlers; reflect
  // the active locale in the live document once a choice is applied.
  useEffect(() => {
    document.title = dict.meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", dict.meta.description);
  }, [dict]);

  const value = useMemo(
    () => ({ locale, setLocale, dict }),
    [locale, setLocale, dict],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within a LocaleProvider");
  }
  return context;
}

/** Convenience hook for components that only need the active dictionary. */
export function useDictionary(): Dictionary {
  return useLocaleContext().dict;
}
