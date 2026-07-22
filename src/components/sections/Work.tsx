"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import {
  MotionLinkCard,
  MotionReveal,
} from "@/components/ui/MotionPrimitives";
import { projects } from "@/data/projects";

// RicardoOS is the featured entry; project data (title/summary/tags/url)
// stays single-sourced from projects.ts + dict.work.projects.
const FEATURED_ID = "ricardo-os";

export function Work() {
  const dict = useDictionary();

  const featured = projects.find((project) => project.id === FEATURED_ID);
  const rest = projects.filter((project) => project.id !== FEATURED_ID);

  if (!featured) return null;
  const featuredContent = dict.work.projects[featured.id];

  return (
    <section id="work" className="lab-section">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="lab-section-header">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.work.eyebrow}
          </span>

          <h2>{dict.work.title}</h2>
          <p className="max-w-md">{dict.work.lead}</p>
        </MotionReveal>

        <MotionLinkCard
          href={featured.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="lab-card-surface group mt-12 flex min-w-0 flex-col gap-5 rounded-lab-lg p-8 outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong sm:p-10"
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="lab-card-kicker">{dict.work.featuredLabel}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-lab-signal">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-lab-signal"
              />
              {dict.work.status[toStatusKey(featured.status)]}
            </span>
          </div>

          <h3 className="text-2xl text-lab-ink transition-colors group-hover:text-lab-signal sm:text-3xl">
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

          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-lab-signal">
            {dict.work.viewProject}
            <span aria-hidden="true">&rarr;</span>
          </span>
        </MotionLinkCard>

        <div className="mt-16">
          <MotionReveal>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
              {dict.work.restTitle}
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
                    className="lab-card-surface group flex h-full min-w-0 flex-col gap-3 rounded-lab-lg p-6 outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
                  >
                    <h4 className="text-lab-ink transition-colors group-hover:text-lab-signal">
                      {content.title}
                    </h4>
                    <p className="flex-1 text-sm">{content.summary}</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-lab-signal">
                      {dict.work.viewProject}
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </MotionLinkCard>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

// projects.ts uses kebab-case ("coming-soon"); dict.work.status uses
// camelCase keys ("comingSoon") to match the rest of the dictionary shape.
function toStatusKey(status: string): "live" | "active" | "comingSoon" | "archived" {
  if (status === "coming-soon") return "comingSoon";
  return status as "live" | "active" | "archived";
}
