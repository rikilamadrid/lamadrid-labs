import type { Dictionary } from "@/data/i18n";
import { processStages } from "@/data/process";
import { MobileProcessCanvas } from "./MobileProcessCanvas";
import { MobileProcessStage } from "./MobileProcessStage";

interface MobileProcessStackProps {
  dict: Dictionary["process"];
}

// Below `lg`, the same 5 chemistry stages as a vertical stack — each stage
// scrubs its own orb/rig into view independently instead of sharing 38's
// pinned horizontal track. Mounted only when the viewport is below the
// desktop breakpoint, so the pin's ScrollTrigger never gets created here.
export function MobileProcessStack({ dict }: MobileProcessStackProps) {
  return (
    <div className="lab-section">
      <div className="lab-section-header">
        <span className="lab-eyebrow">
          <span aria-hidden="true" className="lab-eyebrow-dot" />
          {dict.eyebrow}
        </span>
        <h2>{dict.title}</h2>
        <p className="max-w-md">{dict.lead}</p>
      </div>

      <div className="mx-auto mt-12 max-w-md">
        {processStages.map((stage) => (
          <MobileProcessStage key={stage.id} stage={stage} content={dict.stages[stage.id]} />
        ))}
      </div>

      <MobileProcessCanvas />
    </div>
  );
}
