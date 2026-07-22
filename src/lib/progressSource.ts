// A scroll-driven 0-1 value, supplied either as a plain number (static mounts:
// mobile stage cards, dev harnesses) or as a mutable ref the scroll rig writes
// to directly.
//
// The ref form is the one that matters for feel: writing scroll progress into
// a ref and reading it inside `useFrame` means scrolling never triggers a React
// render, so the whole 3D tree (table + 5 rigs + bench + backdrop + composer)
// is reconciled once instead of on every scroll frame. Passing a number
// re-renders on change, which is fine when the value only changes a handful of
// times but is exactly what made continuous scrubbing feel heavy.
export type ProgressSource = number | { readonly current: number };

export function readProgress(source: ProgressSource | undefined, fallback = 0): number {
  if (typeof source === "number") return source;
  return source ? source.current : fallback;
}
