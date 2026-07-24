"use client";

import { useCallback, useEffect, useState } from "react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { CORNER_ICONS } from "@/components/shell/nav/icons";
import { useShell } from "@/components/shell/ShellProvider";
import { cornerNavItems, type Corner, type ViewKey } from "@/data/navigation";
import { fireCornerActivation, setHoveredCorner } from "@/lib/shell-signal";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Persistent corner navigation for the no-scroll shell — there is no menu. Each
 * of the four states owns a fixed corner and morphs the central Signal / Noise
 * field into itself:
 *
 *   top-left  Home (the Dynamic Frame logo)   top-right  Work
 *   bottom-left  About                        bottom-right  Contact
 *
 * The `<nav>` spans the viewport but is `pointer-events-none`, so it never eats
 * pointer/touch meant for the field underneath; only the corner controls
 * (`pointer-events-auto`) take input, and a tap on one always wins over the
 * ambient field because the control handles the click itself. Offsets come from
 * `--shell-inset-*` (safe-area aware) so no control is ever clipped.
 *
 * The small utility cluster (language / sound / theme) sits top-center, clear of
 * all four corners — the language switch there updates the corner labels live.
 */
export function ShellNav() {
  const dict = useDictionary();
  const { view, setView, activeProject, closeProject } = useShell();

  // Which corner last fired, and a nonce that remounts its pulse element so the
  // activation animation re-triggers on every click (not just the first).
  const [pulse, setPulse] = useState<{ key: ViewKey; n: number } | null>(null);

  const activate = useCallback(
    (key: ViewKey, corner: Corner) => {
      setPulse((prev) => ({ key, n: (prev?.n ?? 0) + 1 }));
      // Tell the field so it throws its pulse toward this corner, then switch.
      fireCornerActivation(corner);
      setView(key);
    },
    [setView],
  );

  // Escape resolves back out of an active state: first collapse an open project
  // world, otherwise return to Home. On Home with nothing open it is a no-op.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeProject) {
        closeProject();
      } else if (view !== "home") {
        setView("home");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProject, view, closeProject, setView]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-1/2 focus:top-4 focus:z-[60] focus:-translate-x-1/2 focus:rounded-lab-sm focus:bg-lab-surface-strong focus:px-4 focus:py-2 focus:text-sm focus:text-lab-ink focus:outline-none focus:ring-2 focus:ring-lab-signal-strong"
      >
        {dict.nav.skipToContent}
      </a>

      {/* Spans the viewport but passes pointer/touch straight through to the
          field; only the corner controls re-enable pointer events. */}
      <nav
        aria-label={dict.nav.primary}
        className="shell-nav pointer-events-none fixed inset-0 z-50"
      >
        {cornerNavItems.map((item) => {
          const Icon = CORNER_ICONS[item.key];
          const isActive = view === item.key;
          const isHome = item.key === "home";
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => activate(item.key, item.corner)}
              // Hover / focus leans the central field's static toward this
              // corner (see `shell-signal`). Mouse only — a touch tap must not
              // linger as a pull; keyboard focus counts, so the field answers
              // tabbing too. Leaving or blurring releases it.
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHoveredCorner(item.corner);
              }}
              onPointerLeave={() => setHoveredCorner(null)}
              onFocus={() => setHoveredCorner(item.corner)}
              onBlur={() => setHoveredCorner(null)}
              // Home is icon-only, so it names itself with the brand (which is
              // also the Home action). The rest are named by their visible label.
              aria-label={isHome ? "Lamadrid Labs" : undefined}
              aria-current={isActive ? "page" : undefined}
              data-corner={item.corner}
              data-active={isActive || undefined}
              className="shell-corner pointer-events-auto"
            >
              <span className="shell-corner__icon">
                <Icon />
                {/* Remounts per click so the CSS pulse re-fires each activation;
                    the global reduced-motion rule collapses it. */}
                {pulse?.key === item.key && (
                  <span
                    key={pulse.n}
                    aria-hidden="true"
                    className="shell-corner__pulse"
                  />
                )}
              </span>
              {!isHome && (
                <span className="shell-corner__label">{dict.nav[item.key]}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Utility cluster — not part of the primary nav. Kept clear of the four
          corners so nothing overlaps or clips. */}
      <div
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
      >
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
