/**
 * Corner-navigation glyphs for the Signal / Noise shell.
 *
 * Every icon is decorative (`aria-hidden`) — the corner control always carries
 * an accessible name of its own (visible label or `aria-label`), so exposing the
 * SVG would only duplicate it. Inner parts are classed (`sn-point`, `sn-link`,
 * `sn-node`) so the corner's hover / focus / active CSS can align the fragments
 * and light the central signal point without each icon re-declaring motion.
 *
 * All share a 24×24 grid and paint with `currentColor` so they inherit the
 * corner's ink / muted / signal color directly.
 */

const COMMON = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

/**
 * Dynamic Frame — the brand mark and Home action: two rounded opposing L forms
 * holding an open square, with a central signal point. Recognizable and simple
 * at rest; the point resolves to signal when Home is active.
 */
export function HomeMark() {
  return (
    <svg {...COMMON}>
      <path
        className="sn-link"
        d="M5 9V6.5A1.5 1.5 0 0 1 6.5 5H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        className="sn-link"
        d="M19 15v2.5a1.5 1.5 0 0 1-1.5 1.5H15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle className="sn-point" cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Work — a small structured constellation: four nodes resolving into an ordered
 * system through connecting links. Represents selected systems, not a folder.
 */
export function WorkIcon() {
  return (
    <svg {...COMMON}>
      <path
        className="sn-link"
        d="M7 7.5 16.5 6.5M7 7.5l3 8.5M16.5 6.5 17 15M10 16l7-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="sn-node" cx="7" cy="7.5" r="1.7" fill="currentColor" />
      <circle className="sn-node" cx="16.5" cy="6.5" r="1.7" fill="currentColor" />
      <circle className="sn-point" cx="10" cy="16" r="1.7" fill="currentColor" />
      <circle className="sn-node" cx="17" cy="15" r="1.7" fill="currentColor" />
    </svg>
  );
}

/**
 * About — a human-centered coordinate: one origin point framed by coordinate
 * ticks and circled by a partial orbit. A person located in the field, not a
 * generic user silhouette.
 */
export function AboutIcon() {
  return (
    <svg {...COMMON}>
      <path
        className="sn-link"
        d="M12 4.5a7.5 7.5 0 0 1 6 11.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        className="sn-link"
        d="M12 8.5v-3M12 18.5v-3M8.5 12h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle className="sn-point" cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

/**
 * Contact — an outbound signal: one node sending a short path to a second that
 * resolves on connection. A transmission, not an envelope.
 */
export function ContactIcon() {
  return (
    <svg {...COMMON}>
      <path
        className="sn-link"
        d="M8 16 16 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="sn-pulse-arc"
        d="M14.5 5.5a4.5 4.5 0 0 1 4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle className="sn-node" cx="7.5" cy="16.5" r="2" fill="currentColor" />
      <circle className="sn-point" cx="16.5" cy="7.5" r="2" fill="currentColor" />
    </svg>
  );
}

export const CORNER_ICONS = {
  home: HomeMark,
  work: WorkIcon,
  about: AboutIcon,
  contact: ContactIcon,
} as const;
