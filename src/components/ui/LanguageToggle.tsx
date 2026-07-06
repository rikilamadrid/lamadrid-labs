"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useLocale, LOCALE_NAMES, LOCALES, type Locale } from "@/lib/locale";

const SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
};

/**
 * Compact EN · FR · ES switcher for the Nav. A `role="group"` of toggle buttons
 * with `aria-pressed` marking the active language — keyboard accessible with a
 * visible focus ring, and sized to hold longer labels without shifting layout.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const dict = useDictionary();

  return (
    <div
      role="group"
      aria-label={dict.language.label}
      className="inline-flex flex-none items-center gap-0.5 rounded-full border border-lab-line bg-lab-surface p-0.5"
    >
      {LOCALES.map((code) => {
        const isActive = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            aria-label={LOCALE_NAMES[code]}
            title={LOCALE_NAMES[code]}
            className={`rounded-full px-2 py-1 text-[11px] font-semibold tracking-[0.08em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-lab-accent-strong ${
              isActive
                ? "bg-lab-accent text-lab-accent-ink"
                : "text-lab-muted hover:text-lab-ink"
            }`}
          >
            {SHORT_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
