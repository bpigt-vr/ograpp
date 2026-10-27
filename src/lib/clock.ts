import { useSyncExternalStore } from 'react';

/**
 * A single app-wide clock tick. Components that display time-sensitive state
 * (poll deadlines, moderator session expiry) subscribe instead of calling
 * `Date.now()` during render, which keeps renders pure.
 */
let current = Date.now();
const listeners = new Set<() => void>();

if (typeof setInterval !== 'undefined') {
  const handle = setInterval(() => {
    current = Date.now();
    listeners.forEach((listener) => listener());
  }, 20_000);
  // Never keep a Node/test process alive because of the clock.
  (handle as unknown as { unref?: () => void }).unref?.();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshotForBrowser(): number {
  return current;
}

function getServerSnapshot(): number {
  return current;
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshotForBrowser, getServerSnapshot);
}

/** Read the clock from event handlers without tripping render-purity lint. */
export function nowMs(): number {
  return Date.now();
}
