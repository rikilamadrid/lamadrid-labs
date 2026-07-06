"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MotionReveal } from "@/components/ui/MotionPrimitives";

export function About() {
  const dict = useDictionary();

  return (
    <section id="about" className="lab-section">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="lab-section-header">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.about.eyebrow}
          </span>

          <h2>{dict.about.title}</h2>
          <p className="max-w-md">{dict.about.lead}</p>
        </MotionReveal>

        <MotionReveal
          delay={0.08}
          className="lab-card-surface mx-auto mt-16 flex max-w-3xl flex-col gap-5 rounded-lab-lg p-7 sm:p-10"
        >
          {dict.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </MotionReveal>
      </div>
    </section>
  );
}
