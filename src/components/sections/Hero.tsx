"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";

export function Hero() {
  const dict = useDictionary();

  return (
    <section className="relative isolate overflow-hidden px-6 py-24 sm:py-32">
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

      <div className="lab-fade-up relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-lab-line bg-lab-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lab-muted sm:text-xs">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 flex-none rounded-full bg-lab-accent shadow-lab-glow"
          />
          <span className="min-w-0 text-center">{dict.hero.eyebrow}</span>
        </span>

        <h1 className="max-w-2xl">
          {dict.hero.titleFirst}
          <br />
          {dict.hero.titleBefore}
          <span className="lab-gradient-text">{dict.hero.titleHighlight}</span>
          {dict.hero.titleAfter}
        </h1>

        <p className="max-w-md">{dict.hero.lead}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#work"
            className="inline-flex items-center justify-center rounded-full bg-lab-accent px-6 py-3 text-sm font-semibold text-lab-bg outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
          >
            {dict.hero.ctaPrimary}
          </a>
          <a
            href="#services"
            className="lab-glass inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-lab-ink outline-none transition-colors hover:text-lab-accent focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
          >
            {dict.hero.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
