/**
 * The shell's z-layer scale — one shared, documented ordering for the whole
 * experience, so the global Signal / Noise canvas can sit *between* DOM layers
 * rather than above or below everything.
 *
 * The engine is one persistent mid-canvas (`field`). Readable state DOM sits
 * above it; intentional visual DOM (the Home headline the field resolves) sits
 * below it; corner navigation sits above all of it. Nothing in the app should
 * hard-code a raw z-index — import from here so the ordering stays legible and
 * changing it is a one-line edit.
 *
 * Conceptually (low → high):
 *
 *   background      the shell backdrop
 *   atmosphere      ambient, non-interactive field atmosphere (reserved)
 *   contentBelow    intentional visual DOM the field draws *over* (Home's <h1>)
 *   field           the global mid-canvas signal layer (one persistent canvas)
 *   content         primary readable state DOM (copy, index, previews)
 *   projectWorld    a project micro-universe layered over the active state
 *   nav             corner navigation and critical controls
 *   transition      temporary transition-only effects, above everything
 *
 * The numeric steps line up with Tailwind's `z-*` scale on purpose, so the few
 * places that still use utility classes read the same as these constants.
 */
export const LAYERS = {
  background: 0,
  atmosphere: 5,
  contentBelow: 10,
  field: 20,
  content: 30,
  projectWorld: 40,
  nav: 50,
  transition: 60,
} as const;

export type LayerName = keyof typeof LAYERS;
