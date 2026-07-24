"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { usePrefersReducedMotion } from "@/components/ui/MotionPrimitives";
import { DURATION, EASE } from "@/lib/motion";
import type { ProjectId } from "@/data/projects";

/**
 * The living preview for the selected project — semantic DOM/SVG layered above
 * the shared `WorkField` canvas.
 *
 * Each project has its own abstract interface system, built from its real
 * concept rather than a fake screenshot: fragments that assemble into a legible
 * composition when the project is selected, and dissolve back toward the field
 * when another is chosen (`AnimatePresence` keyed on the id). The compositions
 * share the field's timing and easing (`EASE.resolve`) so DOM motion and canvas
 * motion read as one universe. The accent is inherited from the enclosing
 * `--lab-signal*` override, so each preview carries its project's color.
 *
 * The whole preview is a single labelled image to assistive tech — the index
 * beside it already carries the readable name, tags, and premise, so the
 * fragments here are illustrative, not content to be read out piece by piece.
 */
export function ProjectPreview({ projectId }: { projectId: ProjectId }) {
  const dict = useDictionary();
  const reduce = usePrefersReducedMotion();
  const content = dict.work.projects[projectId];

  return (
    <div
      role="img"
      aria-label={content.world.statement}
      className="pointer-events-none relative aspect-[4/3] w-full max-w-xl select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={projectId}
          className="absolute inset-0"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: reduce ? 0 : DURATION.base,
            ease: EASE.resolve,
          }}
        >
          <Composition projectId={projectId} reduce={reduce} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Composition({
  projectId,
  reduce,
}: {
  projectId: ProjectId;
  reduce: boolean;
}) {
  switch (projectId) {
    case "ricardo-os":
      return <RicardoOsPreview reduce={reduce} />;
    case "marina-cuesta":
      return <MarinaPreview reduce={reduce} />;
    case "subrooms":
      return <SubRoomsPreview reduce={reduce} />;
    case "writer-companion":
      return <WriterPreview reduce={reduce} />;
  }
}

/* Shared assembly transition: fragments settle in with a small stagger on the
   field's signature curve (quick departure, long settle). Each child sets its
   own `custom` delay index. */
function assemble(reduce: boolean, i: number) {
  return {
    initial: reduce ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: reduce ? 0 : DURATION.slow,
      ease: EASE.resolve,
      delay: reduce ? 0 : 0.05 * i,
    },
  };
}

const panelClass =
  "rounded-lab-md border border-lab-line bg-lab-surface backdrop-blur-sm";

/* ── RicardoOS — OS windows reorganizing into a coherent desktop ──────────── */

function RicardoOsPreview({ reduce }: { reduce: boolean }) {
  return (
    <div className="absolute inset-0">
      {/* connective system lines from a central signal to each window */}
      <ConnectLines
        from={[50, 52]}
        to={[
          [26, 30],
          [72, 26],
          [70, 70],
        ]}
      />

      <Window reduce={reduce} i={0} style={{ left: "8%", top: "12%", width: "40%" }} lines={3} />
      <Window reduce={reduce} i={1} style={{ left: "52%", top: "8%", width: "40%" }} lines={2} />
      <Window reduce={reduce} i={2} style={{ left: "48%", top: "50%", width: "44%" }} lines={4} />

      {/* command fragment */}
      <motion.div
        {...assemble(reduce, 3)}
        className="absolute bottom-[6%] left-[8%] flex w-[46%] items-center gap-2 rounded-lab-sm border border-lab-line bg-lab-surface px-2.5 py-1.5 font-mono text-[0.62rem] text-lab-muted"
      >
        <span className="text-lab-signal">&rsaquo;_</span>
        <span className="truncate">open ~/ricardo-os</span>
      </motion.div>

      {/* dock */}
      <motion.div
        {...assemble(reduce, 4)}
        className="absolute bottom-[6%] right-[8%] flex items-center gap-1.5 rounded-full border border-lab-line bg-lab-surface px-2.5 py-1.5"
      >
        {[0, 1, 2].map((d) => (
          <span key={d} className="h-2 w-2 rounded-[3px] bg-lab-noise-4" />
        ))}
        <span className="h-2 w-2 rounded-[3px] bg-lab-signal" />
      </motion.div>
    </div>
  );
}

