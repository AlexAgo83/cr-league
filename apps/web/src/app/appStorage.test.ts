// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPlayerClaims, safeStorage, storeProfileEmail } from "./appStorage.js";

const realStorage = window.localStorage;

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "localStorage", { value: realStorage, configurable: true });
});

describe("safeStorage", () => {
  it("falls back when browser storage throws", () => {
    const throwingStorage = {
      getItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      setItem: vi.fn(() => {
        throw new DOMException("full", "QuotaExceededError");
      }),
      removeItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      key: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      length: 1
    };
    Object.defineProperty(window, "localStorage", { value: throwingStorage, configurable: true });
    vi.stubGlobal("localStorage", throwingStorage);

    expect(loadPlayerClaims()).toEqual([]);
    expect(() => storeProfileEmail("pilot@example.test")).not.toThrow();
    expect(() => safeStorage.remove("cr-league-profile-email")).not.toThrow();
    expect(safeStorage.keys()).toEqual([]);
  });
});
