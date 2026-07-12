import type { Dictionary } from "@/data/i18n";
import { processStages } from "@/data/process";
import { narrativeSignalColors } from "@/lib/narrativeSignals";

interface ProcessStaticFallbackProps {
  dict: Dictionary["process"];
}

// Non-pinned, non-animated fallback for `prefers-reduced-motion` (and a
// starting point for feature 39's mobile layout): the same 5 stages as a
// plain stacked list, no Three.js canvas mounted at all — reduced-motion
// users get the full copy with nothing to skip past.
export function ProcessStaticFallback({ dict }: ProcessStaticFallbackProps) {
  return (
    <ol className="mx-auto mt-12 flex max-w-2xl flex-col gap-6">
      {processStages.map((stage) => {
        const content = dict.stages[stage.id];
        return (
          <li key={stage.id} className="lab-card-surface rounded-lab-lg p-6">
            <span
              aria-hidden="true"
              className="mb-3 inline-block h-2 w-2 rounded-full"
              style={{
                background: narrativeSignalColors[stage.signal],
                boxShadow: `0 0 12px ${narrativeSignalColors[stage.signal]}`,
              }}
            />
            <h3 className="text-lab-ink">{content.title}</h3>
            <p className="mt-1 text-sm">{content.stageLine}</p>
            <p className="mt-2 text-xs text-lab-muted">{content.serviceLine}</p>
          </li>
        );
      })}
    </ol>
  );
}
