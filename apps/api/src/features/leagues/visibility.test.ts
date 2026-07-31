import type { LeagueState } from "@cr-league/shared";
import { describe, expect, it } from "vitest";
import { canRevealOpponentDecisions, publicLeagueState } from "./visibility.js";

// Only the fields these two read. The full shape is the API's business; what is under test here is
// which decisions a caller is allowed to see.
const state = (status: string, decisions: Array<{ teamId: string }>) =>
  ({ currentGrandPrix: { status }, decisions } as unknown as LeagueState);

describe("what a caller may see", () => {
  it("shows nobody's plan to a caller with no team", () => {
    const stripped = publicLeagueState(state("briefing", [{ teamId: "team_1" }, { teamId: "team_2" }]));

    expect(stripped.decisions).toEqual([]);
  });

  it("opens the opponents' plans once the race is resolved, or once you have sent yours", () => {
    expect(canRevealOpponentDecisions(state("resolved", []), "team_1")).toBe(true);
    expect(canRevealOpponentDecisions(state("briefing", [{ teamId: "team_1" }]), "team_1")).toBe(true);
    // Someone else's plan, and the race still to run: not yours to read.
    expect(canRevealOpponentDecisions(state("briefing", [{ teamId: "team_2" }]), "team_1")).toBe(false);
  });
});