function Window({
  reduce,
  i,
  style,
  lines,
}: {
  reduce: boolean;
  i: number;
  style: React.CSSProperties;
  lines: number;
}) {
  return (
    <motion.div
      {...assemble(reduce, i)}
      style={style}
      className={`absolute ${panelClass} overflow-hidden`}
    >
      <div className="flex items-center gap-1 border-b border-lab-line px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-lab-noise-3" />
        <span className="h-1.5 w-1.5 rounded-full bg-lab-noise-3" />
        <span className="h-1.5 w-1.5 rounded-full bg-lab-signal" />
      </div>
      <div className="flex flex-col gap-1.5 p-2.5">
        {Array.from({ length: lines }).map((_, l) => (
          <span
            key={l}
            className="h-1.5 rounded-full bg-lab-noise-2"
            style={{ width: `${88 - l * 16}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Marina Cuesta — refined editorial typography, calm composition ───────── */

function MarinaPreview({ reduce }: { reduce: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center">
      <motion.div
        {...assemble(reduce, 0)}
        className={`${panelClass} mx-auto flex aspect-[3/4] h-[86%] flex-col justify-between p-5`}
      >
        <div className="flex flex-col gap-2">
          <span className="lab-label text-lab-muted">Portfolio</span>
          <span className="[font-family:var(--font-display)] text-2xl leading-tight text-lab-ink">
            Marina
            <br />
            Cuesta
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {[92, 80, 86, 64].map((w, l) => (
            <motion.span
              key={l}
              {...assemble(reduce, 1 + l)}
              className="h-1.5 rounded-full bg-lab-noise-2"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="h-px w-12 bg-lab-signal" />
      </motion.div>
    </div>
  );
}

/* ── SubRooms — scattered thumbnails organizing into focused rooms ────────── */

function SubRoomsPreview({ reduce }: { reduce: boolean }) {
  const rooms = ["Coding", "Cooking", "Music"];
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="grid w-full grid-cols-3 gap-3">
        {rooms.map((room, r) => (
          <motion.div
            key={room}
            {...assemble(reduce, r)}
            className={`${panelClass} flex flex-col gap-2 p-2.5`}
          >
            <span className="lab-label text-[0.6rem] text-lab-muted">{room}</span>
            <div className="flex flex-col gap-1.5">
              {[0, 1, 2].map((t) => (
                <span
                  key={t}
                  className="aspect-video w-full rounded-[4px] bg-lab-noise-2"
                  style={t === 0 ? { background: "var(--lab-signal)", opacity: 0.7 } : undefined}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Writer Companion — loose notes aligning into a writing path ──────────── */

function WriterPreview({ reduce }: { reduce: boolean }) {
  const steps = [72, 88, 60, 80];
  return (
    <div className="absolute inset-0 flex items-center">
      <div className="relative mx-auto flex w-[70%] flex-col gap-3">
        {/* the path spine */}
        <span className="absolute bottom-2 left-[7px] top-2 w-px bg-lab-line-strong" />
        {steps.map((w, s) => (
          <motion.div
            key={s}
            {...assemble(reduce, s)}
            className="relative flex items-center gap-3"
          >
            <span
              className={`z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                s === 1
                  ? "border-lab-signal bg-lab-signal"
                  : "border-lab-line-strong bg-lab-bg"
              }`}
            />
            <span
              className={`h-8 flex-1 rounded-lab-sm border border-lab-line bg-lab-surface`}
              style={{ maxWidth: `${w}%` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Connective lines (SVG) — signal threads from a node to its fragments ─── */

function ConnectLines({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number][];
}) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {to.map(([x, y], i) => (
        <line
          key={i}
          x1={from[0]}
          y1={from[1]}
          x2={x}
          y2={y}
          stroke="var(--lab-signal)"
          strokeWidth={0.3}
          strokeOpacity={0.35}
        />
      ))}
      <circle cx={from[0]} cy={from[1]} r={0.9} fill="var(--lab-signal)" />
    </svg>
  );
}
