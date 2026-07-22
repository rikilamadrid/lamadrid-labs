"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { HeroMobileSpecimen } from "@/components/sections/process/HeroMobileSpecimen";
import { useIsDesktopViewport } from "@/lib/useIsDesktopViewport";

export function Hero() {
  const dict = useDictionary();
  // Desktop's specimen lives in the fixed SpecimenCanvas behind this section
  // instead — only mobile needs its own in-flow view here (see
  // HeroMobileSpecimen for why it shares mobile's canvas via drei View).
  const isDesktop = useIsDesktopViewport();

  return (
    <section id="hero" className="lab-section isolate overflow-hidden">
      <div className="lab-grid-overlay" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lab-accent/[0.07] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-lab-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 top-40 h-64 w-64 rounded-full bg-lab-accent-secondary/10 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <span className="lab-eyebrow">
          <span aria-hidden="true" className="lab-eyebrow-dot" />
          <span className="min-w-0 text-center">{dict.hero.eyebrow}</span>
        </span>

        <h1 className="max-w-full sm:max-w-2xl">
          {dict.hero.titleFirst}
          <br />
          {dict.hero.titleBefore}
          <span className="lab-gradient-text">{dict.hero.titleHighlight}</span>
          {dict.hero.titleAfter}
        </h1>

        <p className="w-full max-w-md">{dict.hero.lead}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#work"
            className="inline-flex items-center justify-center rounded-full bg-lab-accent px-6 py-3 text-sm font-semibold text-lab-accent-ink outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
          >
            {dict.hero.ctaPrimary}
          </a>
          <a
            href="#process"
            className="lab-card-surface inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-lab-ink outline-none transition-colors hover:text-lab-accent focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
          >
            {dict.hero.ctaSecondary}
          </a>
        </div>

        {!isDesktop && <HeroMobileSpecimen />}
      </div>
    </section>
  );
}
