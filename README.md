# Lamadrid Labs Context Kit

This folder contains the starter context for building the Lamadrid Labs website with Claude Code, Codex, or another coding agent.

Lamadrid Labs is the umbrella brand for Ricardo Lamadrid's products, experiments, client services, and future creative work.

## What is Lamadrid Labs?

Lamadrid Labs is an independent software studio focused on thoughtful software, design engineering, frontend architecture, and AI workflow systems.

The website should feel like a clean digital laboratory:

- Simple
- Precise
- Calm
- Modern
- Trustworthy
- Lightly playful
- Product-focused

It should showcase current work and make room for future products.

## Current showcase items

- **RicardoOS** — Ricardo's personal website / operating-system-inspired portfolio
- **Marina Cuesta** — a clean website project for Marina Cuesta

## What's included

- `CLAUDE.md` — the main repo guide
- `AGENTS.md` — lightweight pointer for AGENTS-aware tools
- `CHANGELOG.md` — Keep a Changelog starter
- `context/project-overview.md` — product, stack, architecture, design, and constraints
- `context/coding-standards.md` — code conventions
- `context/ai-interaction.md` — working agreement for agent collaboration
- `context/current-feature.md` — live tracker for what is active right now
- `context/history.md` — append-only completed-work log
- `context/features/example-feature-spec.md` — model feature spec

## How to use it

1. Create the new Lamadrid Labs repo.
2. Copy `CLAUDE.md`, `AGENTS.md`, and `CHANGELOG.md` to the repo root.
3. Copy the `context/` folder into the repo root.
4. Ask Claude Code to read `CLAUDE.md` first.
5. Start with the scope in `context/current-feature.md`.
6. Keep all showcased projects data-driven so the site can grow.

## Recommended default stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui + Radix primitives when useful
- Motion/Framer Motion only for subtle polish
- Typed local data first
- MDX only if case studies or writing require it

## Brand note

Do not make this feel like a generic freelance agency website. It should feel like a small, intentional software laboratory where products, experiments, and client work are documented with care.
