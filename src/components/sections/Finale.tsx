"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import {
  MotionLinkCard,
  MotionReveal,
} from "@/components/ui/MotionPrimitives";
import { projects } from "@/data/projects";
import { contactLink } from "@/data/social";

// RicardoOS is the payoff of the Intake→Ship narrative — presented as the
// specimen currently in production. Project data (title/summary/tags/url) stays
// single-sourced from projects.ts + dict.work.projects; dict.finale only holds
// the finale-specific framing copy.
const FEATURED_ID = "ricardo-os";

export function Finale() {
  const dict = useDictionary();

  const featured = projects.find((project) => project.id === FEATURED_ID);
  const rest = projects.filter((project) => project.id !== FEATURED_ID);

  if (!featured) return null;
  const featuredContent = dict.work.projects[featured.id];

  return (
    <section id="finale" className="lab-section">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="lab-section-header">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.finale.eyebrow}
          </span>

          <h2>{dict.finale.title}</h2>
          <p className="max-w-md">{dict.finale.lead}</p>
        </MotionReveal>

        {/* Featured: RicardoOS, the specimen in production */}
        <MotionLinkCard
          href={featured.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="lab-card-surface group mt-12 flex min-w-0 flex-col gap-5 rounded-lab-lg p-8 outline-none focus-visible:ring-2 focus-visible:ring-lab-accent-strong sm:p-10"
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="lab-card-kicker">{dict.finale.featuredLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-lab-accent">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-lab-accent"
              />
              {dict.work.status.live}
            </span>
          </div>

          <h3 className="text-2xl text-lab-ink transition-colors group-hover:text-lab-accent sm:text-3xl">
            {featuredContent.title}
          </h3>

          <p className="max-w-xl flex-1">{featuredContent.summary}</p>

          <div className="flex flex-wrap gap-2">
            {featuredContent.tags.map((tag) => (
              <span key={tag} className="lab-token">
                {tag}
              </span>
            ))}
          </div>

          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-lab-accent">
            {dict.finale.featuredCta}
            <span aria-hidden="true">&rarr;</span>
          </span>
        </MotionLinkCard>

        {/* The rest of the specimens */}
        <div className="mt-16">
          <MotionReveal>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
              {dict.finale.restTitle}
            </h3>
          </MotionReveal>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {rest.map((project, index) => {
              const content = dict.work.projects[project.id];

              return (
                <li key={project.id} className="min-w-0">
                  <MotionLinkCard
                    href={project.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    delay={index * 0.08}
                    className="lab-card-surface group flex h-full min-w-0 flex-col gap-3 rounded-lab-lg p-6 outline-none focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
                  >
                    <h4 className="text-lab-ink transition-colors group-hover:text-lab-accent">
                      {content.title}
                    </h4>
                    <p className="flex-1 text-sm">{content.summary}</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-lab-accent">
                      {dict.finale.restCta}
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </MotionLinkCard>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact close — reuses the mailto pattern; carries the #contact
            anchor now that the standalone Contact section is gone. */}
        <div id="contact" className="scroll-mt-24">
          <MotionReveal className="mt-16 flex flex-col items-start gap-4 rounded-lab-lg border border-lab-line p-8 sm:p-10">
            <h3 className="text-xl text-lab-ink sm:text-2xl">
              {dict.finale.contactTitle}
            </h3>
            <p className="max-w-md">{dict.finale.contactLead}</p>
            <a
              href={contactLink.href}
              className="mt-1 inline-flex items-center justify-center rounded-full bg-lab-accent px-6 py-3 text-sm font-semibold text-lab-accent-ink outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
            >
              {dict.finale.contactCta}
            </a>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
