"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { useSound } from "@/lib/sound";

/**
 * Sound on/off switch for the corner controls, mirroring `ThemeToggle`. The
 * visible icon is driven by the `data-sound` attribute in CSS so it is correct
 * from first paint (no flash); ARIA state comes from `useSyncExternalStore`,
 * which is hydration-safe. Enabling plays a soft confirmation blip (the click is
 * the user gesture that lets audio start); disabling is silent.
 */
export function SoundToggle() {
  const dict = useDictionary();
  const { enabled, toggle } = useSound();
  const label = enabled ? dict.sound.disable : dict.sound.enable;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={enabled}
      title={label}
      className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full text-lab-muted outline-none transition-colors hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-signal-strong"
    >
      {/* Shown when sound is off — muted speaker */}
      <svg
        className="sound-icon-off"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 7.5h2.5L9 4.5v11L5.5 12.5H3v-5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="m13 8 4 4M17 8l-4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {/* Shown when sound is on — speaker with waves */}
      <svg
        className="sound-icon-on"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 7.5h2.5L9 4.5v11L5.5 12.5H3v-5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 7.5a3.5 3.5 0 0 1 0 5M14.8 5.5a6.5 6.5 0 0 1 0 9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
