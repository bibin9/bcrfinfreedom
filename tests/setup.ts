import "@testing-library/jest-dom/vitest";

// Node 26 exposes a native localStorage accessor that can be undefined without
// a storage file; tests must use a deterministic browser-like store instead.
if (!globalThis.localStorage?.setItem) {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    get length() { return values.size; },
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, String(value)); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => values.clear(), key: (index: number) => [...values.keys()][index] ?? null,
  } });
}
