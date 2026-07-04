# Lamadrid Labs

Lamadrid Labs is an independent software studio website for Ricardo Lamadrid. It should feel like a clean digital laboratory: simple, precise, calm, modern, and quietly delightful.

The site is not just a personal portfolio. It is the umbrella for Ricardo's products, experiments, client services, and future creative work.

## Orientation (read this first)

- Deep context lives in `context/`:
  - `context/project-overview.md` — product vision, stack, architecture, content model, routing, and constraints
  - `context/coding-standards.md` — TypeScript, React, Next.js, styling, and file conventions
  - `context/ai-interaction.md` — workflow rules for Claude, Codex, and similar agents
  - `context/current-feature.md` — the active feature tracker; keep it current
  - `context/history.md` — append-only log of completed work
- Per-feature specs live in `context/features/`.
- Read only the docs needed for the task; do not load everything by default.

## Product summary

Build `lamadridlabs.com` as the clean home base for Lamadrid Labs.

Current showcase items:

- RicardoOS — Ricardo's personal website / operating-system-inspired portfolio experience
- Marina Cuesta — a website built for Marina Cuesta

Future showcase items should be easy to add without redesigning the site.

## Default stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui + Radix primitives only when useful
- Framer Motion or Motion for subtle interaction polish when justified
- Typed local content first
- MDX only if long-form writing or case studies require it

## Architecture notes

- Prefer static generation and typed local content unless the project truly needs a backend.
- Keep all showcase content data-driven so new projects can be added quickly.
- Default to server components, and use `'use client'` only when interactivity requires it.
- Put design tokens in CSS variables and keep styling decisions centralized.
- The site should be lightweight, fast, and elegant. Do not overbuild.

## Conventions

- Branch per feature or fix.
- Update `context/current-feature.md` before starting implementation and again after merge.
- Build must pass before commit.
- Ask before committing.
- Keep `CHANGELOG.md` updated if the repo uses the included versioning workflow.
- Keep `context/history.md` aligned with shipped work.
- Commit messages must carry no AI attribution.

## Versioning

- Default to Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Keep a root `CHANGELOG.md` in Keep a Changelog style.
- Add changes under `## [Unreleased]` as the work happens, not at the very end.
- Use `PATCH` for backward-compatible fixes, `MINOR` for backward-compatible features, and `MAJOR` for breaking user-facing changes.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run start
```

If the repo supports release helpers, add them here later, for example:

```bash
npm run version:patch
npm run version:minor
npm run version:major
```

## First implementation goal

Create the first production-ready prototype of Lamadrid Labs:

- Clean landing page
- Minimal lab-inspired brand system
- Showcase section for RicardoOS and Marina Cuesta
- Services/expertise section
- About/founder section
- Contact CTA
- Fully responsive layout
- Realistic placeholder links until final URLs are provided
- Strong metadata for `lamadridlabs.com`
