"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MotionReveal } from "@/components/ui/MotionPrimitives";

export function About() {
  const dict = useDictionary();

  return (
    <section id="about" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-lab-line bg-lab-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lab-muted sm:text-xs">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-lab-accent shadow-lab-glow"
            />
            {dict.about.eyebrow}
          </span>

          <h2>{dict.about.title}</h2>
          <p className="max-w-md">{dict.about.lead}</p>
        </MotionReveal>

        <MotionReveal
          delay={0.08}
          className="lab-glass mx-auto mt-16 flex max-w-3xl flex-col gap-5 rounded-lab-lg p-8 sm:p-10"
        >
          {dict.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </MotionReveal>
      </div>
    </section>
  );
}
