import type { Disposable } from '../types.js';

/**
 * Creates a module-level external store compatible with React `useSyncExternalStore`.
 *
 * @param initial - Initial snapshot value.
 */
export function createExternalStore<T>(initial: T): {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  setState: (next: T) => void;
} {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    setState: (next) => {
      state = next;
      for (const listener of listeners) {
        listener();
      }
    }
  };
}

/**
 * Starts an interval and returns a disposable that clears it on deactivation.
 *
 * @param callback - Function invoked on each tick.
 * @param intervalMs - Interval in milliseconds.
 */
export function setIntervalDisposable(callback: () => void, intervalMs: number): Disposable {
  const timer = setInterval(callback, intervalMs);
  return {
    dispose: () => {
      clearInterval(timer);
    }
  };
}
