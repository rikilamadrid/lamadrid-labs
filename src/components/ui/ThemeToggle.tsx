"use client";

import { useTheme } from "@/lib/theme";

/**
 * Calm light/dark switch for the Nav. The visible icon is driven by the
 * `data-theme` attribute in CSS so it is correct from first paint (no flash);
 * ARIA state comes from `useSyncExternalStore`, which is hydration-safe.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label =
    theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "light"}
      title={label}
      className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full text-lab-muted outline-none transition-colors hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
    >
      {/* Shown in dark theme */}
      <svg
        className="theme-icon-moon"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16.5 11.8A6.5 6.5 0 1 1 8.2 3.5a5.2 5.2 0 0 0 8.3 8.3Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      {/* Shown in light theme */}
      <svg
        className="theme-icon-sun"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6 4.2 4.2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
