import type { ServiceId } from "./services";

export type NarrativeStageId =
  | "intake"
  | "architecture"
  | "build"
  | "test"
  | "ship";

// Abstract tokens for the visual rebuild (26+) to map onto real CSS custom
// properties — no hex values committed here, this feature is content-only.
export type NarrativeSignal = "cyan" | "violet" | "amber" | "rose" | "teal";

export interface NarrativeStage {
  id: NarrativeStageId;
  index: number;
  signal: NarrativeSignal;
  serviceIds: ServiceId[];
}

// Translated kicker/title/description/detail live in src/data/i18n/*.ts under narrative.stages[id].
export const narrativeStages: NarrativeStage[] = [
  {
    id: "intake",
    index: 0,
    signal: "cyan",
    serviceIds: ["freelance-technical-partner", "product-engineering"],
  },
  {
    id: "architecture",
    index: 1,
    signal: "violet",
    serviceIds: ["frontend-architecture", "product-engineering"],
  },
  {
    id: "build",
    index: 2,
    signal: "amber",
    serviceIds: [
      "product-engineering",
      "design-engineering",
      "ai-workflow-engineering",
    ],
  },
  {
    id: "test",
    index: 3,
    signal: "rose",
    serviceIds: ["frontend-architecture", "design-engineering"],
  },
  {
    id: "ship",
    index: 4,
    signal: "teal",
    serviceIds: ["product-engineering", "freelance-technical-partner"],
  },
];
