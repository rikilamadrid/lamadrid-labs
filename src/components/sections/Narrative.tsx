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

// Intake, Architecture, and Build stages ship in Features 26/27. Feature 28
// adds Test/Ship by extending this list with their own specimen visuals,
// reusing NarrativeStage as-is.
const specimensById: Record<
  NarrativeStageId,
  (typeof IntakeSpecimen) | undefined
> = {
  intake: IntakeSpecimen,
  architecture: ArchitectureSpecimen,
  build: BuildSpecimen,
  test: undefined,
  ship: undefined,
};

const activeStages = narrativeStages.filter(
  (stage) => specimensById[stage.id] !== undefined,
);

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
          {activeStages.map((stage, index) => {
            const Specimen = specimensById[stage.id]!;
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
      </div>

      <NarrativeCanvas />
    </section>
  );
}
