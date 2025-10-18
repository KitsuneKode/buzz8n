// Global test setup for Bun
import { Window } from "happy-dom";

// DOM globals for React tests
const window = new Window();
// @ts-ignore
globalThis.window = window as any;
// @ts-ignore
globalThis.document = window.document as any;
// @ts-ignore
globalThis.navigator = window.navigator as any;

// Clipboard mock
if (!(globalThis as any).navigator.clipboard) {
  // @ts-ignore
  (globalThis as any).navigator.clipboard = {
    writeText: async () => {},
    readText: async () => "",
  };
}

// Timers sane defaults
// @ts-ignore
vi?.useRealTimers?.();

// Silence noisy logs in tests
const noop = () => {};
// @ts-ignore
globalThis.console = { ...console, debug: noop, info: console.info, warn: console.warn, error: console.error };
