"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  useDictionary,
  useLocaleContext,
} from "@/components/i18n/LocaleProvider";
import { HeroField } from "@/components/hero/HeroField";
import { useShell } from "@/components/shell/ShellProvider";
import { MotionReveal } from "@/components/ui/MotionPrimitives";
import { projects, type ProjectId } from "@/data/projects";
import { useTheme } from "@/lib/theme";

/**
 * A project's immersive micro-universe.
 *
 * Entering a project doesn't navigate — the shell renders this in place of the
 * field, so the site stays one running application whose world re-forms into
 * the selected project. The hero reuses the pointer-field engine verbatim,
 * rasterizing the *project name* instead of the home headline, so the field
 * literally resolves into the project. A per-project accent overrides
 * `--lab-signal*` on this root only, retinting the resolving field (and every
 * accent below it) into the project's own color — Home and the Work index keep
 * the one canonical signal, so signal scarcity holds outside the world.
 *
 * The world owns its own vertical scroll (a project holds more than one
 * viewport of content); the shell itself never page-scrolls.
 */
export function ProjectWorld({ id }: { id: ProjectId }) {
  const dict = useDictionary();
  const { locale } = useLocaleContext();
  const { closeProject } = useShell();
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // The world hero title travels from the Work index via a shared-element morph
  // (`layoutId`). During that flight the `<h1>` carries an inverse transform, so
  // the field's mask — built by measuring this heading — would rasterize the
  // title at its index-sized starting box. `settled` flips when the morph lands
  // and is folded into `HeroField`'s `localeKey`, which forces one mask rebuild
  // against the final resting box so the field re-forms cleanly on arrival.
  // (Component is keyed by project id upstream, so this resets per project.)
  const [settled, setSettled] = useState(reduce ? true : false);

  const project = projects.find((entry) => entry.id === id);

  // Entering is a mode change, not a navigation, so move focus into the world
  // once it opens — keyboard and screen-reader users land inside the new region
  // (which announces the project) instead of being stranded on the now-inert
  // index behind it. Focusing the container, not a control, avoids a stray
  // focus ring for pointer users. (WorkState returns focus to the row on close.)
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Escape always leaves the world, no matter how far the user has scrolled —
  // the primary "back" affordance sits in the hero, this backs it up.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeProject]);

  // Override the signal tokens for this world only. Picks the light/dark variant
  // off the resolved theme; re-runs when the theme flips (the field re-reads the
  // token on the same data-theme change).
  const accentStyle = useMemo<CSSProperties | undefined>(() => {
    const accent = project?.accent;
    if (!accent) return undefined;
    const i = theme === "light" ? 0 : 1;
    return {
      "--lab-signal": accent.signal[i],
      "--lab-signal-strong": accent.strong[i],
      "--lab-signal-ink": accent.ink[i],
    } as CSSProperties;
  }, [project, theme]);

  if (!project) return null;

  const content = dict.work.projects[id];
  const world = content.world;
  const labels = dict.work.world;

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="region"
      aria-label={content.title}
      style={accentStyle}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-lab-bg outline-none"
    >
      {/* ── Hero: the field resolves the project name in the project's accent ──
          Content is spread top → middle → bottom so it fills the viewport
          instead of floating in the center. The wrappers carry no z-index or
          transform, so the field (z-10) can still sit above the h1 (z-0) while
          the copy (z-20) stays above the field. */}
      <section className="lab-section isolate relative flex min-h-svh flex-col justify-between gap-10 overflow-hidden">
        <HeroField
          headingRef={headingRef}
          localeKey={`${locale}-${id}-${settled}`}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
          <button
            type="button"
            onClick={closeProject}
            className="lab-label relative z-20 inline-flex w-fit items-center gap-1.5 rounded-lab-sm text-lab-muted outline-none transition-colors hover:text-lab-signal focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
          >
            <span aria-hidden="true">&larr;</span>
            {labels.back}
          </button>
          <span className="lab-label relative z-20 text-lab-muted">
            {labels.overview} · {dict.work.type[toTypeKey(project.type)]}
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 text-left">
          {/* Same layering as the home hero: the h1 sits below the canvas so the
              field can rasterize and resolve it; supporting copy stays above. */}
          <h1 ref={headingRef} className="relative z-0 max-w-3xl">
            {/* Shared-element morph target: this line travels from the Work
                index card of the same project (`layoutId`), so the title
                physically flies into place as the field re-forms behind it.
                Reduced motion drops the layout animation (a plain crossfade via
                the stage) and marks the mask settled immediately. */}
            <motion.span
              layoutId={reduce ? undefined : `project-title-${id}`}
              onLayoutAnimationComplete={() => setSettled(true)}
              data-hero-line
              className="block text-lab-noise-4"
            >
              {content.title}
            </motion.span>
          </h1>

          <p className="relative z-20 max-w-2xl text-2xl leading-snug text-lab-ink">
            {world.statement}
          </p>

          {(project.url || project.repositoryUrl) && (
            <div className="relative z-20 mt-1 flex flex-wrap gap-3">
              {project.url && (
                <ExternalAction href={project.url}>
                  {labels.visitLive}
                </ExternalAction>
              )}
              {project.repositoryUrl && (
                <ExternalAction href={project.repositoryUrl} subdued>
                  {labels.viewSource}
                </ExternalAction>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-lab-line pt-5">
          <div className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lab-signal">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lab-signal" />
              {dict.work.status[toStatusKey(project.status)]}
            </span>
            <span aria-hidden="true" className="text-lab-line-strong">·</span>
            <span className="lab-label text-lab-muted">{content.tags.join(" · ")}</span>
          </div>
          <span className="lab-label relative z-20 inline-flex items-center gap-1.5 text-lab-muted">
            {labels.scroll}
            <span aria-hidden="true">&darr;</span>
          </span>
        </div>
      </section>

      {/* ── Below the fold: the project's narrative and details ── */}
      <div className="lab-section mx-auto flex w-full max-w-4xl flex-col gap-16 pb-28">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <NarrativeBlock label={labels.problem} body={world.problem} />
          <NarrativeBlock label={labels.solution} body={world.solution} />
          <NarrativeBlock label={labels.outcome} body={world.outcome} />
        </div>

        <DetailBlock label={labels.tech}>
          <ul className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <li key={tag} className="lab-token">
                {tag}
              </li>
            ))}
          </ul>
        </DetailBlock>

        <DetailBlock label={labels.architecture}>
          <ul className="flex flex-col gap-3">
            {world.architecture.map((line) => (
              <li key={line} className="flex gap-3 text-lab-muted">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lab-signal" />
                <span className="max-w-2xl">{line}</span>
              </li>
            ))}
          </ul>
        </DetailBlock>

        {/* Results are qualitative only — no fabricated metrics (brand rule).
            TODO(ricardo): when real figures exist, add a metrics row here
            (label + value) sourced from project data, distinct from these
            qualitative outcomes. */}
        <DetailBlock label={labels.results}>
          <ul className="flex flex-col gap-3">
            {world.results.map((line) => (
              <li key={line} className="flex gap-3 text-lab-ink">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lab-signal" />
                <span className="max-w-2xl">{line}</span>
              </li>
            ))}
          </ul>
        </DetailBlock>
      </div>
    </div>
  );
}

