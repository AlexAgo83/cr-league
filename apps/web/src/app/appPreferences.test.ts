import { describe, expect, it, vi } from "vitest";
import { ONBOARDING_HELP_KEYS } from "./OnboardingShell.js";
import { clearStoredUiPreferences, UI_PREFERENCE_KEYS } from "./appPreferences.js";
import { SEASON_RECAP_KEY_PREFIX } from "./appStorage.js";
import { WHEEL_REGION_KEY } from "../features/arcade/arcadeStorage.js";

describe("appPreferences", () => {
  it("clears static and league-scoped preference keys", () => {
    const removed: string[] = [];
    const storage = {
      get: vi.fn(() => null),
      set: vi.fn(),
      remove: vi.fn((key: string) => removed.push(key)),
      keys: vi.fn(() => [
        `${SEASON_RECAP_KEY_PREFIX}:league:1`,
        `${ONBOARDING_HELP_KEYS.race}:league`,
        `${ONBOARDING_HELP_KEYS.plan}:league`,
        "cr-league-profile-email"
      ])
    };

    clearStoredUiPreferences(storage);

    expect(storage.remove).toHaveBeenCalledWith(UI_PREFERENCE_KEYS[0]);
    expect(removed).toContain(`${SEASON_RECAP_KEY_PREFIX}:league:1`);
    expect(removed).toContain(`${ONBOARDING_HELP_KEYS.race}:league`);
    expect(removed).toContain(`${ONBOARDING_HELP_KEYS.plan}:league`);
    expect(removed).not.toContain("cr-league-profile-email");
  });

  it("clears the wheel's circuit pool but keeps the names somebody typed", () => {
    const store = new Map<string, string>([
      [WHEEL_REGION_KEY, "europe"],
      ["cr-league-arcade-wheel-participants", '[{"id":"a","name":"Alex"}]']
    ]);
    const storage = {
      get: (key: string) => store.get(key) ?? null,
      set: (key: string, value: string) => void store.set(key, value),
      remove: (key: string) => void store.delete(key),
      keys: () => [...store.keys()]
    };

    clearStoredUiPreferences(storage);

    expect(store.get(WHEEL_REGION_KEY)).toBeUndefined();
    expect(store.get("cr-league-arcade-wheel-participants")).toContain("Alex");
  });
});
