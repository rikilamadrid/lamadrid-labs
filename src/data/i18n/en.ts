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
  narrative: {
    eyebrow: "How a project moves through the lab",
    title: "Five stages, one specimen",
    lead: "Every project passes through the same process, start to finish.",
    stages: {
      intake: {
        kicker: "01 — Intake",
        title: "The idea arrives",
        description:
          "A rough idea, a business problem, or an ambitious question comes in. I sit with it long enough to understand what's actually being asked for — not just what's asked.",
        detail: "Discovery, scoping, and a clear brief worth building against.",
      },
      architecture: {
        kicker: "02 — Architecture",
        title: "Under the microscope",
        description:
          "Before anything gets built, it gets designed. Data models, system boundaries, and the tradeoffs that make software easy to change later instead of hard.",
        detail:
          "System design, technical planning, and a blueprint that won't collapse under real use.",
      },
      build: {
        kicker: "03 — Build",
        title: "The lab gets loud",
        description:
          "This is where the code happens — real components, real logic, real edge cases. Steady, deliberate progress instead of a mad dash to something that merely compiles.",
        detail:
          "Implementation, iteration, and a product that's actually usable at each step.",
      },
      test: {
        kicker: "04 — Test",
        title: "Stress the specimen",
        description:
          "Software that hasn't been tested is just a hypothesis. This stage pokes at it — accessibility, performance, edge cases — until it holds up under real conditions.",
        detail: "QA, accessibility passes, and performance checks before anything ships.",
      },
      ship: {
        kicker: "05 — Ship",
        title: "Release into the wild",
        description:
          "The specimen leaves the lab. Deployed, documented, and handed off — ready to do its job without anyone standing over it.",
        detail: "Deployment, handoff, and the quiet confidence that it'll keep working.",
      },
    },
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
  finale: {
    eyebrow: "The payoff",
    title: "Proof it works",
    lead: "The process above isn't theory. RicardoOS ran through every stage — intake to ship — and it's live.",
    featuredLabel: "In production",
    featuredCta: "Open RicardoOS",
    restTitle: "The rest of the specimens",
    restCta: "Visit",
    contactTitle: "Have something worth building?",
    contactLead:
      "Bring the idea. I'll take it from intake to ship — no forms, just a conversation.",
    contactCta: "Email hello@lamadridlabs.com",
  },
  services: {
    eyebrow: "How we work together",
    title: "Services",
    lead: "Focused ways to work with the lab, from a single feature to ongoing support.",
    items: {
      "product-engineering": {
        title: "Product Engineering",
        summary: "Turning ideas into clean, usable web products.",
        outcomes: [
          "Ship a working product, not just a prototype",
          "Clear scope and a fast path to launch",
          "Maintainable code you can build on",
        ],
      },
      "design-engineering": {
        title: "Design Engineering",
        summary:
          "Polished interfaces, interaction details, and production-ready UI.",
        outcomes: [
          "Pixel-considered, accessible interfaces",
          "Thoughtful motion and interaction detail",
          "A cohesive design system, not one-off screens",
        ],
      },
      "ai-workflow-engineering": {
        title: "AI Workflow Engineering",
        summary:
          "Practical automations, LLM workflows, agentic prototypes, and API integrations.",
        outcomes: [
          "Automations that remove real busywork",
          "LLM and agent workflows wired into your tools",
          "Pragmatic AI features, not buzzword demos",
        ],
      },
      "frontend-architecture": {
        title: "Frontend Architecture",
        summary:
          "Scalable React/Next.js systems, design systems, performance, accessibility, and maintainability.",
        outcomes: [
          "Architecture that scales with the team",
          "Strong performance and accessibility baselines",
          "Code that stays clean as it grows",
        ],
      },
      "freelance-technical-partner": {
        title: "Freelance Technical Partner",
        summary:
          "Senior engineering support for founders, creators, and small teams.",
        outcomes: [
          "A senior partner who ships with you",
          "Product judgment alongside the code",
          "Flexible support without the agency overhead",
        ],
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
