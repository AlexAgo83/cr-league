// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { ACTIVE_PLAYER_CLAIM_KEY, PLAYER_CLAIMS_KEY } from "../../app/appStorage.js";
import { SOLO_SLOT_INDEX_KEY, SOLO_SLOT_KEY_PREFIX } from "../../app/soloStorage.js";
import { DEFAULT_DUEL_LIVERY, DUEL_LIVERY_KEY, DUEL_REGION_KEY, WHEEL_MAX_PARTICIPANTS, WHEEL_PARTICIPANTS_KEY, addWheelParticipant, loadDuelLivery, loadDuelRegion, loadWheelParticipants, removeWheelParticipant, saveDuelLivery, saveDuelRegion, saveWheelParticipants } from "./arcadeStorage.js";

const people = [
  { id: "p1", name: "Alex" },
  { id: "p2", name: "Sam" }
];

beforeEach(() => {
  localStorage.clear();
});

describe("wheel participants", () => {
  it("restores a validated list on the next visit", () => {
    saveWheelParticipants(people);

    expect(loadWheelParticipants()).toEqual(people);
  });

  it("ignores a corrupt or foreign value instead of throwing", () => {
    localStorage.setItem(WHEEL_PARTICIPANTS_KEY, "{ not json");
    expect(loadWheelParticipants()).toEqual([]);

    localStorage.setItem(WHEEL_PARTICIPANTS_KEY, JSON.stringify([{ id: "p1" }, "nope", { name: "  " }]));
    expect(loadWheelParticipants()).toEqual([]);
  });

  it("stops adding at the grid ceiling", () => {
    let participants = people.slice(0, 0);
    for (let index = 0; index < WHEEL_MAX_PARTICIPANTS + 4; index += 1) {
      participants = addWheelParticipant(participants, `Runner ${index}`);
    }

    expect(participants).toHaveLength(WHEEL_MAX_PARTICIPANTS);
  });

  it("refuses a blank name and trims the rest", () => {
    expect(addWheelParticipant([], "   ")).toEqual([]);
    expect(addWheelParticipant([], "  Alex ")[0]?.name).toBe("Alex");
  });

  it("removes one participant and keeps the others", () => {
    expect(removeWheelParticipant(people, "p1")).toEqual([people[1]]);
  });

  it("does not touch campaign or multiplayer storage", () => {
    localStorage.setItem(`${SOLO_SLOT_KEY_PREFIX}0`, "campaign");
    localStorage.setItem(SOLO_SLOT_INDEX_KEY, "index");
    localStorage.setItem(PLAYER_CLAIMS_KEY, "[]");
    localStorage.setItem(ACTIVE_PLAYER_CLAIM_KEY, "team_1");

    saveWheelParticipants(people);
    loadWheelParticipants();

    expect(localStorage.getItem(`${SOLO_SLOT_KEY_PREFIX}0`)).toBe("campaign");
    expect(localStorage.getItem(SOLO_SLOT_INDEX_KEY)).toBe("index");
    expect(localStorage.getItem(PLAYER_CLAIMS_KEY)).toBe("[]");
    expect(localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY)).toBe("team_1");
  });
});

describe("what a player takes into a duel", () => {
  it("remembers colours and a car, and survives whatever is in storage", () => {
    saveDuelLivery({ primary: "#ff0000", secondary: "#00ff00", carAssetId: "car-009" });
    expect(loadDuelLivery()).toEqual({ primary: "#ff0000", secondary: "#00ff00", carAssetId: "car-009" });

    // A car is optional; colours are not, and neither is being readable at all.
    saveDuelLivery({ primary: "#111111", secondary: "#222222" });
    expect(loadDuelLivery().carAssetId).toBeUndefined();

    localStorage.setItem(DUEL_LIVERY_KEY, "{not json");
    expect(loadDuelLivery()).toEqual(DEFAULT_DUEL_LIVERY);
    localStorage.setItem(DUEL_LIVERY_KEY, JSON.stringify({ primary: 4 }));
    expect(loadDuelLivery()).toEqual(DEFAULT_DUEL_LIVERY);
  });

  it("opens on the starter pack until a pool is picked, and only accepts pools that exist", () => {
    expect(loadDuelRegion()).toBe("starter");

    saveDuelRegion("africa");
    expect(loadDuelRegion()).toBe("africa");

    saveDuelRegion("all");
    expect(loadDuelRegion()).toBe("all");

    localStorage.setItem(DUEL_REGION_KEY, "atlantis");
    expect(loadDuelRegion()).toBe("starter");
  });
});
