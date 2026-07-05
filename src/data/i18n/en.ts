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
  footer: {
    rights: "All rights reserved.",
  },
  language: {
    label: "Language",
  },
};

export type Dictionary = typeof en;
