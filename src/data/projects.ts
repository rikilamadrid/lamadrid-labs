export type ProjectId = "ricardo-os" | "marina-cuesta";

export type ProjectStatus = "live" | "active" | "coming-soon" | "archived";

export type ProjectType = "product" | "website" | "experiment" | "case-study";

export interface LabProject {
  id: ProjectId;
  type: ProjectType;
  status: ProjectStatus;
  url?: string;
  repositoryUrl?: string;
  featured?: boolean;
}

// Translated title/summary/tags live in src/data/i18n/*.ts under work.projects[id].
// Placeholder URLs — swap for final links when available.
export const projects: LabProject[] = [
  {
    id: "ricardo-os",
    type: "product",
    status: "live",
    url: "https://ricardolamadrid.com",
    featured: true,
  },
  {
    id: "marina-cuesta",
    type: "website",
    status: "live",
    url: "https://marinacuesta.com",
    featured: true,
  },
];
