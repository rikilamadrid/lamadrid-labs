"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useShell } from "@/components/shell/ShellProvider";
import { navItems } from "@/data/navigation";
import { DURATION, EASE } from "@/lib/motion";

/**
 * The full-screen menu overlay. Lists the shell's states as a large editorial
 * list; the active state and hover take the single signal accent — allowed
 * here because the menu covers the whole viewport, so it is the only thing in
 * view (the signal-scarcity rule is per-view). Sits at z-40, below the corner
 * marks (z-50), so the toggle and wordmark stay usable to dismiss it.
 */
export function ShellMenu() {
  const dict = useDictionary();
  const { menuOpen, closeMenu, setView, view } = useShell();
  const reduce = useReducedMotion();
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Escape closes the menu.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  // Move focus into the menu on open; return it to the toggle on close.
  useEffect(() => {
    if (menuOpen) {
      firstItemRef.current?.focus();
    } else if (wasOpen.current) {
      const toggle = document.querySelector<HTMLElement>(
        '[aria-controls="shell-menu"]',
      );
      toggle?.focus();
    }
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  const overlayMotion = reduce
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: DURATION.base, ease: EASE.standard },
      };

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          id="shell-menu"
          className="lab-glass-solid fixed inset-0 z-40 flex flex-col justify-center"
          {...overlayMotion}
        >
          <nav
            aria-label="Primary"
            className="mx-auto flex w-full max-w-4xl flex-col px-6 sm:px-10 lg:px-16"
          >
            <ul className="flex flex-col gap-1 sm:gap-2">
              {navItems.map((item, index) => (
                <li key={item.key}>
                  <button
                    ref={index === 0 ? firstItemRef : undefined}
                    type="button"
                    onClick={() => setView(item.key)}
                    aria-current={view === item.key ? "page" : undefined}
                    className="shell-menu-link rounded-lab-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
                  >
                    {dict.nav[item.key]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
