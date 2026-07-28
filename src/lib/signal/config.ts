import { DEFAULT_TUNING, type FieldTuning } from "@/lib/pointer-field";
import type { ViewKey } from "@/data/navigation";

/**
 * The configuration each application state hands the one global engine.
 *
 * States never render and never own a canvas. They select which of the shared
 * primitives are live and how the field is tuned; switching states re-configures
 * the same persistent engine, which morphs toward the new configuration rather
 * than clearing and recreating anything. This is the whole "one surface, many
 * expressions" contract in one object.
 *
 * New primitives added later (waveform traces, topology maps, …) extend
 * `primitives` here and register a module in the engine: states opt in by
 * flipping a flag, with no new rendering code per state.
 */
export type SignalEngineConfig = {
  /**
   * Eased master presence of the whole field, `[0, 1]`, applied as the canvas
   * element's opacity. 1 for states that live inside the field (Home, Work);
   * partial for the calmer editorial states (About, Contact), where the field
   * is texture behind the copy rather than a foreground register.
   */
  presence: number;
  /** Field tuning (spacing, radius, alignment, resolve/decay, …). */
  tuning: FieldTuning;
  /**
   * Resolve a registered headline element into a glyph population that
   * sharpens the word out of the field (Home). `false` runs ambient-only.
   */
  headline: boolean;
  /** Which foreground signal primitives are live in this state. */
  primitives: {
    /** Velocity-driven signal core + coordinate cross at the pointer. */
    core: boolean;
    /** Directional transmission trail behind a moving pointer. */
    trail: boolean;
    /** `pointerdown` and corner-activation transmission pulses. */
    pulse: boolean;
    /** Corner-nav pull: a hovered corner leans the ambient static toward it. */
    cornerPull: boolean;
    /** A signal band resolved behind a state's one focal element: Work's
     *  selected row, or About/Contact's primary CTA. */
    rowBand: boolean;
  };
  /**
   * On touch at rest: hold the headline glyphs resolved so a phone visitor sees
   * the finished word (Home), vs. leave the field calm with nothing resolved
   * (Work).
   */
  touchResolvesHeadline: boolean;
};

/**
 * Home: the exploratory open field. The full velocity-driven foreground (core,
 * trail, pulse), the headline resolving out of the glyph population, and the
 * corner pull. This reproduces the former `HeroField`.
 */
const HOME_CONFIG: SignalEngineConfig = {
  presence: 1,
  tuning: DEFAULT_TUNING,
  headline: true,
  primitives: { core: true, trail: true, pulse: true, cornerPull: true, rowBand: false },
  touchResolvesHeadline: true,
};

/**
 * Work: the same field with no headline, the foreground pointer layer quieted,
 * and the selected-row band live. This replaced the former `WorkField`.
 */
const WORK_CONFIG: SignalEngineConfig = {
  presence: 1,
  tuning: DEFAULT_TUNING,
  headline: false,
  primitives: { core: false, trail: false, pulse: false, cornerPull: true, rowBand: true },
  touchResolvesHeadline: false,
};

/**
 * About / Contact: the calm editorial register. Ambient ground, ticked over to
 * ~1/3 presence so the field reads as texture behind the copy rather than
 * competing with it, and no headline resolve (neither state rasterizes a
 * word). `cornerPull` and `pulse` stay live so the corner nav and the
 * About-to-Contact bridge button (`fireCornerActivation`) still register on
 * the field instead of firing into an invisible canvas. `rowBand` is live too:
 * each state anchors it on its one primary action (About's Contact bridge,
 * Contact's mailto CTA) so the field resolves a quiet, memorable band there
 * instead of sitting flat.
 */
const EDITORIAL_CONFIG: SignalEngineConfig = {
  presence: 0.32,
  tuning: DEFAULT_TUNING,
  headline: false,
  primitives: { core: false, trail: false, pulse: true, cornerPull: true, rowBand: true },
  touchResolvesHeadline: false,
};

const CONFIG_BY_VIEW: Record<ViewKey, SignalEngineConfig> = {
  home: HOME_CONFIG,
  work: WORK_CONFIG,
  about: EDITORIAL_CONFIG,
  contact: EDITORIAL_CONFIG,
};

/**
 * The configuration for a view. Returns a stable per-view object, so
 * `SignalEngine.configure` can identity-compare and no-op on an unchanged view.
 */
export function configForView(view: ViewKey): SignalEngineConfig {
  return CONFIG_BY_VIEW[view];
}
