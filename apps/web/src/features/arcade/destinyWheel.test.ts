import { describe, expect, it } from "vitest";
import { drawDestinyWheel, wheelLivery } from "./destinyWheel.js";
import type { WheelParticipant } from "./arcadeStorage.js";

const people = ["Alex", "Sam", "Robin", "Chris", "Jules"].map((name, index) => ({ id: `p${index}`, name })) as WheelParticipant[];

function order(seed: string, participants = people) {
  return drawDestinyWheel(participants, seed).result.classification.map((entry) => entry.teamId);
}

describe("destiny wheel draw", () => {
  it("ranks every participant entered", () => {
    const finished = order("draw-1");

    expect(finished).toHaveLength(people.length);
    expect([...finished].sort()).toEqual(people.map((person) => person.id).sort());
  });

  it("answers differently on a second draw", () => {
    // A draw that always gave the same order would not be a draw.
    const orders = ["draw-1", "draw-2", "draw-3", "draw-4"].map((seed) => order(seed).join(","));

    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("repeats itself for one given seed", () => {
    expect(order("draw-1")).toEqual(order("draw-1"));
  });

  it("refuses to draw between fewer than two", () => {
    expect(() => drawDestinyWheel(people.slice(0, 1), "draw-1")).toThrow();
  });

  it("does not favour the order participants were entered in", () => {
    // Whoever is typed first must not tend to win, or the draw is rigged.
    const winners = Array.from({ length: 40 }, (_, index) => order(`draw-${index}`)[0]);

    expect(new Set(winners).size).toBeGreaterThan(1);
    expect(winners.filter((winner) => winner === "p0").length).toBeLessThan(winners.length);
  });

  it("gives a full grid distinguishable colours", () => {
    const liveries = Array.from({ length: 16 }, (_, index) => wheelLivery(index));

    expect(new Set(liveries.map((livery) => livery.primary)).size).toBe(16);
  });

  it("races on a real circuit, with a livery per participant", () => {
    const draw = drawDestinyWheel(people, "draw-1");

    // The polyline itself is loaded lazily by circuitRouteFor and is empty until the browser
    // fills its cache, so what matters here is that a real circuit was picked.
    expect(draw.circuit.layoutKey).toBeTruthy();
    expect(draw.circuit.trackZones.length).toBeGreaterThan(0);
    expect(Object.keys(draw.liveries)).toHaveLength(people.length);
  });
});
