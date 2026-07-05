"use client";

import { useState } from "react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navLinks } from "@/data/navigation";

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dict = useDictionary();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lab-sm focus:bg-lab-surface-strong focus:px-4 focus:py-2 focus:text-sm focus:text-lab-ink focus:outline-none focus:ring-2 focus:ring-lab-accent-strong"
      >
        {dict.nav.skipToContent}
      </a>
      <div className="mx-auto max-w-3xl">
        <nav
          aria-label="Primary"
          className="lab-glass flex items-center justify-between gap-4 rounded-full px-3 py-2.5 pl-4"
        >
          <a
            href="#top"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
          >
            <span
              aria-hidden="true"
              className="h-6 w-6 flex-none rounded-full bg-gradient-to-br from-lab-accent to-lab-accent-secondary shadow-lab-glow"
            />
            <span className="text-sm font-semibold tracking-[0.1em] text-lab-ink">
              Lamadrid Labs
            </span>
          </a>

          <div className="flex items-center gap-2 md:gap-4">
            <ul className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-lab-muted outline-none transition-colors hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
                  >
                    {dict.nav[link.key]}
                  </a>
                </li>
              ))}
            </ul>

            <LanguageToggle />
            <ThemeToggle />

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 text-lab-ink outline-none focus-visible:ring-2 focus-visible:ring-lab-accent-strong md:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={isMenuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    d="M4 4L16 16M16 4L4 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 5H17M3 10H17M3 15H17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <ul
            id="mobile-nav-menu"
            className="lab-glass mt-2 flex flex-col gap-1 rounded-lab-lg px-4 py-3 md:hidden"
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lab-sm px-2 py-2 text-sm text-lab-muted outline-none hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {dict.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
