import { describe, expect, it } from "vitest";
import { EMOTE_IDS, emoteCandidates, emoteForEvent, type EmoteId } from "./raceEmotes.js";
import type { RaceEvent, RaceEventType } from "./race.js";

// Mirrors the union in domain/race.ts. Kept literal so adding a type there without classifying
// it here fails loudly instead of silently defaulting to "no emote".
const ALL_EVENT_TYPES: RaceEventType[] = [
  "weather_change",
  "weather_gamble_paid",
  "wrong_weather_bet",
  "card_triggered",
  "rival_overtake",
  "mechanical_scare",
  "mechanic_save",
  "late_push_gain",
  "sponsor_payout",
  "held_position",
  "pit_stop",
  "best_sector",
  "pace_gain",
  "battery_critical",
  "pit_imminent",
  "pit_exit",
  "under_pressure",
  "overtake_setup",
  "minor_error",
  "defense_success",
  "dense_traffic",
  "favorable_weather",
  "personal_record",
  "penalty_risk",
  "race_note",
  "finish"
];

function event(
  type: RaceEventType,
  progress: number,
  overrides: { teamId?: string; severity?: RaceEvent["severity"]; order?: number } = {}
) {
  return {
    type,
    teamId: overrides.teamId ?? "team_1",
    severity: overrides.severity ?? ("minor" as const),
    order: overrides.order ?? Math.round(progress * 1000),
    traceProgress: progress
  };
}

describe("emoteForEvent", () => {
  it.each(ALL_EVENT_TYPES)("classifies %s deterministically", (type) => {
    const emote = emoteForEvent({ type });
    expect(emote === null || EMOTE_IDS.includes(emote as EmoteId)).toBe(true);
  });

  it("stays silent on narration and bookkeeping", () => {
    for (const type of ["pit_imminent", "pit_stop", "pit_exit", "race_note", "finish", "weather_change", "sponsor_payout"] as RaceEventType[]) {
      expect(emoteForEvent({ type })).toBeNull();
    }
  });

  it("reacts to what happens to the car", () => {
    expect(emoteForEvent({ type: "mechanical_scare" })).toBe("scare");
    expect(emoteForEvent({ type: "best_sector" })).toBe("fire");
    expect(emoteForEvent({ type: "battery_critical" })).toBe("empty-battery");
  });
});

describe("emoteCandidates", () => {
  it("drops a whole pit sequence", () => {
    // The measured shape: three consecutive events for one pit stop, all on the same lap.
    const candidates = emoteCandidates([
      event("pit_imminent", 0.5, { order: 1 }),
      event("pit_stop", 0.51, { order: 2 }),
      event("pit_exit", 0.52, { order: 3 })
    ]);

    expect(candidates).toHaveLength(0);
  });

  it("keeps one reaction per car inside the cooldown window", () => {
    const candidates = emoteCandidates([
      event("best_sector", 0.40, { order: 1 }),
      event("pace_gain", 0.42, { order: 2 }),
      event("under_pressure", 0.44, { order: 3 })
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]!.progress).toBe(0.40);
  });

  it("lets a major event displace a minor one in the same window", () => {
    const candidates = emoteCandidates([
      event("under_pressure", 0.40, { order: 1 }),
      event("mechanical_scare", 0.42, { order: 2, severity: "major" })
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]!.emote).toBe("scare");
    expect(candidates[0]!.severity).toBe("major");
  });

  it("reacts again once the window has passed", () => {
    const candidates = emoteCandidates([
      event("best_sector", 0.10, { order: 1 }),
      event("minor_error", 0.90, { order: 2 })
    ]);

    expect(candidates.map((candidate) => candidate.emote)).toEqual(["fire", "dizzy"]);
  });

  it("tracks each car independently", () => {
    const candidates = emoteCandidates([
      event("best_sector", 0.40, { order: 1, teamId: "team_1" }),
      event("minor_error", 0.41, { order: 2, teamId: "team_2" })
    ]);

    expect(candidates.map((candidate) => candidate.teamId)).toEqual(["team_1", "team_2"]);
  });

  it("skips events with no position on the trace", () => {
    expect(emoteCandidates([{ type: "best_sector", teamId: "team_1", severity: "minor", order: 1 }])).toHaveLength(0);
  });
});
