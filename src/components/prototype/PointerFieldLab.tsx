"use client";

import { useCallback, useRef, useState } from "react";
import { PointerField } from "@/components/prototype/PointerField";
import { DEFAULT_TUNING, type FieldTuning } from "@/lib/pointer-field";

/**
 * Throwaway tuning harness for the pointer field (Feature 3).
 *
 * This component is deleted when Feature 4 lands. Its only job is to let the
 * field's constants be found by looking rather than by editing and rebuilding
 * — the tuned values in `DEFAULT_TUNING` are the deliverable, not this panel.
 *
 * Deliberately plain: no new dependency, no design work, no i18n.
 */

type Control = {
  key: keyof FieldTuning;
  label: string;
  min: number;
  max: number;
  step: number;
};

const CONTROLS: readonly Control[] = [
  { key: "spacing", label: "Spacing", min: 14, max: 80, step: 1 },
  { key: "maxFragments", label: "Max fragments", min: 200, max: 4000, step: 50 },
  { key: "jitter", label: "Jitter", min: 0, max: 1, step: 0.05 },
  { key: "radius", label: "Radius", min: 60, max: 500, step: 5 },
  { key: "falloff", label: "Falloff", min: 0.5, max: 6, step: 0.1 },
  { key: "settle", label: "Settle (s)", min: 0.05, max: 2, step: 0.01 },
  { key: "decay", label: "Decay (s)", min: 0.05, max: 3, step: 0.01 },
  { key: "lengthNoise", label: "Length · noise", min: 1, max: 30, step: 0.5 },
  { key: "lengthSignal", label: "Length · signal", min: 1, max: 60, step: 0.5 },
  { key: "widthNoise", label: "Width · noise", min: 0.5, max: 4, step: 0.1 },
  { key: "widthSignal", label: "Width · signal", min: 0.5, max: 6, step: 0.1 },
  { key: "opacityNoise", label: "Opacity · noise", min: 0, max: 1, step: 0.02 },
  { key: "opacitySignal", label: "Opacity · signal", min: 0, max: 1, step: 0.02 },
  { key: "alignment", label: "Alignment (rad)", min: -1.6, max: 1.6, step: 0.02 },
];

/** Frames averaged for the fps readout. A per-frame number is unreadable. */
const FPS_WINDOW = 30;

export function PointerFieldLab() {
  const [tuning, setTuning] = useState<FieldTuning>(DEFAULT_TUNING);
  // Closed by default at every size: the panel covers most of a 390px
  // viewport, and the field is the thing being judged.
  const [panelOpen, setPanelOpen] = useState(false);
  const [readout, setReadout] = useState({ fps: 0, fragments: 0 });

  const samples = useRef<number[]>([]);

  const handleFrame = useCallback((fps: number, fragments: number) => {
    const recent = samples.current;
    recent.push(fps);
    if (recent.length < FPS_WINDOW) return;

    const mean =
      recent.reduce((total, value) => total + value, 0) / recent.length;
    recent.length = 0;
    setReadout({ fps: Math.round(mean), fragments });
  }, []);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-lab-bg">
      <PointerField
        tuning={tuning}
        onFrame={handleFrame}
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none relative z-10 flex min-h-dvh flex-col justify-between p-6 sm:p-10">
        <header className="max-w-md">
          <p className="font-mono text-lab-label uppercase tracking-[0.08em] text-lab-muted">
            Prototype · Feature 3
          </p>
          <h1 className="mt-3 font-display text-lab-h2 text-lab-ink">
            Pointer field
          </h1>
          <p className="mt-3 text-lab-body text-lab-muted">
            Move the pointer. Noise becomes structure, then lets go.
          </p>
        </header>

        <div className="pointer-events-auto flex flex-wrap items-end gap-3">
          <output className="rounded-lab-sm border border-lab-line bg-lab-surface px-3 py-2 font-mono text-lab-label uppercase tracking-[0.08em] text-lab-muted backdrop-blur">
            {readout.fps} fps · {readout.fragments} fragments
          </output>

          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            className="rounded-lab-sm border border-lab-line bg-lab-surface px-3 py-2 font-mono text-lab-label uppercase tracking-[0.08em] text-lab-ink backdrop-blur"
          >
            {panelOpen ? "Hide tuning" : "Show tuning"}
          </button>

          <button
            type="button"
            onClick={() => setTuning(DEFAULT_TUNING)}
            className="rounded-lab-sm border border-lab-line bg-lab-surface px-3 py-2 font-mono text-lab-label uppercase tracking-[0.08em] text-lab-muted backdrop-blur"
          >
            Reset
          </button>
        </div>
      </div>

      {panelOpen ? (
        <aside className="absolute right-4 top-4 z-20 max-h-[80dvh] w-64 overflow-y-auto rounded-lab-md border border-lab-line bg-lab-surface p-4 backdrop-blur">
          <p className="font-mono text-lab-label uppercase tracking-[0.08em] text-lab-muted">
            Tuning
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {CONTROLS.map((control) => (
              <label key={control.key} className="block">
                <span className="flex items-baseline justify-between font-mono text-lab-label text-lab-muted">
                  {control.label}
                  <span className="text-lab-ink">{tuning[control.key]}</span>
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={tuning[control.key]}
                  onChange={(event) =>
                    setTuning((current) => ({
                      ...current,
                      [control.key]: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full accent-lab-signal"
                />
              </label>
            ))}
          </div>

          <pre className="mt-4 overflow-x-auto rounded-lab-sm border border-lab-line p-2 font-mono text-[10px] leading-relaxed text-lab-muted">
            {JSON.stringify(tuning, null, 2)}
          </pre>
        </aside>
      ) : null}
    </div>
  );
}
