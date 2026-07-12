export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
