import { describe, expect, it } from "vitest";
import type { RaceEvent } from "../../app/helpers.js";
import { momentCard } from "./replayMoment.js";

const names = new Map([["team_1", "Volt Union"]]);
const tt = ((key: string) => key) as never;

const event = (overrides: Partial<RaceEvent> = {}): RaceEvent => ({
  id: "event_1",
  order: 1,
  segment: "start",
  lap: 1,
  type: "pace_gain",
  teamId: "team_1",
  severity: "minor",
  positionDelta: 0,
  tags: [],
  ...overrides
}) as RaceEvent;

describe("momentCard context", () => {
  it("prefers the qualifying tag over every other context", () => {
    expect(momentCard(event({ tags: ["qualifying_pace"], cardId: "rain_grip" }), names, tt).context).toBe("event_qualifying_pace");
  });

  it("falls back through card, weather, pit stop, mini info, then team name", () => {
    expect(momentCard(event({ cardId: "rain_grip" }), names, tt).context).toBe("card_rain_grip");
    expect(momentCard(event({ type: "weather_change" }), names, tt).context).toBe("event_weather_change");
    expect(momentCard(event({ type: "pit_stop" }), names, tt).context).toBe("event_pit_stop");
    expect(momentCard(event({ type: "race_note" }), names, tt).context).toBe("event_race_note");
    expect(momentCard(event({ tags: ["mini_info"] }), names, tt).context).toBe("event_pace_gain");
    expect(momentCard(event(), names, tt).context).toBe("Volt Union");
  });

  it("uses an empty team name for mini info without a qualifying tag", () => {
    expect(momentCard(event({ tags: ["mini_info"] }), names, tt).team).toBe("");
    expect(momentCard(event({ tags: ["mini_info", "qualifying_final"] }), names, tt).team).toBe("Volt Union");
    expect(momentCard(event({ teamId: "unknown" }), names, tt).team).toBe("");
  });
});

describe("momentCard impact", () => {
  it("signs a position delta and labels it as a boost only for card events", () => {
    expect(momentCard(event({ positionDelta: 2 }), names, tt).impact).toBe("+2 replay_moment_position");
    expect(momentCard(event({ positionDelta: -1 }), names, tt).impact).toBe("-1 replay_moment_position");
    expect(momentCard(event({ positionDelta: 2, cardId: "rain_grip" }), names, tt).impact).toBe("+2 replay_moment_boost");
  });

  it("falls back through pit stop, qualifying, severity, then ambience", () => {
    expect(momentCard(event({ type: "pit_stop" }), names, tt).impact).toBe("replay_director_pit_stop");
    expect(momentCard(event({ tags: ["qualifying_start"] }), names, tt).impact).toBe("event_qualifying_split");
    expect(momentCard(event({ severity: "major" }), names, tt).impact).toBe("event_major");
    expect(momentCard(event(), names, tt).impact).toBe("event_ambience");
  });
});

describe("momentCard icon", () => {
  it("picks an icon per event kind", () => {
    expect(momentCard(event({ tags: ["weather"] }), names, tt).icon).toBe("light_rain");
    expect(momentCard(event({ type: "weather_change" }), names, tt).icon).toBe("light_rain");
    expect(momentCard(event({ type: "pit_stop" }), names, tt).icon).toBe("energy");
    expect(momentCard(event({ cardId: "rain_grip" }), names, tt).icon).toBe("card");
    expect(momentCard(event({ positionDelta: 3 }), names, tt).icon).toBe("position");
    expect(momentCard(event({ positionDelta: -3 }), names, tt).icon).toBe("dot");
    expect(momentCard(event(), names, tt).icon).toBe("dot");
  });
});
