"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MotionReveal } from "@/components/ui/MotionPrimitives";
import { narrativeStages } from "@/data/narrative";
import type { NarrativeStageId } from "@/data/narrative";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { ArchitectureSpecimen } from "./narrative/ArchitectureSpecimen";
import { BuildSpecimen } from "./narrative/BuildSpecimen";
import { IntakeSpecimen } from "./narrative/IntakeSpecimen";
import { NarrativeCanvas } from "./narrative/NarrativeCanvas";
import { NarrativeStage } from "./narrative/NarrativeStage";
import { ShipSpecimen } from "./narrative/ShipSpecimen";
import { TestSpecimen } from "./narrative/TestSpecimen";

// All 5 stages (Intake through Ship) now have specimen visuals; the finale
// section (29) picks up where Ship's outward-departing motion leaves off.
const specimensById: Record<NarrativeStageId, typeof IntakeSpecimen> = {
  intake: IntakeSpecimen,
  architecture: ArchitectureSpecimen,
  build: BuildSpecimen,
  test: TestSpecimen,
  ship: ShipSpecimen,
};

const finalStage = narrativeStages[narrativeStages.length - 1];

export function Narrative() {
  const dict = useDictionary();

  return (
    <section id="narrative" className="lab-section">
      <div className="mx-auto max-w-5xl">
        <MotionReveal className="lab-section-header">
          <span className="lab-eyebrow">
            <span aria-hidden="true" className="lab-eyebrow-dot" />
            {dict.narrative.eyebrow}
          </span>

          <h2>{dict.narrative.title}</h2>
          <p className="max-w-md">{dict.narrative.lead}</p>
        </MotionReveal>

        <div className="mt-16">
          {narrativeStages.map((stage, index) => {
            const Specimen = specimensById[stage.id];
            const content = dict.narrative.stages[stage.id];
            const serviceLabels = stage.serviceIds.map(
              (id) => dict.services.items[id].title,
            );

            return (
              <NarrativeStage
                key={stage.id}
                stage={stage}
                content={content}
                serviceLabels={serviceLabels}
                reverse={index % 2 === 1}
                visual={(progress) => (
                  <Specimen
                    progress={progress}
                    color={narrativeSignalColors[stage.signal]}
                  />
                )}
              />
            );
          })}
        </div>

        {/* Ship is the last stage before the finale (29) — this fade signals
            the sequence continues rather than just stopping. */}
        <div
          aria-hidden="true"
          className="mx-auto mt-4 h-24 w-px"
          style={{
            background: `linear-gradient(180deg, ${narrativeSignalColors[finalStage.signal]}, transparent)`,
          }}
        />
      </div>

      <NarrativeCanvas />
    </section>
  );
}
