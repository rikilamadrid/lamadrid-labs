"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { services } from "@/data/services";

export function Services() {
  const dict = useDictionary();

  return (
    <section id="services" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="lab-fade-up mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-lab-line bg-lab-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lab-muted sm:text-xs">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-lab-accent shadow-lab-glow"
            />
            {dict.services.eyebrow}
          </span>

          <h2>{dict.services.title}</h2>
          <p className="max-w-md">{dict.services.lead}</p>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const content = dict.services.items[service.id];

            return (
              <li key={service.id}>
                <div className="lab-glass flex h-full flex-col gap-4 rounded-lab-lg p-8">
                  <h3 className="text-lab-ink">{content.title}</h3>

                  <p>{content.summary}</p>

                  <ul className="mt-2 flex flex-1 flex-col gap-2.5">
                    {content.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex items-start gap-2.5 text-sm text-lab-muted"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-lab-accent"
                        />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