function NarrativeBlock({ label, body }: { label: string; body: string }) {
  return (
    <MotionReveal className="flex flex-col gap-2">
      <span className="lab-label text-lab-signal">{label}</span>
      <p className="text-lab-muted">{body}</p>
    </MotionReveal>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <MotionReveal className="flex flex-col gap-4">
      {/* A plain display heading — the base `h2` rule (serif, sized, ink) owns
          the look; layered utilities lose to it in this codebase, so we don't
          fight it (same gotcha noted in Hero / PlaceholderState). */}
      <h2>{label}</h2>
      {children}
    </MotionReveal>
  );
}

function ExternalAction({
  href,
  children,
  subdued = false,
}: {
  href: string;
  children: React.ReactNode;
  subdued?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        subdued
          ? "inline-flex items-center gap-1.5 rounded-full border border-lab-line-strong px-5 py-2.5 text-sm font-medium text-lab-ink outline-none transition-colors hover:border-lab-signal hover:text-lab-signal focus-visible:ring-2 focus-visible:ring-lab-signal"
          : "inline-flex items-center gap-1.5 rounded-full bg-lab-signal px-5 py-2.5 text-sm font-semibold text-lab-signal-ink outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
      }
    >
      {children}
      <span aria-hidden="true">&#8599;</span>
    </a>
  );
}

// projects.ts uses kebab-case ("case-study"); dict.work.type uses camelCase.
function toTypeKey(
  type: (typeof projects)[number]["type"],
): "product" | "website" | "experiment" | "caseStudy" {
  if (type === "case-study") return "caseStudy";
  return type;
}

// projects.ts uses kebab-case ("coming-soon"); dict.work.status uses camelCase.
function toStatusKey(
  status: (typeof projects)[number]["status"],
): "live" | "active" | "comingSoon" | "archived" {
  if (status === "coming-soon") return "comingSoon";
  return status;
}
