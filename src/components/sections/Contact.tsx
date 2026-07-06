"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { contactLink } from "@/data/social";

export function Contact() {
  const dict = useDictionary();

  return (
    <section id="contact" className="relative px-6 py-24 sm:py-32">
      <div className="lab-fade-up mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-lab-line bg-lab-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lab-muted sm:text-xs">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-lab-accent shadow-lab-glow"
          />
          {dict.contact.eyebrow}
        </span>

        <h2>{dict.contact.title}</h2>
        <p className="max-w-md">{dict.contact.lead}</p>

        <a
          href={contactLink.href}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-lab-accent px-6 py-3 text-sm font-semibold text-lab-bg outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
        >
          {dict.contact.cta}
        </a>
      </div>
    </section>
  );
}
