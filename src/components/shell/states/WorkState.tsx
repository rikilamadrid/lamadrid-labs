"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useShell } from "@/components/shell/ShellProvider";
import { ProjectPreview } from "@/components/shell/work/ProjectPreview";
import { WorkField } from "@/components/shell/work/WorkField";
import { projects } from "@/data/projects";
import type { LabProject } from "@/data/projects";
import { useTheme } from "@/lib/theme";

/**
 * Work mode — the home Signal / Noise field reorganizing into an interactive
 * project index, not a separate list page.
 *
 * A split spatial composition: a compact editorial index lower-left, a large
 * living preview center/right, all sitting inside the shared `WorkField` canvas
 * (the same field engine as the hero). Selecting a project (hover, focus, or
 * keyboard) morphs the preview and tints the active row into that project's
 * accent — signal scarcity still holds, the accent lives only on the one active
 * entry and its preview. Opening is a second, explicit action (`Enter`), so a
 * touch tap selects first and never opens by accident.
 */
export function WorkState() {
  const dict = useDictionary();
  const { openProject, activeProject } = useShell();
  const { theme } = useTheme();
  const [selected, setSelected] = useState(0);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Return focus to the row that was entered once its world closes, so a
  // keyboard/AT user comes back exactly where they left off instead of at the
  // top of the document. (ProjectWorld moves focus into the world on open.)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (activeProject) {
      wasOpen.current = true;
    } else if (wasOpen.current) {
      wasOpen.current = false;
      rowRefs.current[selected]?.focus();
    }
  }, [activeProject, selected]);

  const selectedProject = projects[selected];
  const selectedContent = dict.work.projects[selectedProject.id];

  // Per-project accent override (same mechanism as ProjectWorld): retint the
  // canonical --lab-signal* on the active row and the preview only.
  const accentStyle = useMemo<CSSProperties | undefined>(
    () => accentFor(selectedProject, theme),
    [selectedProject, theme],
  );

  // Roving arrow-key navigation between index rows; focus itself selects.
  const onRowKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next =
        event.key === "ArrowDown"
          ? (index + 1) % projects.length
          : (index - 1 + projects.length) % projects.length;
      rowRefs.current[next]?.focus();
    }
  };

  return (
    <section className="relative h-full w-full overflow-y-auto overflow-x-hidden">
      <WorkField className="pointer-events-none absolute inset-0 z-0 h-full w-full" />

      <div className="relative z-10 mx-auto grid min-h-full w-full max-w-6xl grid-cols-1 items-stretch gap-10 px-6 pb-16 pt-24 sm:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:px-14 lg:pb-14 lg:pt-14">
        {/* ── Left: heading + editorial index ── */}
        <div className="flex flex-col justify-between gap-10 lg:h-full lg:max-h-[560px]">
          <header className="flex flex-col gap-3">
            <span className="lab-label">
              <span aria-hidden="true" className="lab-eyebrow-dot" />
              {dict.work.eyebrow}
            </span>
            <h2 className="max-w-sm">{dict.work.title}</h2>
            <p className="max-w-sm text-sm text-lab-muted">
              {dict.work.supporting}
            </p>
          </header>

          <ul className="flex flex-col">
            {projects.map((project, index) => (
              <IndexRow
                key={project.id}
                ref={(node) => {
                  rowRefs.current[index] = node;
                }}
                project={project}
                index={index}
                active={index === selected}
                accentStyle={index === selected ? accentStyle : undefined}
                onSelect={() => setSelected(index)}
                onOpen={() => openProject(project.id)}
                onKeyDown={(event) => onRowKeyDown(event, index)}
              />
            ))}
          </ul>
        </div>

        {/* ── Right: living preview, tinted into the active project's accent ── */}
        <div
          style={accentStyle}
          className="flex items-center justify-center lg:h-full"
        >
          <ProjectPreview projectId={selectedProject.id} />
        </div>

        {/* Mobile: a plain readable statement under the preview so the active
            project always resolves to words on small screens. */}
        <p className="max-w-sm text-sm text-lab-muted lg:hidden" aria-live="polite">
          {selectedContent.world.statement}
        </p>
      </div>
    </section>
  );
}

const IndexRow = ({
  ref,
  project,
  index,
  active,
  accentStyle,
  onSelect,
  onOpen,
  onKeyDown,
}: {
  ref: (node: HTMLButtonElement | null) => void;
  project: LabProject;
  index: number;
  active: boolean;
  accentStyle?: CSSProperties;
  onSelect: () => void;
  onOpen: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}) => {
  const dict = useDictionary();
  const reduce = useReducedMotion();
  const content = dict.work.projects[project.id];

  return (
    <li style={active ? accentStyle : undefined} className="relative">
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        onFocus={onSelect}
        onPointerEnter={(event) => {
          // Only fine pointers pre-select on hover; touch selects on tap so the
          // first tap never doubles as an open.
          if (event.pointerType === "mouse") onSelect();
        }}
        onKeyDown={onKeyDown}
        aria-current={active ? "true" : undefined}
        className="group flex w-full items-baseline gap-4 border-b border-lab-line py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lab-signal-strong"
      >
        <span
          className={`shrink-0 font-mono text-xs tabular-nums transition-colors ${
            active ? "text-lab-signal" : "text-lab-noise-4"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Shared-element source: on Enter this title flies into the project
              world's hero (`layoutId`). Reduced motion opts out (plain cut). */}
          <motion.span
            layoutId={reduce ? undefined : `project-title-${project.id}`}
            className={`[font-family:var(--font-display)] text-2xl leading-tight transition-colors duration-300 sm:text-3xl ${
              active ? "text-lab-ink" : "text-lab-muted group-hover:text-lab-ink"
            }`}
          >
            {content.title}
          </motion.span>
        </span>

        <span
          className={`lab-label shrink-0 self-center transition-colors ${
            active ? "text-lab-signal" : "text-lab-muted"
          }`}
        >
          {dict.work.type[toTypeKey(project.type)]}
        </span>
      </button>

      {/* The one restrained action, shown on the active row. Separately
          focusable, so touch/keyboard get an explicit, unambiguous open. */}
      {active && (
        <button
          type="button"
          onClick={onOpen}
          className="lab-label absolute right-0 top-full z-10 -mt-3 inline-flex items-center gap-1.5 rounded-lab-sm bg-lab-bg px-1.5 text-lab-signal outline-none transition-transform hover:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
        >
          {dict.work.world.enter}
          <span aria-hidden="true">&rarr;</span>
        </button>
      )}
    </li>
  );
};

/** Build the --lab-signal* override for a project, or undefined for canonical. */
function accentFor(
  project: LabProject,
  theme: string,
): CSSProperties | undefined {
  const accent = project.accent;
  if (!accent) return undefined;
  const i = theme === "light" ? 0 : 1;
  return {
    "--lab-signal": accent.signal[i],
    "--lab-signal-strong": accent.strong[i],
    "--lab-signal-ink": accent.ink[i],
  } as CSSProperties;
}

// projects.ts uses kebab-case ("case-study"); dict.work.type uses camelCase.
function toTypeKey(
  type: LabProject["type"],
): "product" | "website" | "experiment" | "caseStudy" {
  if (type === "case-study") return "caseStudy";
  return type;
}
