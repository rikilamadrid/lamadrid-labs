export type ProjectId =
  | "ricardo-os"
  | "marina-cuesta"
  | "subrooms"
  | "writer-companion";

export type ProjectStatus = "live" | "active" | "coming-soon" | "archived";

export type ProjectType = "product" | "website" | "experiment" | "case-study";

/**
 * A project's accent identity. When a project world is entered, these override
 * the canonical `--lab-signal*` tokens on the world root only, so the field
 * literally re-forms into the project's own color while Home / the Work index
 * keep the one canonical signal (the signal-scarcity rule holds outside the
 * world). Each channel is `[light, dark]`. Omit to keep the canonical blue.
 */
export interface ProjectAccent {
  signal: [light: string, dark: string];
  strong: [light: string, dark: string];
  /** Foreground on a signal-filled surface. */
  ink: [light: string, dark: string];
}

export interface LabProject {
  id: ProjectId;
  type: ProjectType;
  status: ProjectStatus;
  url?: string;
  repositoryUrl?: string;
  featured?: boolean;
  accent?: ProjectAccent;
}

// Translated title/summary/tags live in src/data/i18n/*.ts under work.projects[id].
export const projects: LabProject[] = [
  {
    id: "ricardo-os",
    type: "product",
    status: "live",
    url: "https://ricardolamadrid.com",
    featured: true,
    // A cool cyan/teal shift off the canonical blue — same cool family, reads
    // "operating system" without leaving the brand's restrained register.
    accent: {
      signal: ["#0f8b98", "#35c9d6"],
      strong: ["#0b6f7a", "#63dbe6"],
      ink: ["#ffffff", "#041014"],
    },
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
