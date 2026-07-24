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

export interface NavItem {
  key: ViewKey;
}

/**
 * Menu order. `home` returns to the landing state; `work` / `about` / `contact`
 * are placeholder states until their full-screen states are built (Features 6+).
 */
export const navItems: NavItem[] = [
  { key: "home" },
  { key: "work" },
  { key: "about" },
  { key: "contact" },
];
