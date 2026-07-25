import type { Dictionary } from "@/data/i18n";

/**
 * The full-screen states the no-scroll shell can show. Labels live in
 * `dict.nav` so they stay translatable; the state machine lives in
 * `ShellProvider`.
 */
export type ViewKey = keyof Pick<
  Dictionary["nav"],
  "home" | "work" | "about" | "contact"
>;

/** Which corner of the viewport an action anchors to. */
export type Corner = "tl" | "tr" | "bl" | "br";

export interface CornerNavItem {
  key: ViewKey;
  corner: Corner;
}

/**
 * The persistent corner navigation. There is no menu — each action lives in a
 * fixed corner of the viewport and morphs the central Signal / Noise field into
 * its state. DOM order below is also the keyboard order (Home → Work → About →
 * Contact); the visual corner is set purely by `corner` in CSS.
 *
 * - Home (top-left) is the Dynamic Frame logo; it returns to the landing state.
 * - Work / About / Contact carry a small icon plus a translated label.
 */
export const cornerNavItems: CornerNavItem[] = [
  { key: "home", corner: "tl" },
  { key: "work", corner: "tr" },
  { key: "about", corner: "bl" },
  { key: "contact", corner: "br" },
];
