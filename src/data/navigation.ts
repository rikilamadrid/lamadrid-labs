import type { Dictionary } from "@/data/i18n";

/** Keys into `dict.nav` so labels stay translatable while hrefs live here. */
export type NavKey = keyof Pick<
  Dictionary["nav"],
  "work" | "services" | "about" | "contact"
>;

export interface NavLink {
  key: NavKey;
  href: string;
}

export const navLinks: NavLink[] = [
  { key: "work", href: "#work" },
  { key: "services", href: "#services" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
];
