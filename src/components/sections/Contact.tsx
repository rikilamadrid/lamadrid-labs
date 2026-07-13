"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MotionReveal } from "@/components/ui/MotionPrimitives";
import { contactLink } from "@/data/social";

export function Contact() {
  const dict = useDictionary();

  return (
    <section id="contact" className="lab-section scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="lab-section-header">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.contact.eyebrow}
          </span>

          <h2>{dict.contact.title}</h2>
          <p className="max-w-md">{dict.contact.lead}</p>
        </MotionReveal>

        <MotionReveal className="mt-12 flex flex-col items-start gap-4 rounded-lab-lg border border-lab-line p-8 sm:p-10">
          <a
            href={contactLink.href}
            className="inline-flex items-center justify-center rounded-full bg-lab-accent px-6 py-3 text-sm font-semibold text-lab-accent-ink outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
          >
            {dict.contact.cta}
          </a>
        </MotionReveal>
      </div>
    </section>
  );
}
