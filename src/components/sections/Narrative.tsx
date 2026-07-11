"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { MotionReveal } from "@/components/ui/MotionPrimitives";
import { narrativeStages } from "@/data/narrative";
import { narrativeSignalColors } from "@/lib/narrativeSignals";
import { IntakeSpecimen } from "./narrative/IntakeSpecimen";
import { NarrativeCanvas } from "./narrative/NarrativeCanvas";
import { NarrativeStage } from "./narrative/NarrativeStage";

// Only the Intake stage exists so far (Feature 26). Features 27/28 add
// Architecture/Build/Test/Ship by mapping over the rest of `narrativeStages`
// with their own specimen visuals, reusing NarrativeStage as-is.
const intakeStage = narrativeStages.find((stage) => stage.id === "intake")!;

export function Narrative() {
  const dict = useDictionary();
  const content = dict.narrative.stages.intake;
  const serviceLabels = intakeStage.serviceIds.map(
    (id) => dict.services.items[id].title,
  );

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
          <NarrativeStage
            stage={intakeStage}
            content={content}
            serviceLabels={serviceLabels}
            visual={(progress) => (
              <IntakeSpecimen
                progress={progress}
                color={narrativeSignalColors[intakeStage.signal]}
              />
            )}
          />
        </div>
      </div>

      <NarrativeCanvas />
    </section>
  );
}
