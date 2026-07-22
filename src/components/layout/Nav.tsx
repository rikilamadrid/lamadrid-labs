"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navLinks } from "@/data/navigation";
import { transition } from "@/lib/motion";

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const dict = useDictionary();

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter((section): section is Element => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (activeEntry?.target.id) {
          setActiveHref(`#${activeEntry.target.id}`);
        }
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75],
      },
    );

    const syncTopState = () => {
      if (window.scrollY < 120) {
        setActiveHref("");
      }
    };

    sections.forEach((section) => observer.observe(section));
    syncTopState();
    window.addEventListener("scroll", syncTopState, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncTopState);
    };
  }, []);

  const menuMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: transition("base"),
      };

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lab-sm focus:bg-lab-surface-strong focus:px-4 focus:py-2 focus:text-sm focus:text-lab-ink focus:outline-none focus:ring-2 focus:ring-lab-signal-strong"
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
            aria-label="Lamadrid Labs"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
          >
            <span
              aria-hidden="true"
              className="h-6 w-6 flex-none rounded-full bg-lab-signal shadow-lab-glow"
            />
            <span
              aria-hidden="true"
              className="hidden text-sm font-semibold text-lab-ink sm:inline"
            >
              Lamadrid Labs
            </span>
          </a>

          <div className="flex items-center gap-2 md:gap-4">
            <ul className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={activeHref === link.href ? "page" : undefined}
                    className={`lab-nav-link text-sm text-lab-muted outline-none transition-colors hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-signal-strong${
                      activeHref === link.href ? " is-active" : ""
                    }`}
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
              className="inline-flex items-center justify-center rounded-full p-2 text-lab-ink outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong md:hidden"
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

        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.ul
              id="mobile-nav-menu"
              className="lab-glass-solid mt-2 flex flex-col gap-1 rounded-lab-lg px-4 py-3 md:hidden"
              {...menuMotion}
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={
                      activeHref === link.href ? "page" : undefined
                    }
                    className={`lab-nav-link block rounded-lab-sm px-2 py-2 text-sm text-lab-muted outline-none hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-signal-strong${
                      activeHref === link.href ? " is-active" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {dict.nav[link.key]}
                  </a>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
