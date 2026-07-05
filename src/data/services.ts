export interface LabService {
  id: string;
  title: string;
  summary: string;
  outcomes: string[];
}

export const services: LabService[] = [
  {
    id: "product-engineering",
    title: "Product Engineering",
    summary: "Turning ideas into clean, usable web products.",
    outcomes: [
      "Ship a working product, not just a prototype",
      "Clear scope and a fast path to launch",
      "Maintainable code you can build on",
    ],
  },
  {
    id: "design-engineering",
    title: "Design Engineering",
    summary: "Polished interfaces, interaction details, and production-ready UI.",
    outcomes: [
      "Pixel-considered, accessible interfaces",
      "Thoughtful motion and interaction detail",
      "A cohesive design system, not one-off screens",
    ],
  },
  {
    id: "ai-workflow-engineering",
    title: "AI Workflow Engineering",
    summary:
      "Practical automations, LLM workflows, agentic prototypes, and API integrations.",
    outcomes: [
      "Automations that remove real busywork",
      "LLM and agent workflows wired into your tools",
      "Pragmatic AI features, not buzzword demos",
    ],
  },
  {
    id: "frontend-architecture",
    title: "Frontend Architecture",
    summary:
      "Scalable React/Next.js systems, design systems, performance, accessibility, and maintainability.",
    outcomes: [
      "Architecture that scales with the team",
      "Strong performance and accessibility baselines",
      "Code that stays clean as it grows",
    ],
  },
  {
    id: "freelance-technical-partner",
    title: "Freelance Technical Partner",
    summary:
      "Senior engineering support for founders, creators, and small teams.",
    outcomes: [
      "A senior partner who ships with you",
      "Product judgment alongside the code",
      "Flexible support without the agency overhead",
    ],
  },
];
