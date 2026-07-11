export type ProjectId =
  | "ricardo-os"
  | "marina-cuesta"
  | "subrooms"
  | "writer-companion";

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
  {
    id: "subrooms",
    type: "product",
    status: "live",
    url: "https://youtube-rooms.vercel.app/",
  },
  {
    id: "writer-companion",
    type: "product",
    status: "live",
    url: "https://story-momentum.vercel.app/",
  },
];
