/**
 * A DOM-free bus carrying the headline element the global field should resolve
 * into — the same subscribe-to-wake pattern as `shell-signal` / `work-signal`,
 * so a state component and the framework-free engine can hand off a live DOM
 * node without React in the animation path and without effect-ordering hazards
 * (a child's effect runs before its parent's, so a context handoff would race).
 *
 * A state that owns a headline (Home) publishes its element on mount and on any
 * change to the text (locale), and clears it on unmount. The engine reads the
 * current element at construction and subscribes for later changes; every `set`
 * notifies, so re-publishing the same element with new text still rebuilds the
 * glyph population.
 */
let headlineElement: HTMLElement | null = null;
const subscribers = new Set<() => void>();

export function setHeadlineElement(element: HTMLElement | null): void {
  headlineElement = element;
  for (const notify of subscribers) notify();
}

export function getHeadlineElement(): HTMLElement | null {
  return headlineElement;
}

export function subscribeHeadline(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
