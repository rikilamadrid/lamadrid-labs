export type ServiceId =
  | "product-engineering"
  | "design-engineering"
  | "ai-workflow-engineering"
  | "frontend-architecture"
  | "freelance-technical-partner";

export interface LabService {
  id: ServiceId;
}

// Translated title/summary/outcomes live in src/data/i18n/*.ts under services.items[id].
export const services: LabService[] = [
  { id: "product-engineering" },
  { id: "design-engineering" },
  { id: "ai-workflow-engineering" },
  { id: "frontend-architecture" },
  { id: "freelance-technical-partner" },
];
