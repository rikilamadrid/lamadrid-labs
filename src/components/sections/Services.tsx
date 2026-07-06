"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MotionCard, MotionReveal } from "@/components/ui/MotionPrimitives";
import { services } from "@/data/services";

export function Services() {
  const dict = useDictionary();

  return (
    <section id="services" className="lab-section">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="lab-section-header">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.services.eyebrow}
          </span>

          <h2>{dict.services.title}</h2>
          <p className="max-w-md">{dict.services.lead}</p>
        </MotionReveal>

        <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const content = dict.services.items[service.id];

            return (
              <li key={service.id} className="min-w-0">
                <MotionCard
                  delay={index * 0.07}
                  className="lab-card-surface flex h-full min-w-0 flex-col gap-4 rounded-lab-lg p-7 sm:p-8"
                >
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
                </MotionCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
