// English is the source of truth. Its shape defines `Dictionary`, so every
// other locale must provide exactly the same keys (see fr.ts / es.ts).
export const en = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — an independent software studio.",
  },
  nav: {
    process: "Process",
    work: "Work",
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
  process: {
    eyebrow: "How a project moves through the lab",
    title: "One specimen, five stages",
    lead: "Every project runs the same reaction, start to finish.",
    hud: {
      step: "Step",
      readout: "Readout",
    },
    stages: {
      "reagent-selection": {
        title: "Reagent Selection",
        stageLine: "The idea arrives, sorted down to what's worth building.",
        serviceLine: "Discovery and scoping.",
        hud: {
          status: "Stable",
          metrics: [
            { label: "State", value: "Sorted" },
            { label: "Lock", value: "Engaged" },
          ],
        },
      },
      measurement: {
        title: "Measurement",
        stageLine: "Every requirement weighed and the system mapped out.",
        serviceLine: "System design and technical planning.",
        hud: {
          status: "Calibrated",
          metrics: [
            { label: "Scope", value: "Mapped" },
            { label: "Load", value: "Weighed" },
          ],
        },
      },
      synthesis: {
        title: "Synthesis",
        stageLine: "Real code, real components, reacting into a working product.",
        serviceLine: "Implementation and iteration.",
        hud: {
          status: "Reacting",
          metrics: [
            { label: "Build", value: "Active" },
            { label: "Flow", value: "Peak" },
          ],
        },
      },
      purification: {
        title: "Purification",
        stageLine: "Stripped of rough edges — tested, refined, accessible.",
        serviceLine: "QA, accessibility, and performance passes.",
        hud: {
          status: "Refined",
          metrics: [
            { label: "Edges", value: "Removed" },
            { label: "Tests", value: "Passing" },
          ],
        },
      },
      crystallization: {
        title: "Crystallization",
        stageLine: "The final form: deployed, documented, and built to last.",
        serviceLine: "Deployment and handoff.",
        hud: {
          status: "Set",
          metrics: [
            { label: "Form", value: "Final" },
            { label: "Ship", value: "Ready" },
          ],
        },
      },
    },
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
