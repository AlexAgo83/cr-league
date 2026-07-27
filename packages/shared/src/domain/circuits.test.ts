// @vitest-environment node

import { describe, expect, it } from "vitest";
import { CITY_CIRCUIT_IDENTITIES, circuitIdentityForRound, circuitSeasonSeed, pitWindowForCircuit, raceInputFromCircuit, seasonCircuitIdentities, trackSpeedProfileForCircuit, trackZonesForCircuit, zoneForRaceSegment, zonesAtProgress } from "./circuits.js";
import { RACE_SEGMENTS } from "./race.js";

describe("circuit identities", () => {
  it("rotates deterministically by round", () => {
    expect(circuitIdentityForRound(1)).toBe(CITY_CIRCUIT_IDENTITIES[0]);
    expect(circuitIdentityForRound(CITY_CIRCUIT_IDENTITIES.length + 1)).toBe(CITY_CIRCUIT_IDENTITIES[0]);
  });

  it("shuffles circuit order per season seed", () => {
    const seasonOne = seasonCircuitIdentities(circuitSeasonSeed("league_1", 1)).map((circuit) => circuit.layoutKey);
    const seasonTwo = seasonCircuitIdentities(circuitSeasonSeed("league_1", 2)).map((circuit) => circuit.layoutKey);
    expect(seasonCircuitIdentities(circuitSeasonSeed("league_1", 1)).map((circuit) => circuit.layoutKey)).toEqual(seasonOne);
    expect(seasonTwo).not.toEqual(seasonOne);
    expect(circuitIdentityForRound(1, circuitSeasonSeed("league_1", 1)).layoutKey).toBe(seasonOne[0]);
  });

  it("does not pin catalog circuits to their original positions across seeded seasons", () => {
    const movableIndexes = new Set(CITY_CIRCUIT_IDENTITIES.map((_, index) => index));
    const firstRoundLayouts = new Set<string>();

    for (let season = 1; season <= 300; season += 1) {
      const order = seasonCircuitIdentities(circuitSeasonSeed(`league_${season}`, season));
      firstRoundLayouts.add(order[0]!.layoutKey);
      for (const [index, circuit] of order.entries()) {
        if (circuit !== CITY_CIRCUIT_IDENTITIES[index]) movableIndexes.delete(index);
      }
    }

    expect(movableIndexes.size).toBe(0);
    expect(firstRoundLayouts.size).toBeGreaterThanOrEqual(CITY_CIRCUIT_IDENTITIES.length - 1);
  });

  it("maps circuit identity to race input traits and forecast", () => {
    expect(raceInputFromCircuit(CITY_CIRCUIT_IDENTITIES[0])).toEqual({
      primaryTrait: "weather_sensitive",
      secondaryTrait: "fast",
      trackLengthMeters: 2800,
      forecast: { dry: 35, light_rain: 50, heavy_rain: 15 }
    });
    expect(raceInputFromCircuit(CITY_CIRCUIT_IDENTITIES[1])).toEqual({
      primaryTrait: "technical",
      secondaryTrait: "urban",
      trackLengthMeters: 2300,
      forecast: { dry: 70, light_rain: 20, heavy_rain: 10 }
    });
  });

  it("includes two Monaco layouts", () => {
    expect(CITY_CIRCUIT_IDENTITIES.filter((circuit) => circuit.city === "Monaco").map((circuit) => circuit.layoutKey)).toEqual([
      "circuit_monaco_harbor_loop",
      "circuit_monaco_casino_sprint"
    ]);
  });

  it("includes Houssam's Cannes street loop", () => {
    expect(CITY_CIRCUIT_IDENTITIES.find((circuit) => circuit.layoutKey === "circuit_cannes_houssam_loop")).toMatchObject({
      city: "Cannes",
      country: "FR",
      laps: 8,
      trackLengthMeters: 5530
    });
  });

  it("adds global city circuits outside the European catalog", () => {
    const globalCircuitKeys = [
      "circuit_tokyo_bay_loop",
      "circuit_rio_flamengo_loop",
      "circuit_cape_town_waterfront_loop",
      "circuit_seoul_yeouido_loop",
      "circuit_montreal_island_loop",
      "circuit_istanbul_bosphorus_loop"
    ];

    expect(globalCircuitKeys.map((layoutKey) => CITY_CIRCUIT_IDENTITIES.find((circuit) => circuit.layoutKey === layoutKey)?.city)).toEqual([
      "Tokyo",
      "Rio de Janeiro",
      "Cape Town",
      "Seoul",
      "Montreal",
      "Istanbul"
    ]);
  });

  it("keeps generated global route lengths in circuit metadata", () => {
    const globalCircuitKeys = [
      "circuit_tokyo_bay_loop",
      "circuit_rio_flamengo_loop",
      "circuit_cape_town_waterfront_loop",
      "circuit_seoul_yeouido_loop",
      "circuit_montreal_island_loop",
      "circuit_istanbul_bosphorus_loop"
    ];

    expect(Object.fromEntries(globalCircuitKeys.map((layoutKey) => {
      const circuit = CITY_CIRCUIT_IDENTITIES.find((candidate) => candidate.layoutKey === layoutKey);
      return [circuit?.city, circuit?.trackLengthMeters];
    }))).toEqual({
      "Cape Town": 5373,
      Istanbul: 6075,
      Montreal: 4185,
      "Rio de Janeiro": 5907,
      Seoul: 3976,
      Tokyo: 5720
    });
  });

  it("includes generated expansion circuits", () => {
    const expansionCircuitKeys = [
      "circuit_danube",
      "circuit_lungomare",
      "circuit_plaka",
      "circuit_esplanadi",
      "circuit_royal_mile",
      "circuit_grand_harbour",
      "circuit_jordaan",
      "circuit_battery",
      "circuit_ocean_drive",
      "circuit_lakefront",
      "circuit_reforma",
      "circuit_dubai_marina",
      "circuit_darling_harbour",
      "circuit_marina",
      "circuit_victoria",
      "circuit_dotonbori",
      "circuit_vieux_port",
      "circuit_embarcadero",
      "circuit_madero",
      "circuit_bund"
    ];

    expect(CITY_CIRCUIT_IDENTITIES.filter((circuit) => expansionCircuitKeys.includes(circuit.layoutKey)).map((circuit) => ({
      city: circuit.city,
      layoutKey: circuit.layoutKey,
      trackLengthMeters: circuit.trackLengthMeters,
      laps: circuit.laps
    }))).toEqual([
      { city: "Budapest", layoutKey: "circuit_danube", trackLengthMeters: 6100, laps: 8 },
      { city: "Naples", layoutKey: "circuit_lungomare", trackLengthMeters: 6116, laps: 8 },
      { city: "Athens", layoutKey: "circuit_plaka", trackLengthMeters: 5969, laps: 8 },
      { city: "Helsinki", layoutKey: "circuit_esplanadi", trackLengthMeters: 6061, laps: 8 },
      { city: "Edinburgh", layoutKey: "circuit_royal_mile", trackLengthMeters: 6035, laps: 8 },
      { city: "Valletta", layoutKey: "circuit_grand_harbour", trackLengthMeters: 4521, laps: 11 },
      { city: "Amsterdam", layoutKey: "circuit_jordaan", trackLengthMeters: 5897, laps: 9 },
      { city: "New York", layoutKey: "circuit_battery", trackLengthMeters: 4380, laps: 11 },
      { city: "Miami", layoutKey: "circuit_ocean_drive", trackLengthMeters: 5725, laps: 9 },
      { city: "Chicago", layoutKey: "circuit_lakefront", trackLengthMeters: 5781, laps: 9 },
      { city: "Mexico City", layoutKey: "circuit_reforma", trackLengthMeters: 5635, laps: 9 },
      { city: "Dubai", layoutKey: "circuit_dubai_marina", trackLengthMeters: 8114, laps: 6 },
      { city: "Sydney", layoutKey: "circuit_darling_harbour", trackLengthMeters: 5694, laps: 9 },
      { city: "Singapore", layoutKey: "circuit_marina", trackLengthMeters: 5148, laps: 10 },
      { city: "Hong Kong", layoutKey: "circuit_victoria", trackLengthMeters: 5459, laps: 9 },
      { city: "Osaka", layoutKey: "circuit_dotonbori", trackLengthMeters: 5188, laps: 10 },
      { city: "Marseille", layoutKey: "circuit_vieux_port", trackLengthMeters: 6385, laps: 8 },
      { city: "San Francisco", layoutKey: "circuit_embarcadero", trackLengthMeters: 4448, laps: 11 },
      { city: "Buenos Aires", layoutKey: "circuit_madero", trackLengthMeters: 4754, laps: 11 },
      { city: "Shanghai", layoutKey: "circuit_bund", trackLengthMeters: 5195, laps: 10 }
    ]);
  });

  it("keeps late extra circuit gameplay categories aligned with their themes", () => {
    expect(Object.fromEntries([
      "circuit_marrakech_heat_ring",
      "circuit_lisbon_tramline",
      "circuit_helsinki_icebreak",
      "circuit_bastia_citadel_loop"
    ].map((layoutKey) => {
      const circuit = CITY_CIRCUIT_IDENTITIES.find((candidate) => candidate.layoutKey === layoutKey)!;
      const input = raceInputFromCircuit(circuit);
      return [layoutKey, [input.primaryTrait, input.secondaryTrait]];
    }))).toEqual({
      circuit_marrakech_heat_ring: ["high_wear", "technical"],
      circuit_lisbon_tramline: ["technical", "urban"],
      circuit_helsinki_icebreak: ["weather_sensitive", "technical"],
      circuit_bastia_citadel_loop: ["technical", "urban"]
    });
  });

  it("derives required track zones for every circuit", () => {
    for (const circuit of CITY_CIRCUIT_IDENTITIES) {
      const zones = trackZonesForCircuit(circuit);
      expect(zones.filter((zone) => zone.kind === "sector")).toHaveLength(RACE_SEGMENTS.length);
      expect(zones.some((zone) => zone.kind === "overtake" && zone.label === "main_straight")).toBe(true);
      expect(zones.some((zone) => zone.kind === "pit" && zone.label === "pit_lane")).toBe(true);
      expect(zones.some((zone) => zone.kind === "technical")).toBe(true);
      expect(zones.every((zone) => zone.startProgress >= 0 && zone.startProgress < 1 && zone.endProgress >= 0 && zone.endProgress < 1)).toBe(true);
    }
  });

  it("derives bounded speed profiles for every circuit", () => {
    for (const circuit of CITY_CIRCUIT_IDENTITIES) {
      const profile = trackSpeedProfileForCircuit(circuit);
      expect(profile.length).toBeGreaterThan(0);
      expect(profile.some((span) => span.kind === "corner" && span.factor < 1)).toBe(true);
      expect(profile.some((span) => span.kind === "straight" && span.factor > 1)).toBe(true);
      expect(profile.every((span) => span.startProgress >= 0 && span.startProgress < 1 && span.endProgress >= 0 && span.endProgress < 1)).toBe(true);
      expect(profile.every((span) => span.factor >= 0.45 && span.factor <= 1.16)).toBe(true);
    }
  });

  it("queries zones by segment and progress", () => {
    expect(zoneForRaceSegment("mid")).toMatchObject({ kind: "sector", label: "sector_mid", startProgress: 0.4, endProgress: 0.6 });
    expect(zonesAtProgress(trackZonesForCircuit(CITY_CIRCUIT_IDENTITIES[0]), 0.45, "sector")).toEqual([zoneForRaceSegment("mid")]);
    expect(zonesAtProgress(trackZonesForCircuit(CITY_CIRCUIT_IDENTITIES[0]), CITY_CIRCUIT_IDENTITIES[0].pitLaneProgress, "pit")).toEqual([pitWindowForCircuit(CITY_CIRCUIT_IDENTITIES[0])]);
  });
});
