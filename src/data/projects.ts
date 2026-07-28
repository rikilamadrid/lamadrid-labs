export type ProjectId =
  | "ricardo-os"
  | "marina-cuesta"
  | "subrooms"
  | "writer-companion";

export type ProjectStatus = "live" | "active" | "coming-soon" | "archived";

export type ProjectType = "product" | "website" | "experiment" | "case-study";

/**
 * A project's accent identity. A project world overrides the canonical
 * `--lab-signal*` tokens on its root, so the field literally re-forms into the
 * project's own color; the Work index applies the same override to its active
 * row, preview, and resolved field band, so each project reads as its own
 * memorable color before it is even entered. Home keeps the one canonical
 * signal. Each channel is `[light, dark]`. Omit to keep the canonical blue.
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
    // A cool cyan/teal shift off the canonical blue: same cool family, reads
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
    // A warm magenta, the furthest hue from the canonical blue: an editorial,
    // personal-brand feel distinct from the two product accents.
    accent: {
      signal: ["#ab21a7", "#f288ee"],
      strong: ["#7c1879", "#f7b6f5"],
      ink: ["#ffffff", "#170316"],
    },
  },
  {
    id: "subrooms",
    type: "product",
    status: "live",
    url: "https://youtube-rooms.vercel.app/",
    // Amber, the warm complement to ricardo-os's teal.
    accent: {
      signal: ["#a76b11", "#f3ab3f"],
      strong: ["#794d0c", "#f6c06f"],
      ink: ["#ffffff", "#130a01"],
    },
  },
  {
    id: "writer-companion",
    type: "product",
    status: "live",
    url: "https://story-momentum.vercel.app/",
    // A rose red, distinct from the other three and from the canonical blue.
    accent: {
      signal: ["#bf223c", "#f17489"],
      strong: ["#8f192d", "#f6a2b0"],
      ink: ["#ffffff", "#160308"],
    },
  },
];
