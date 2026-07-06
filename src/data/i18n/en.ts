// English is the source of truth. Its shape defines `Dictionary`, so every
// other locale must provide exactly the same keys (see fr.ts / es.ts).
export const en = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — an independent software studio.",
  },
  nav: {
    work: "Work",
    services: "Services",
    about: "About",
    contact: "Contact",
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    eyebrow: "Independent software laboratory",
    titleFirst: "Ideas enter.",
    titleHighlight: "Software",
    titleAfter: " leaves.",
    titleBefore: "",
    lead: "Lamadrid Labs is the clean, focused home for the products, experiments, and client work built by Ricardo Lamadrid.",
    ctaPrimary: "See the work",
    ctaSecondary: "What we build",
  },
  work: {
    eyebrow: "Selected work",
    title: "From the lab",
    lead: "A working sample of what's shipped — real projects, real users.",
    viewProject: "View project",
    status: {
      live: "Live",
      active: "In progress",
      comingSoon: "Coming soon",
      archived: "Archived",
    },
    type: {
      product: "Product",
      website: "Website",
      experiment: "Experiment",
      caseStudy: "Case study",
    },
    projects: {
      "ricardo-os": {
        title: "RicardoOS",
        summary:
          "Ricardo's personal website reimagined as an operating-system-inspired portfolio experience.",
        tags: ["Next.js", "React", "Interaction Design", "Personal"],
      },
      "marina-cuesta": {
        title: "Marina Cuesta",
        summary:
          "A polished, custom website built for Marina Cuesta — an example of clean design and careful implementation.",
        tags: ["Web Design", "Next.js", "Client Work"],
      },
    },
  },
  footer: {
    rights: "All rights reserved.",
  },
  language: {
    label: "Language",
  },
};

export type Dictionary = typeof en;
