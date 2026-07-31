import { describe, expect, it } from "vitest";
import { drawDestinyWheel, wheelCircuit, wheelLivery, wheelShareFromSearch, wheelShareLink, wheelShareSearch } from "./destinyWheel.js";
import { circuitsInRegion, COUNTRY_REGION } from "../../app/circuits.js";
import type { WheelParticipant } from "./arcadeStorage.js";

const people = ["Alex", "Sam", "Robin", "Chris", "Jules"].map((name, index) => ({ id: `p${index}`, name })) as WheelParticipant[];

function order(seed: string, participants = people) {
  return drawDestinyWheel(participants, seed).result.classification.map((entry) => entry.teamId);
}

function grid(seed: string) {
  return drawDestinyWheel(people, seed).result.replayTrace?.[0]?.order ?? [];
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

  it("draws a fresh starting grid for each launch", () => {
    const grids = ["draw-1", "draw-2", "draw-3", "draw-4"].map((seed) => grid(seed).join(","));

    expect(new Set(grids).size).toBeGreaterThan(1);
    expect([...grid("draw-1")].sort()).toEqual(people.map((person) => person.id).sort());
  });

  it("refuses to draw between fewer than two", () => {
    expect(() => drawDestinyWheel(people.slice(0, 1), "draw-1")).toThrow();
  });

  it("does not favour the order participants were entered in", () => {
    // Whoever is typed first must not tend to win, or the draw is rigged. Twelve draws show
    // that plainly; forty ran a full simulation each and timed out on a CI runner under
    // coverage instrumentation, which is slower than a local `npm test`.
    const winners = Array.from({ length: 12 }, (_, index) => order(`draw-${index}`)[0]);

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

  it("draws only inside the chosen region", () => {
    // The pick, not the race: 100 seeds per region cost nothing without a simulation each.
    const seeds = Array.from({ length: 100 }, (_, index) => `region-${index}`);

    for (const region of ["europe", "americas", "asia", "africa", "oceania"] as const) {
      const drawn = seeds.map((seed) => wheelCircuit(seed, region));
      expect(drawn.every((circuit) => COUNTRY_REGION[circuit.country] === region), region).toBe(true);
      // A region holding several circuits must not always answer the same one.
      if (circuitsInRegion(region).length > 1) expect(new Set(drawn.map((circuit) => circuit.layoutKey)).size, region).toBeGreaterThan(1);
    }
  });

  it("reaches outside Europe when no region is chosen", () => {
    const regions = new Set(Array.from({ length: 100 }, (_, index) => COUNTRY_REGION[wheelCircuit(`all-${index}`, "all").country]));

    expect(regions.size).toBeGreaterThan(1);
  });

  it("races the circuit the region drew, not another one", () => {
    // One simulation, covering both wirings: the draw honours the region, and the identity feeding
    // the simulation is the circuit the map draws.
    const draw = drawDestinyWheel(people, "identity-1", "asia");

    expect(COUNTRY_REGION[draw.circuit.country]).toBe("asia");
    expect(draw.circuit.layoutKey).toBe(wheelCircuit("identity-1", "asia").layoutKey);
    expect(draw.result.grandPrixName).toBe(draw.circuit.city);
    expect(draw.result.classification).toHaveLength(people.length);
  });
});

describe("sharing a draw", () => {
  const list = (...names: string[]) => names.map((name, index) => ({ id: `p-${index}`, name }));

  it("carries the list and the pool, and reads them back", () => {
    const search = wheelShareSearch(list("Alex", "Sam"), "europe");

    expect(wheelShareFromSearch(search)).toEqual({ names: ["Alex", "Sam"], region: "europe" });
  });

  it("leaves the pool out when it is every region, since that is the default at the far end", () => {
    expect(wheelShareSearch(list("Alex"), "all")).toBe("?name=Alex");
    expect(wheelShareFromSearch("?name=Alex")).toEqual({ names: ["Alex"], region: "all" });
  });

  it("survives names a URL would otherwise break", () => {
    const search = wheelShareSearch(list("Ana & Bo", "Zoé/Max", "100%"), "all");

    expect(wheelShareFromSearch(search)?.names).toEqual(["Ana & Bo", "Zoé/Max", "100%"]);
  });

  it("refuses a link that carries nothing, or a pool that does not exist", () => {
    expect(wheelShareFromSearch("")).toBe(null);
    expect(wheelShareFromSearch("?region=europe")).toBe(null);
    expect(wheelShareFromSearch("?name=%20%20")).toBe(null);
    expect(wheelShareFromSearch("?name=Alex&region=atlantis")?.region).toBe("all");
  });

  it("keeps a link from being padded past what the wheel accepts", () => {
    const many = list(...Array.from({ length: 40 }, (_, index) => `P${index}`));

    expect(wheelShareFromSearch(wheelShareSearch(many, "all"), 16)?.names).toHaveLength(16);
  });

  it("builds an absolute link on the wheel's own path", () => {
    expect(wheelShareLink(list("Alex", "Sam"), "all", "https://cr-league.example/")).toBe("https://cr-league.example/arcade/wheel?name=Alex&name=Sam");
  });
});
