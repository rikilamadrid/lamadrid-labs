# Changelog

All notable changes to Lamadrid Labs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial Lamadrid Labs project context.
- Initial website direction for a simple, clean digital laboratory experience.
- Initial showcase scope for RicardoOS and Marina Cuesta.
- Lab design tokens (color, radius, shadow) and base typography wired into Tailwind v4.
- Homepage `Hero` section (`src/components/sections/Hero.tsx`) with kicker badge, gradient headline, and CTAs.
- Light/dark theme toggle in the `Nav` (`src/components/ui/ThemeToggle.tsx`): dark stays the default, with a deliberately retuned light token set. Defaults to OS preference, persists the explicit choice, applies the theme pre-hydration to avoid a flash, and respects `prefers-reduced-motion`.
- EN · FR · ES language toggle in the `Nav` (`src/components/ui/LanguageToggle.tsx`) with typed local dictionaries (`src/data/i18n/{en,fr,es}.ts`). English is the default and runtime fallback; a shared `Dictionary` type forces every locale to provide the same keys. `LocaleProvider` supplies the active dictionary and syncs `document.title` / meta description; a pre-hydration script sets `<html lang>` before paint. The choice persists to `localStorage` and honors `navigator.language` on first visit. Nav, Hero, and Footer now source all copy from the dictionaries.

### Changed

- Reworked the visual direction from a light "laboratory white" theme to a dark "lab at night" theme (deep navy background, glass panels, teal + violet signal colors, grid overlay), inspired by the `LLprototype3` prototype.
- Restyled `Nav` into a floating glass pill; restyled `Footer` onto the new dark tokens.

### Fixed

- Scoped TypeScript and ESLint checks to the app source so reference files under `context/prototypes/` no longer break `npm run build` and `npm run lint`.

### Removed

- None yet.
