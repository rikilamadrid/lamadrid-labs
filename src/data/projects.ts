export type ProjectStatus = "live" | "active" | "coming-soon" | "archived";

export interface LabProject {
  id: string;
  title: string;
  shortName?: string;
  type: "product" | "website" | "experiment" | "case-study";
  status: ProjectStatus;
  summary: string;
  description?: string;
  tags: string[];
  url?: string;
  repositoryUrl?: string;
  featured?: boolean;
}

// Placeholder URLs — swap for final links when available.
export const projects: LabProject[] = [
  {
    id: "ricardo-os",
    title: "RicardoOS",
    shortName: "RicardoOS",
    type: "product",
    status: "active",
    summary:
      "Ricardo's personal website reimagined as an operating-system-inspired portfolio experience.",
    description:
      "An experimental personal operating system: a playful, tactile interface for exploring Ricardo's work, writing, and experiments.",
    tags: ["Next.js", "React", "Interaction Design", "Personal"],
    url: "https://ricardolamadrid.com",
    featured: true,
  },
  {
    id: "marina-cuesta",
    title: "Marina Cuesta",
    shortName: "Marina Cuesta",
    type: "website",
    status: "live",
    summary:
      "A polished, custom website built for Marina Cuesta — an example of clean design and careful implementation.",
    description:
      "A bespoke website focused on clear typography, calm layout, and production-ready front-end craft.",
    tags: ["Web Design", "Next.js", "Client Work"],
    url: "https://marinacuesta.com",
    featured: true,
  },
];
