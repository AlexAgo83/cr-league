import { describe, expect, it } from "vitest";
import { TEAM_NAME_SUGGESTIONS } from "./teamNames.js";

describe("TEAM_NAME_SUGGESTIONS", () => {
  it("keeps the merged player and bot team name pool unique", () => {
    expect(TEAM_NAME_SUGGESTIONS).toHaveLength(100);
    expect(new Set(TEAM_NAME_SUGGESTIONS).size).toBe(100);
  });
});
