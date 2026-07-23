"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { ShellMenu } from "@/components/shell/ShellMenu";
import { useShell } from "@/components/shell/ShellProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Minimal corner marks for the no-scroll shell: a temporary neutral wordmark
 * top-left (returns to Home) and the controls + menu toggle top-right. The bar
 * itself is non-interactive (`pointer-events-none`) so it never eats clicks
 * meant for the state underneath; only the marks re-enable pointer events.
 */
export function ShellNav() {
  const dict = useDictionary();
  const { setView, menuOpen, toggleMenu } = useShell();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lab-sm focus:bg-lab-surface-strong focus:px-4 focus:py-2 focus:text-sm focus:text-lab-ink focus:outline-none focus:ring-2 focus:ring-lab-signal-strong"
      >
        {dict.nav.skipToContent}
      </a>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between p-5 sm:p-6">
        {/* Temporary neutral wordmark — stands in until the Signal / Noise mark
            is designed. Returns to the Home state. */}
        <button
          type="button"
          onClick={() => setView("home")}
          aria-label="Lamadrid Labs"
          className="shell-wordmark pointer-events-auto rounded-lab-sm outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
        >
          Lamadrid Labs
        </button>

        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle />

          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="shell-menu"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            className="shell-control rounded-lab-sm px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
          >
            {menuOpen ? dict.nav.close : dict.nav.menu}
          </button>
        </div>
      </div>

      <ShellMenu />
    </>
  );
}
