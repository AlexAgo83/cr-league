// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText, loadPlayerClaims, loadProfileSession, PROFILE_SESSION_KEY, safeStorage, storeProfileEmail, storeProfileSession } from "./appStorage.js";

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

describe("profile session storage", () => {
  it("strips recovery codes before writing or reading profile sessions", () => {
    storeProfileSession({
      profile: { id: "profile-1", email: "pilot@example.test" },
      recoveryCode: "ABCD1234",
      sessionCredential: "session-token",
      teams: []
    });

    expect(localStorage.getItem(PROFILE_SESSION_KEY)).not.toContain("ABCD1234");
    expect(loadProfileSession()).toMatchObject({ profile: { id: "profile-1" }, sessionCredential: "session-token" });

    localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify({ profile: { id: "profile-1", email: "pilot@example.test" }, recoveryCode: "LEGACY", sessionCredential: "legacy-session", teams: [] }));

    expect(loadProfileSession()).toMatchObject({ profile: { id: "profile-1" }, sessionCredential: "legacy-session" });
    expect(localStorage.getItem(PROFILE_SESSION_KEY)).not.toContain("LEGACY");
  });
});

describe("copyText", () => {
  it("falls back to a temporary input when clipboard access fails", async () => {
    const execCommand = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) } });
    document.execCommand = execCommand;

    await copyText("ABCD1234");

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("input[value='ABCD1234']")).toBe(null);
  });
});
