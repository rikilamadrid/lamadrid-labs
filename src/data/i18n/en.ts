// English is the source of truth. Its shape defines `Dictionary`, so every
// other locale must provide exactly the same keys (see fr.ts / es.ts).
export const en = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — an independent software studio.",
  },
  nav: {
    work: "Work",
    about: "About",
    contact: "Contact",
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    eyebrow: "Independent software studio",
    // Rendered as emerging letterforms — the pointer field resolves these
    // lines out of noise. One entry per display line.
    titleLines: ["Noise becomes", "structure."],
    lead: "Lamadrid Labs turns scattered requirements and half-formed ideas into clear systems and shipped software.",
    ctaPrimary: "See the work",
  },
  work: {
    eyebrow: "Selected work",
    title: "From the lab",
    lead: "A working sample of what's shipped — real projects, real users.",
    featuredLabel: "Featured",
    restTitle: "More from the lab",
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
      subrooms: {
        title: "SubRooms",
        summary:
          "A YouTube subscription organizer that turns a noisy feed into focused viewing rooms like Coding, Cooking, and Music.",
        tags: ["React", "TypeScript", "Design System", "Vercel"],
      },
      "writer-companion": {
        title: "Writer Companion",
        summary:
          "A focused writing-coach app that turns a story idea into daily writing momentum with guided tasks and feedback.",
        tags: ["Next.js", "TypeScript", "AI", "Vercel"],
      },
    },
  },
  about: {
    eyebrow: "About",
    title: "The person behind the lab",
    lead: "Lamadrid Labs is one person, working like a small studio.",
    paragraphs: [
      "Ricardo Lamadrid is a software engineer who builds products end to end — from interface details to the systems underneath them. Lamadrid Labs is where that work lives: personal projects, client work, and the occasional experiment that doesn't fit anywhere else.",
      "The throughline is care. Every project gets the same attention to craft, whether it's a personal tool or a client's product — clean code, thoughtful design, and software that feels considered rather than assembled.",
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Have a project in mind?",
    lead: "Reach out directly — no forms, no back-and-forth.",
    cta: "Email hello@lamadridlabs.com",
  },
  footer: {
    rights: "All rights reserved.",
  },
  language: {
    label: "Language",
  },
};

export type Dictionary = typeof en;
