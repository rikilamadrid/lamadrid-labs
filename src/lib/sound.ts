"use client";

import { useSyncExternalStore } from "react";

/**
 * The site's sound layer: a small set of short, procedural UI blips synthesized
 * with the Web Audio API — no audio asset files, no runtime dependency. Sound is
 * **off by default** and opt-in via the corner toggle; every `playSound` call is
 * a no-op while it's off, so the site is silent unless a visitor asks for it.
 *
 * The on/off preference is stored and read exactly like `theme.ts`: the applied
 * `data-sound` attribute on <html> (set pre-hydration by `SOUND_INIT_SCRIPT`) is
 * the single source of truth, kept in React via `useSyncExternalStore` so the
 * toggle icon is correct on first paint with no flash.
 */

/** Silence is the default; sound is a deliberate opt-in. */
const DEFAULT_ENABLED = false;
export const SOUND_STORAGE_KEY = "lab-sound";
const SOUND_CHANGE_EVENT = "lab-sound-change";

export type SoundName = "menuOpen" | "menuClose" | "navigate" | "toggle";

/**
 * Inline pre-hydration script. Runs before paint so the correct sound state is
 * on <html> before first render — no flash of the wrong toggle icon. Kept
 * dependency free and self-contained because it is injected as a raw string.
 */
export const SOUND_INIT_SCRIPT = `(function(){try{var v=localStorage.getItem("${SOUND_STORAGE_KEY}");document.documentElement.setAttribute("data-sound",v==="on"?"on":"off");}catch(e){document.documentElement.setAttribute("data-sound","off");}})();`;

// --- Preference store (mirrors theme.ts) ---------------------------------

function applyEnabled(enabled: boolean) {
  document.documentElement.setAttribute("data-sound", enabled ? "on" : "off");
}

// The applied attribute on <html> is the source of truth; the inline script
// sets it before hydration so React can read it without a flash.
function getSnapshot(): boolean {
  return document.documentElement.getAttribute("data-sound") === "on";
}

function getServerSnapshot(): boolean {
  return DEFAULT_ENABLED;
}

function subscribe(onChange: () => void) {
  // Keep other tabs in sync when the choice changes.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SOUND_STORAGE_KEY) return;
    applyEnabled(event.newValue === "on");
    onChange();
  };

  window.addEventListener(SOUND_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SOUND_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Reads the applied sound state (set pre-hydration), keeps React in sync via
 * `useSyncExternalStore` — hydration-safe, no flash — and persists explicit
 * choices. Enabling plays a soft confirmation blip; disabling is silent.
 */
export function useSound() {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setEnabled = (next: boolean) => {
    applyEnabled(next);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Persistence is best-effort (e.g. private mode); the toggle still works.
    }
    window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
    // Confirm the "on" choice audibly. The toggle click is a user gesture, so
    // the AudioContext can start here. Turning off stays silent.
    if (next) {
      playSound("toggle");
    }
  };

  const toggle = () => setEnabled(!enabled);

  return { enabled, setEnabled, toggle };
}

// --- Procedural audio engine ---------------------------------------------

type AudioContextCtor = typeof AudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;

  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext;
  if (!Ctor) return null;

  try {
    audioContext = new Ctor();
  } catch {
    // Some environments block construction outright; fail silent.
    return null;
  }
  return audioContext;
}

/** One short blip: an oscillator through its own gain envelope. */
function blip(
  ctx: AudioContext,
  master: GainNode,
  {
    type,
    from,
    to,
    duration,
    peak,
    delay = 0,
  }: {
    type: OscillatorType;
    from: number;
    to: number;
    duration: number;
    peak: number;
    delay?: number;
  },
) {
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  if (to !== from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration);
  }

  // Quick attack, smooth exponential decay — nothing clicks or lingers.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

// Voices are deliberately quiet, short, and closely related — a small, calm
// family, not a soundboard. Sine/triangle only; no harsh edges.
const VOICES: Record<SoundName, (ctx: AudioContext, master: GainNode) => void> =
  {
    // A clean single mid tone — the neutral confirmation for a toggle.
    toggle: (ctx, master) =>
      blip(ctx, master, {
        type: "sine",
        from: 660,
        to: 660,
        duration: 0.09,
        peak: 0.06,
      }),
    // A clean navigation tick — slightly brighter than a toggle.
    navigate: (ctx, master) =>
      blip(ctx, master, {
        type: "triangle",
        from: 720,
        to: 720,
        duration: 0.08,
        peak: 0.05,
      }),
    // Opening rises — two soft tones stepping up.
    menuOpen: (ctx, master) => {
      blip(ctx, master, {
        type: "sine",
        from: 523,
        to: 523,
        duration: 0.07,
        peak: 0.05,
      });
      blip(ctx, master, {
        type: "sine",
        from: 784,
        to: 784,
        duration: 0.09,
        peak: 0.05,
        delay: 0.05,
      });
    },
    // Closing falls — the reverse of opening.
    menuClose: (ctx, master) => {
      blip(ctx, master, {
        type: "sine",
        from: 784,
        to: 784,
        duration: 0.07,
        peak: 0.05,
      });
      blip(ctx, master, {
        type: "sine",
        from: 523,
        to: 523,
        duration: 0.09,
        peak: 0.05,
        delay: 0.05,
      });
    },
  };

/**
 * Play a UI blip. No-op unless sound is enabled. Safe to call from any click
 * handler: it lazily creates the AudioContext and resumes it if suspended,
 * both of which browsers permit inside a user gesture.
 */
export function playSound(name: SoundName) {
  if (typeof document === "undefined") return;
  if (document.documentElement.getAttribute("data-sound") !== "on") return;

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const master = ctx.createGain();
  master.gain.value = 0.5; // headroom under the per-voice peaks
  master.connect(ctx.destination);

  VOICES[name](ctx, master);
}
