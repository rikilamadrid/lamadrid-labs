"use client";

import { useRef } from "react";
import { HeroField } from "@/components/hero/HeroField";
import {
  useDictionary,
  useLocaleContext,
} from "@/components/i18n/LocaleProvider";

export function Hero() {
  const dict = useDictionary();
  const { locale } = useLocaleContext();
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <section className="lab-section isolate flex min-h-svh flex-col justify-center overflow-hidden">
      {/* The field spans the section and sits above the muted headline (which
          it resolves) but below the supporting copy (which stays crisp).
          Decorative and non-interactive — the CTA underneath stays clickable. */}
      <HeroField
        headingRef={headingRef}
        localeKey={locale}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-start gap-6 text-left">
        <span className="lab-label relative z-20">{dict.hero.eyebrow}</span>

        {/* Resting register: legible but unresolved (noise ramp), never full
            ink. The field brightens it toward the signal accent under the
            pointer. Real DOM text — the accessible, indexable source. */}
        <h1 ref={headingRef} className="relative z-0 max-w-3xl">
          {dict.hero.titleLines.map((line, index) => (
            // Colored on the span, not the h1: the unlayered `h1` base color
            // rule outranks a layered utility, but a direct declaration on the
            // span beats the inherited ink either way.
            <span key={index} data-hero-line className="block text-lab-noise-4">
              {line}
            </span>
          ))}
        </h1>

        <p className="relative z-20 w-full max-w-md">{dict.hero.lead}</p>

        <div className="relative z-20 mt-2">
          <a
            href="#work"
            className="inline-flex items-center justify-center rounded-full border border-lab-line-strong px-6 py-3 text-sm font-medium text-lab-ink outline-none transition-colors hover:border-lab-signal hover:text-lab-signal focus-visible:ring-2 focus-visible:ring-lab-signal"
          >
            {dict.hero.ctaPrimary}
          </a>
        </div>
      </div>
    </section>
  );
}
