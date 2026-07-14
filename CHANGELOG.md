# Changelog

All notable changes to Lamadrid Labs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Holographic HUD panel system for the Process section (feature 47): a reusable `ProcessHudPanel` (`src/components/sections/process/ProcessHudPanel.tsx`) rendered as a DOM/CSS glass overlay layered over the WebGL canvas — thin glowing token-driven border frame, corner ticks, mono/technical type, step + title header, translated status indicator, metric rows, and a small deterministic SVG sparkline. Extended `src/data/process.ts` with an illustrative per-stage `hud.sparkline` waveform and added matching `process.hud` copy (shared labels + per-stage status/metrics, illustrative values only) to `en.ts`/`es.ts`/`fr.ts`. Unified the existing per-stage copy crossfade in `ProcessScrollRig` and the mobile `MobileProcessStage` onto the panel; all accents flow from the per-stage `--stage-signal` cyan/teal token and the scan shimmer self-disables under `prefers-reduced-motion`.
- Premium 3D rendering foundation for the Process section (feature 45): a shared material toolkit (`src/components/sections/process/processMaterials.tsx`) exporting transmission `GlassMaterial`, `BrushedMetalMaterial`, and `EmissiveCoreMaterial`, plus a fetch-free generated studio `ProcessEnvironment` (static-export safe — no HDRI URL), a `ProcessBench` (`MeshReflectorMaterial`), and a restrained bloom+vignette `ProcessEffects` composer. Added `@react-three/postprocessing`.
- Shared quality-tier system (`src/lib/useProcessQualityTier.ts`): a mobile-first `matchMedia` hook (mirroring `useIsDesktopViewport`) whose knobs (bloom, transmission samples/resolution, reflector/environment resolution, dpr) drive both the desktop `ProcessScene` and `MobileProcessScene` from the same primitives — mobile scales down (cheap glass approximation, low-res env/reflector, no composer) rather than waiting for a later catch-up pass.
- Initial Lamadrid Labs project context.
- Initial website direction for a simple, clean digital laboratory experience.
- Initial showcase scope for RicardoOS and Marina Cuesta.
- Lab design tokens (color, radius, shadow) and base typography wired into Tailwind v4.
- Homepage `Hero` section (`src/components/sections/Hero.tsx`) with kicker badge, gradient headline, and CTAs.
- Light/dark theme toggle in the `Nav` (`src/components/ui/ThemeToggle.tsx`): dark stays the default, with a deliberately retuned light token set. Defaults to OS preference, persists the explicit choice, applies the theme pre-hydration to avoid a flash, and respects `prefers-reduced-motion`.
- EN · FR · ES language toggle in the `Nav` (`src/components/ui/LanguageToggle.tsx`) with typed local dictionaries (`src/data/i18n/{en,fr,es}.ts`). English is the default and runtime fallback; a shared `Dictionary` type forces every locale to provide the same keys. `LocaleProvider` supplies the active dictionary and syncs `document.title` / meta description; a pre-hydration script sets `<html lang>` before paint. The choice persists to `localStorage` and honors `navigator.language` on first visit. Nav, Hero, and Footer now source all copy from the dictionaries.
- Root metadata in `src/app/layout.tsx`: title/description, `metadataBase` (`https://lamadridlabs.com`), Open Graph and Twitter/X card fields using `public/og-image.png`, and a `viewport.themeColor` of `#020812`. Wired the Lamadrid Labs icon pack (favicons, apple touch icon, `site.webmanifest`) already placed in `public/`.
- Static export configuration in `next.config.ts` (`output: "export"`, `trailingSlash: true`, `images.unoptimized: true`) so `npm run build` produces a static `out/` directory deployable to Hostinger shared hosting.
- `deploy/.htaccess` (version-controlled) for the Hostinger export: custom 404, forced HTTPS + apex canonicalization, `.webmanifest` MIME type, and long-lived immutable caching for hashed `_next/static/` assets.
- `.github/workflows/ci.yml`: runs `npm run lint` and `npm run build` on pull requests into `main`.
- `.github/workflows/deploy.yml`: on push to `main`, builds the static export and FTPS-uploads `out/` to Hostinger via `SamKirkland/FTP-Deploy-Action@v4.4.0`, wrapped in `Wandalen/wretry.action` for retry-with-backoff and using a commit-SHA-scoped `state-name` to avoid stale delta-delete failures.
- `DEPLOY.md` documenting hosting facts, the automated CI/deploy flow, a manual zip-upload fallback, and a curl snippet to verify a live deploy.

### Changed

- Reconciled the Process 3D palette (`src/lib/narrativeSignals.ts`) from 5 saturated signal hues (cyan/violet/amber/rose/teal) down to a disciplined monochrome cyan/teal + white family — per-stage `signal` tokens now read as subtle accent shifts within that family rather than competing colors, matching the approved reference renders. Applied the new foundation to the desktop and mobile Process scenes: themed scene background (so the desktop composer can't force opaque black), env reflections on existing metal, a premium glass Synthesis flask, and a reflective bench.
- Reworked the visual direction from a light "laboratory white" theme to a dark "lab at night" theme (deep navy background, glass panels, teal + violet signal colors, grid overlay), inspired by the `LLprototype3` prototype.
- Restyled `Nav` into a floating glass pill; restyled `Footer` onto the new dark tokens.
- Refined homepage visual detail with shared section/header/eyebrow/card surface utilities, lighter card blur/shadow treatment, normalized letter spacing, and tighter section rhythm.
- Documented the Feature 17 decision to skip a dedicated `/work` route while the site only has two projects that fit comfortably on the homepage.
- Documented the Feature 18 decision to skip project case-study/detail pages until real long-form project content exists.
- Replaced the placeholder `public/og-image.png` with a branded 1200×630 social preview matching the shipped dark theme (icon-pack badge, wordmark, tagline).

### Fixed

- Scoped TypeScript and ESLint checks to the app source so reference files under `context/prototypes/` no longer break `npm run build` and `npm run lint`.
- Improved light-theme contrast for accent-filled controls by using a dedicated accent text token.
- Hardened homepage mobile wrapping for long headings, project summaries, service copy, and tag chips so the 390px layout avoids horizontal overflow.

### Removed

- Removed `src/app/favicon.ico` in favor of the `public/` icon pack + `metadata.icons` (avoids a duplicate `/favicon.ico` route).
- Deleted unused Create Next App boilerplate SVGs from `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
