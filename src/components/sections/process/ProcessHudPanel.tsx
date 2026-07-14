import type { CSSProperties } from "react";
import type { Dictionary } from "@/data/i18n";
import type { ProcessStage } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";

type StageContent = Dictionary["process"]["stages"][ProcessStage["id"]];

interface ProcessHudPanelProps {
  stage: ProcessStage;
  content: StageContent;
  /** Shared HUD labels ("Step", "Readout") from dict.process.hud. */
  labels: Dictionary["process"]["hud"];
  className?: string;
}

const SPARK_WIDTH = 88;
const SPARK_HEIGHT = 24;

// Build a deterministic SVG polyline path from the stage's illustrative
// sparkline samples — decorative, never live data.
function sparklinePath(samples: number[]): string {
  const max = Math.max(samples.length - 1, 1);
  return samples
    .map((value, i) => {
      const x = (i / max) * SPARK_WIDTH;
      // 10% vertical padding so peaks/troughs don't clip the viewBox.
      const y = SPARK_HEIGHT - (0.1 + value * 0.8) * SPARK_HEIGHT;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// The holographic HUD readout panel (47): a glass overlay rendered as DOM/CSS
// (not baked into WebGL) so its text stays crisp, translatable, selectable,
// and theme-token-driven. Layered over the canvas by ProcessScrollRig /
// MobileProcessStage and crossfaded per stage. Presentational and stateless —
// all colors flow from the stage `signal` token via `--stage-signal`; the scan
// shimmer is CSS and self-disables under `prefers-reduced-motion`.
export function ProcessHudPanel({
  stage,
  content,
  labels,
  className,
}: ProcessHudPanelProps) {
  const accentColor = narrativeSignalColors[stage.signal];
  const stepNumber = String(stage.index + 1).padStart(2, "0");

  return (
    <div
      className={`lab-hud rounded-lab-lg p-5 ${className ?? ""}`}
      style={{ "--stage-signal": accentColor } as CSSProperties}
    >
      <span aria-hidden="true" className="lab-hud-corner lab-hud-corner-tl" />
      <span aria-hidden="true" className="lab-hud-corner lab-hud-corner-tr" />
      <span aria-hidden="true" className="lab-hud-corner lab-hud-corner-bl" />
      <span aria-hidden="true" className="lab-hud-corner lab-hud-corner-br" />
      <span aria-hidden="true" className="lab-hud-scan" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 border-b border-lab-line pb-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-lab-muted">
            {labels.step} {stepNumber}
          </span>
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em]"
            style={{ color: "var(--stage-signal)" }}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "var(--stage-signal)",
                boxShadow: "0 0 8px var(--stage-signal)",
              }}
            />
            {content.hud.status}
          </span>
        </div>

        <h3
          className="font-mono text-sm uppercase tracking-[0.14em] text-lab-ink"
          style={{ textShadow: "0 0 18px color-mix(in srgb, var(--stage-signal) 40%, transparent)" }}
        >
          {content.title}
        </h3>
        <p className="text-sm text-lab-ink/90">{content.stageLine}</p>

        <dl className="mt-1 flex flex-col gap-1.5">
          {content.hud.metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-baseline justify-between gap-3 font-mono text-xs"
            >
              <dt className="uppercase tracking-[0.14em] text-lab-muted">
                {metric.label}
              </dt>
              <dd className="text-lab-ink">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-1 flex items-end justify-between gap-3 border-t border-lab-line pt-3">
          <p className="text-xs text-lab-muted">{content.serviceLine}</p>
          <svg
            aria-hidden="true"
            className="shrink-0"
            width={SPARK_WIDTH}
            height={SPARK_HEIGHT}
            viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
            fill="none"
            role="presentation"
          >
            <title>{labels.readout}</title>
            <path
              d={sparklinePath(stage.hud.sparkline)}
              stroke="var(--stage-signal)"
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 3px var(--stage-signal))" }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
