// English is the source of truth. Its shape defines `Dictionary`, so every
// other locale must provide exactly the same keys (see fr.ts / es.ts).
export const en = {
  meta: {
    title: "Lamadrid Labs",
    description: "Lamadrid Labs — an independent software studio.",
  },
  nav: {
    home: "Home",
    work: "Work",
    about: "About",
    contact: "Contact",
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    // Short visible labels for the corner menu toggle.
    menu: "Menu",
    close: "Close",
  },
  shell: {
    // Shown on placeholder states whose full-screen state isn't built yet.
    inDevelopment: "In development",
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
    eyebrow: "Selected systems",
    title: "Work, resolved.",
    supporting:
      "Four different problems. Four systems shaped into something usable.",
    lead: "A working sample of what's shipped — real projects, real users.",
    featuredLabel: "Featured",
    restTitle: "More work",
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
    // Section labels shared by every project micro-universe. Per-project content
    // lives under projects[id].world.
    world: {
      overview: "Project",
      enter: "Enter project",
      problem: "Problem",
      solution: "Solution",
      outcome: "Outcome",
      tech: "Built with",
      architecture: "Architecture",
      results: "Results",
      visitLive: "Visit live",
      viewSource: "View source",
      back: "Back to work",
      scroll: "Scroll to explore",
    },
    projects: {
      "ricardo-os": {
        title: "RicardoOS",
        summary:
          "Ricardo's personal website reimagined as an operating-system-inspired portfolio experience.",
        tags: ["Next.js", "React", "Interaction Design", "Personal"],
        world: {
          statement:
            "A personal portfolio reimagined as an operating system you can actually use.",
          problem:
            "A résumé and a list of links tell you what someone has done. They don't let you feel how they think. The portfolio needed to be the argument itself — proof of craft, not a description of it.",
          solution:
            "RicardoOS turns the portfolio into a desktop environment: windows, a dock, and apps that each open a different facet of the work. You don't scroll a page — you explore a system, the way you'd explore any product Ricardo builds.",
          outcome:
            "The medium becomes the message. By the time you've opened a window and moved it around, you've already felt the interaction craft the portfolio is trying to convey — no case study required.",
          architecture: [
            "Next.js App Router with a client-driven window manager for draggable, focusable, stackable app windows.",
            "A typed app registry, so adding a window is a data entry rather than a rebuild.",
            "State kept local and ephemeral — no backend, statically exportable, fast to load.",
          ],
          results: [
            "Shipped and live at ricardolamadrid.com.",
            "Reads as a product, not a page — the interaction itself is the proof of craft.",
          ],
        },
      },
      "marina-cuesta": {
        title: "Marina Cuesta",
        summary:
          "A polished, custom website built for Marina Cuesta — an example of clean design and careful implementation.",
        tags: ["Web Design", "Next.js", "Client Work"],
        world: {
          statement: "A calm, custom website that lets the work speak first.",
          problem:
            "Marina needed a home online that felt as considered as her own work — not a template, not a page builder, something that read as intentional.",
          solution:
            "A bespoke site with a restrained layout, careful typography, and just enough motion to feel alive without getting in the way.",
          outcome:
            "A clean, fast, personal site that looks made rather than assembled.",
          architecture: [
            "Next.js with static generation for a fast, inexpensive-to-host site.",
            "Design-token-driven styling, so the look stays consistent and easy to adjust.",
          ],
          results: ["Shipped and live at marinacuesta.com."],
        },
      },
      subrooms: {
        title: "SubRooms",
        summary:
          "A YouTube subscription organizer that turns a noisy feed into focused viewing rooms like Coding, Cooking, and Music.",
        tags: ["React", "TypeScript", "Design System", "Vercel"],
        world: {
          statement: "Turn a noisy YouTube feed into focused rooms.",
          problem:
            "A single subscription feed mixes everything together — coding, cooking, music — so nothing gets your full attention.",
          solution:
            "SubRooms sorts channels into purpose-built rooms, so every viewing session has a single, clear focus.",
          outcome:
            "A subscription feed that finally matches how people actually watch — one context at a time.",
          architecture: [
            "React and TypeScript single-page app with a small, consistent design system.",
            "Deployed on Vercel.",
          ],
          results: ["Shipped and live."],
        },
      },
      "writer-companion": {
        title: "Writer Companion",
        summary:
          "A focused writing-coach app that turns a story idea into daily writing momentum with guided tasks and feedback.",
        tags: ["Next.js", "TypeScript", "AI", "Vercel"],
        world: {
          statement: "Turn a story idea into daily writing momentum.",
          problem:
            "Most writing tools store words. Almost none help you actually keep going, day after day.",
          solution:
            "Writer Companion breaks a story into guided tasks and gentle feedback, so the next step is always obvious and the habit builds itself.",
          outcome:
            "Writing becomes a sequence of small, doable moves instead of a blank page.",
          architecture: [
            "Next.js and TypeScript with AI-assisted guidance.",
            "Deployed on Vercel.",
          ],
          results: ["Shipped and live."],
        },
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
  sound: {
    enable: "Turn sound on",
    disable: "Turn sound off",
  },
  language: {
    label: "Language",
  },
};

export type Dictionary = typeof en;
