"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import {
  MotionLinkCard,
  MotionReveal,
} from "@/components/ui/MotionPrimitives";
import { projects, type ProjectStatus, type ProjectType } from "@/data/projects";

const STATUS_DICT_KEY: Record<
  ProjectStatus,
  "live" | "active" | "comingSoon" | "archived"
> = {
  live: "live",
  active: "active",
  "coming-soon": "comingSoon",
  archived: "archived",
};

const TYPE_DICT_KEY: Record<
  ProjectType,
  "product" | "website" | "experiment" | "caseStudy"
> = {
  product: "product",
  website: "website",
  experiment: "experiment",
  "case-study": "caseStudy",
};

export function WorkShowcase() {
  const dict = useDictionary();

  return (
    <section id="work" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-lab-line bg-lab-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lab-muted sm:text-xs">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-lab-accent shadow-lab-glow"
            />
            {dict.work.eyebrow}
          </span>

          <h2>{dict.work.title}</h2>
          <p className="max-w-md">{dict.work.lead}</p>
        </MotionReveal>

        <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {projects.map((project, index) => {
            const content = dict.work.projects[project.id];

            return (
              <li key={project.id}>
                <MotionLinkCard
                  href={project.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  delay={index * 0.08}
                  className="lab-glass group flex h-full flex-col gap-4 rounded-lab-lg p-8 outline-none focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-lab-muted">
                      {dict.work.type[TYPE_DICT_KEY[project.type]]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-lab-accent">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-lab-accent"
                      />
                      {dict.work.status[STATUS_DICT_KEY[project.status]]}
                    </span>
                  </div>

                  <h3 className="text-lab-ink transition-colors group-hover:text-lab-accent">
                    {content.title}
                  </h3>

                  <p className="flex-1">{content.summary}</p>

                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-lab-line px-2.5 py-1 text-[11px] text-lab-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-lab-accent">
                    {dict.work.viewProject}
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </MotionLinkCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
