// @vitest-environment node

import { describe, expect, it } from "vitest";
import { simulateRace } from "./simulateRace.js";
import { validateReplayTrace } from "./validateReplayTrace.js";
import type { RaceInput } from "../domain/race.js";
import { CITY_CIRCUIT_IDENTITIES, raceInputFromCircuit, trackSpeedProfileForCircuit, trackZonesForCircuit } from "../domain/circuits.js";

const baseRace: RaceInput = {
  seed: "silver-ridge-001",
  grandPrixName: "Silver Ridge GP",
  primaryTrait: "fast",
  secondaryTrait: "weather_sensitive",
  forecast: {
    dry: 60,
    light_rain: 30,
    heavy_rain: 10
  },
  participants: [
    {
      teamId: "alice",
      teamName: "Alice Racing",
      kind: "human",
      standingsRank: 5,
      decision: {
        approach: "aggressive",
        preparation: "weather",
        cardId: "rain_grip",
        rivalTeamId: "hugo"
      }
    },
    {
      teamId: "hugo",
      teamName: "Hugo GP",
      kind: "human",
      standingsRank: 4,
      decision: {
        approach: "balanced",
        preparation: "speed"
      }
    },
    {
      teamId: "atlas",
      teamName: "Atlas Works",
      kind: "bot",
      standingsRank: 1,
      botArchetype: "prudent",
      decision: {
        approach: "prudent",
        preparation: "reliability"
      }
    },
    {
      teamId: "mika",
      teamName: "Mika Blitz",
      kind: "bot",
      standingsRank: 6,
      botArchetype: "gambler",
      decision: {
        approach: "aggressive",
        preparation: "speed",
        cardId: "launch_boost"
      }
    },
    {
      teamId: "northline",
      teamName: "Northline",
      kind: "bot",
      standingsRank: 3,
      botArchetype: "rain_specialist",
      decision: {
        approach: "balanced",
        preparation: "weather",
        cardId: "fleet_maintenance"
      }
    },
    {
      teamId: "redpeak",
      teamName: "Red Peak",
      kind: "bot",
      standingsRank: 2,
      botArchetype: "sprinter",
      decision: {
        approach: "aggressive",
        preparation: "speed",
        cardId: "fleet_sponsorship"
      }
    }
  ]
};

describe("simulateRace", () => {
  it("is deterministic for the same seed and inputs", () => {
    expect(simulateRace(baseRace)).toEqual(simulateRace(baseRace));
  });

  it("produces classification, events, cards, and report blocks", () => {
    const result = simulateRace(baseRace);

    expect(result.classification).toHaveLength(6);
    expect(result.events.length).toBeGreaterThan(6);
    expect(result.replayTrace).toHaveLength(106);
    expect(result.replayTrace?.[0]?.progress).toBe(0);
    expect(result.replayTrace?.some((point) => point.progress === 0.01)).toBe(true);
    expect(result.replayTrace?.some((point) => point.progress === 0.2)).toBe(true);
    expect(new Set(Object.values(result.replayTrace?.[0]?.gaps ?? {}))).toEqual(new Set([0]));
    const firstDelayPoint = result.replayTrace?.find((point) => point.progress > 0);
    expect(firstDelayPoint?.cars?.atlas?.trackProgress).toBeGreaterThan(result.replayTrace?.[0]?.cars?.atlas?.trackProgress ?? -1);
    expect(firstDelayPoint?.cars?.redpeak?.phase).toBe("grid");
    expect(firstDelayPoint?.cars?.redpeak?.trackProgress).toBe(0);
    expect(result.replayTrace?.at(-1)?.progress).toBe(1);
    expect(result.replayTrace?.at(-1)?.distanceMeters).toBe(3200);
    expect(result.replayTrace?.at(-1)?.order).toEqual(result.classification.map((entry) => entry.teamId));
    expect(result.replayTrace?.at(-1)?.times[result.classification[0]!.teamId]).toBeGreaterThan(0);
    expect(result.replayTrace?.at(-1)?.gaps[result.classification[0]!.teamId]).toBe(0);
    expect(new Set(Object.values(result.replayTrace?.[0]?.cars ?? {}).map((car) => car.trackProgress))).toEqual(new Set([0]));
    expect(validateReplayTrace(result)).toEqual([]);
    expect(result.replayFacts?.version).toBe(1);
    expect(result.replayFacts?.orderChanges.every((fact) => fact.type === "order_change" && fact.progress >= 0 && fact.progress <= 1)).toBe(true);
    expect(result.replayFacts?.directorBeats?.map((beat) => beat.type)).toEqual(expect.arrayContaining(["grid_start", "pit_stop", "final"]));
    expect(result.replayTrace?.some((point) => Object.values(point.cars ?? {}).some((car) => car.phase.startsWith("overtake")))).toBe(true);
    expect(result.replayTrace?.some((point) => Object.values(point.cars ?? {}).some((car) => car.phase === "launch"))).toBe(true);
    expect(result.replayTrace?.some((point) => Object.values(point.cars ?? {}).some((car) => car.phase === "defending"))).toBe(true);
    expect(result.events.filter((event) => event.type === "pit_stop")).toHaveLength(6);
    expect(result.events.filter((event) => event.type === "pit_stop").every((event) => typeof event.traceProgress === "number")).toBe(true);
    expect(result.events.every((event) => typeof event.traceProgress === "number" && event.traceProgress >= 0 && event.traceProgress <= 1)).toBe(true);
    expect(result.consumedCards).toEqual(
      expect.arrayContaining([
        { teamId: "alice", cardId: "rain_grip" },
        { teamId: "mika", cardId: "launch_boost" },
        { teamId: "northline", cardId: "fleet_maintenance" },
        { teamId: "redpeak", cardId: "fleet_sponsorship" }
      ])
    );
    expect(result.report.blocks).toHaveLength(2);
  });

  it("applies pit strategy stop counts", () => {
    const input: RaceInput = {
      ...baseRace,
      laps: 13,
      pitLaneProgress: 0.92,
      participants: baseRace.participants.map((participant, index) => ({
        ...participant,
        decision: {
          ...participant.decision,
          pitStrategy: index === 0 ? "heavy_pack" : index === 1 ? "mini_pack" : "standard"
        }
      }))
    };

    const result = simulateRace(input);
    const stops = result.events.filter((event) => event.type === "pit_stop");

    expect(stops.filter((event) => event.teamId === "alice")).toHaveLength(0);
    expect(stops.filter((event) => event.teamId === "hugo")).toHaveLength(2);
    expect(stops.filter((event) => event.teamId === "atlas")).toHaveLength(1);
    expect(stops.find((event) => event.teamId === "hugo")?.reportText).toContain("4.0s");
    expect(stops.find((event) => event.teamId === "atlas")?.reportText).toContain("6.0s");
    expect(validateReplayTrace(result)).toEqual([]);
    const atlasPitStop = result.replayTrace?.find((point) => point.cars?.atlas?.phase === "pit_stop")?.cars?.atlas;
    expect(((atlasPitStop?.trackProgress ?? 0) * 13) % 1).toBeCloseTo(0.92);
    const atlasPitPoints = result.replayTrace?.filter((point) => point.cars?.atlas?.phase === "pit_stop") ?? [];
    expect(atlasPitPoints.length).toBeGreaterThan(0);
    expect(new Set(atlasPitPoints.map((point) => point.cars?.atlas?.trackProgress))).toHaveLength(1);
  });

  it("makes circuit traits favor distinct setup pressures", () => {
    const participants: RaceInput["participants"] = [
      { teamId: "heavy", teamName: "Heavy", kind: "human", standingsRank: 1, decision: { approach: "prudent", preparation: "reliability", pitStrategy: "heavy_pack" } },
      { teamId: "attack", teamName: "Attack", kind: "human", standingsRank: 2, decision: { approach: "aggressive", preparation: "speed", pitStrategy: "mini_pack" } },
      { teamId: "grip", teamName: "Grip", kind: "human", standingsRank: 3, decision: { approach: "balanced", preparation: "weather", pitStrategy: "standard" } }
    ];
    const race = (
      traits: RaceInput["traits"],
      primaryTrait: RaceInput["primaryTrait"],
      secondaryTrait: RaceInput["secondaryTrait"],
      forecast: RaceInput["forecast"] = { dry: 100, light_rain: 0, heavy_rain: 0 }
    ) =>
      simulateRace({
        ...baseRace,
        seed: "trait-pressure",
        primaryTrait,
        secondaryTrait,
        traits,
        forecast,
        participants
      }).classification[0]!.teamId;

    expect(race({ grip: 25, overtaking: 25, energy: 98 }, "high_wear", "high_wear")).toBe("heavy");
    expect(race({ grip: 45, overtaking: 92, energy: 45 }, "urban", "fast")).toBe("attack");
    expect(race({ grip: 100, overtaking: 25, energy: 35 }, "technical", "weather_sensitive", { dry: 0, light_rain: 0, heavy_rain: 100 })).toBe("grip");
    expect(race({ grip: 45, overtaking: 92, energy: 45 }, "urban", "fast")).toBe(race({ grip: 45, overtaking: 92, energy: 45 }, "urban", "fast"));
  });

  it("stagger pit trace loss when most cars stop together", () => {
    const input: RaceInput = {
      ...baseRace,
      participants: baseRace.participants.map((participant, index) => ({
        ...participant,
        decision: {
          ...participant.decision,
          pitStrategy: index === baseRace.participants.length - 1 ? "heavy_pack" : "standard"
        }
      }))
    };

    const result = simulateRace(input);
    const midOrders = result.replayTrace?.filter((point) => point.segment === "mid").map((point) => point.order.join("|")) ?? [];

    expect(midOrders.length).toBeGreaterThan(0);
    expect(result.events.filter((event) => event.type === "pit_stop")).toHaveLength(baseRace.participants.length - 1);
  });

  it("applies speed profiles in generated replay car traces", () => {
    const input: RaceInput = {
      ...baseRace,
      participants: baseRace.participants.slice(0, 2).map((participant) => ({
        ...participant,
        decision: { ...participant.decision, pitStrategy: "heavy_pack" }
      })),
      speedProfile: [{ kind: "corner", startProgress: 0.2, endProgress: 0.6, factor: 0.5 }]
    };
    const withoutProfile = simulateRace({ ...input, speedProfile: [] });
    const result = simulateRace(input);
    const point = result.replayTrace?.find((candidate) => candidate.progress === 0.04);
    const baselinePoint = withoutProfile.replayTrace?.find((candidate) => candidate.progress === 0.04);
    const leaderId = point?.order[0] ?? "";

    expect(point?.cars?.[leaderId]?.trackProgress).toBeLessThan(baselinePoint?.cars?.[leaderId]?.trackProgress ?? 0);
    expect(validateReplayTrace(result)).toEqual([]);
  });

  it("keeps pit exits monotonic on profiled city circuits", () => {
    const circuit = CITY_CIRCUIT_IDENTITIES.find((candidate) => candidate.layoutKey === "circuit_left_bank_loop")!;
    const result = simulateRace({
      ...baseRace,
      ...raceInputFromCircuit(circuit),
      traits: circuit.traits,
      laps: circuit.laps,
      pitLaneProgress: circuit.pitLaneProgress,
      speedProfile: trackSpeedProfileForCircuit(circuit),
      trackZones: trackZonesForCircuit(circuit),
      participants: baseRace.participants.slice(0, 4).map((participant, index) => ({
        ...participant,
        decision: { ...participant.decision, pitStrategy: index === 0 ? "standard" : "heavy_pack" }
      }))
    });

    expect(result.replayTrace?.some((point) => Object.values(point.cars ?? {}).some((car) => car.phase === "pit_exit"))).toBe(true);
    const pitStop = result.replayTrace?.find((point) => Object.values(point.cars ?? {}).some((car) => car.phase === "pit_stop"));
    const pitCar = Object.values(pitStop?.cars ?? {}).find((car) => car.phase === "pit_stop");

    expect(((pitCar?.trackProgress ?? 0) * circuit.laps) % 1).toBeCloseTo(circuit.pitLaneProgress);
    expect(validateReplayTrace(result)).toEqual([]);
  });

  it("makes rainy replay traces visibly softer through speed profiles", () => {
    const input: RaceInput = {
      ...baseRace,
      participants: baseRace.participants.slice(0, 2).map((participant) => ({
        ...participant,
        decision: { ...participant.decision, pitStrategy: "heavy_pack" }
      })),
      speedProfile: [{ kind: "corner", startProgress: 0.2, endProgress: 0.6, factor: 0.7 }]
    };
    const dry = simulateRace({ ...input, forecast: { dry: 100, light_rain: 0, heavy_rain: 0 } });
    const wet = simulateRace({ ...input, forecast: { dry: 0, light_rain: 0, heavy_rain: 100 } });
    const dryPoint = [...(dry.replayTrace ?? [])].sort((left, right) => Math.abs(left.progress - 0.44) - Math.abs(right.progress - 0.44))[0];
    const wetPoint = [...(wet.replayTrace ?? [])].sort((left, right) => Math.abs(left.progress - 0.44) - Math.abs(right.progress - 0.44))[0];
    const teamId = input.participants[0]!.teamId;

    expect(wetPoint?.cars?.[teamId]?.speed).toBeLessThan(dryPoint?.cars?.[teamId]?.speed ?? 0);
    expect(validateReplayTrace(wet)).toEqual([]);
  });

  it("exposes bounded late-race pace fade in replay traces", () => {
    const input: RaceInput = {
      ...baseRace,
      participants: baseRace.participants.slice(0, 2).map((participant) => ({
        ...participant,
        decision: { ...participant.decision, pitStrategy: "heavy_pack" }
      })),
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 }
    };
    const lowEnergy = simulateRace({ ...input, traits: { grip: 60, overtaking: 60, energy: 40 } });
    const highEnergy = simulateRace({ ...input, traits: { grip: 60, overtaking: 60, energy: 90 } });
    const lowPoint = lowEnergy.replayTrace?.find((point) => point.segment === "late" && point.order[0]);
    const highPoint = highEnergy.replayTrace?.find((point) => point.progress === lowPoint?.progress);
    const teamId = lowPoint?.order[0] ?? "";

    expect(lowPoint?.cars?.[teamId]?.speed).toBeLessThan(highPoint?.cars?.[teamId]?.speed ?? 0);
    expect(validateReplayTrace(lowEnergy)).toEqual([]);
  });

  it("keeps close chrono gaps visible but bounded in generated traces", () => {
    const result = simulateRace({
      ...baseRace,
      participants: baseRace.participants.slice(0, 2).map((participant) => ({
        ...participant,
        decision: { ...participant.decision, pitStrategy: "heavy_pack" }
      }))
    });
    const closePoint = result.replayTrace?.find((point) => {
      const [leader, second] = point.order;
      const gap = second ? point.gaps[second] ?? 99 : 99;
      return point.segment === "early" && gap > 0 && gap < 1 && leader && second;
    });
    const [leader, second] = closePoint?.order ?? [];
    const visualGap = (closePoint?.cars?.[leader ?? ""]?.trackProgress ?? 0) - (closePoint?.cars?.[second ?? ""]?.trackProgress ?? 0);

    expect(visualGap).toBeGreaterThanOrEqual(0.004);
    expect(visualGap).toBeLessThan(0.02);
    expect(validateReplayTrace(result)).toEqual([]);
  });

  it("keeps replay trace movement realistic across generated races", () => {
    const pitStrategies = ["heavy_pack", "standard", "mini_pack"] as const;

    for (let run = 0; run < 20; run += 1) {
      const result = simulateRace({
        ...baseRace,
        seed: `trace-debug-${run}`,
        participants: baseRace.participants.map((participant, index) => ({
          ...participant,
          teamId: `${participant.teamId}-${run}-${index}`,
          decision: { ...participant.decision, pitStrategy: pitStrategies[(run + index) % pitStrategies.length] }
        }))
      });

      expect(validateReplayTrace(result)).toEqual([]);
      for (let index = 1; index < (result.replayTrace?.length ?? 0); index += 1) {
        const previous = result.replayTrace![index - 1]!;
        const point = result.replayTrace![index]!;
        for (const [teamId, car] of Object.entries(point.cars ?? {})) {
          const previousCar = previous.cars?.[teamId];
          if (!previousCar) continue;
          if (previousCar.phase === "grid" || car.phase === "finished") continue;
          const jump = car.trackProgress - previousCar.trackProgress;
          const pitRelated = previousCar.phase.startsWith("pit") || car.phase.startsWith("pit");
          expect(jump).toBeLessThanOrEqual(pitRelated ? 0.025 : 0.035);
          expect(car.speed === 0 && !["grid", "finished", "pit_stop"].includes(car.phase)).toBe(false);
        }
      }
    }
  });

  it("emits card events for played cards", () => {
    const result = simulateRace(baseRace);

    expect(result.events.some((event) => event.cardId === "rain_grip")).toBe(true);
    expect(result.events.some((event) => event.cardId === "fleet_maintenance")).toBe(true);
    expect(result.events.some((event) => event.cardId === "launch_boost")).toBe(true);
    expect(result.events.some((event) => event.cardId === "fleet_sponsorship")).toBe(true);
  });

  it("applies the new race cards", () => {
    const result = simulateRace({
      ...baseRace,
      participants: [
        {
          ...baseRace.participants[0]!,
          teamId: "soft",
          standingsRank: 1,
          decision: { approach: "aggressive", preparation: "speed", cardId: "soft_tires" }
        },
        {
          ...baseRace.participants[1]!,
          teamId: "defense",
          standingsRank: 2,
          decision: { approach: "prudent", preparation: "reliability", cardId: "defensive_order" }
        }
      ]
    });

    expect(result.consumedCards).toEqual(
      expect.arrayContaining([
        { teamId: "soft", cardId: "soft_tires" },
        { teamId: "defense", cardId: "defensive_order" }
      ])
    );
    expect(result.events.some((event) => event.cardId === "soft_tires" && event.positionDelta > 0)).toBe(true);
    expect(result.events.some((event) => event.cardId === "defensive_order" && event.type === "held_position")).toBe(true);
  });

  it("uses card positionDelta in final classification", () => {
    const result = simulateRace({
      ...baseRace,
      seed: "pd-0",
      participants: [
        {
          ...baseRace.participants[0]!,
          teamId: "boost",
          teamName: "Boost GP",
          standingsRank: 2,
          decision: { approach: "prudent", preparation: "reliability", cardId: "launch_boost" }
        },
        {
          ...baseRace.participants[1]!,
          teamId: "plain",
          teamName: "Plain GP",
          standingsRank: 1,
          decision: { approach: "aggressive", preparation: "speed" }
        }
      ]
    });

    expect(result.events).toContainEqual(expect.objectContaining({ teamId: "boost", cardId: "launch_boost", positionDelta: 8 }));
    expect(result.classification[0]?.teamId).toBe("boost");
  });

  it("applies the extended race cards", () => {
    const participants = [
      { teamId: "wing", teamName: "Wing GP", cardId: "adjustable_wing" },
      { teamId: "mapping", teamName: "Mapping GP", cardId: "rain_mapping" },
      { teamId: "economy", teamName: "Economy GP", cardId: "economy_mode" },
      { teamId: "relay", teamName: "Relay GP", cardId: "pit_relay" },
      { teamId: "hard", teamName: "Hard GP", cardId: "hard_tires" },
      { teamId: "attack", teamName: "Attack GP", cardId: "calculated_attack" }
    ] as const;
    const result = simulateRace({
      ...baseRace,
      seed: "extended-cards",
      primaryTrait: "fast",
      secondaryTrait: "urban",
      forecast: { dry: 0, light_rain: 100, heavy_rain: 0 },
      participants: participants.map((participant, index) => ({
        teamId: participant.teamId,
        teamName: participant.teamName,
        kind: "human",
        standingsRank: index + 1,
        decision: { approach: "balanced", preparation: "speed", cardId: participant.cardId }
      }))
    });

    for (const participant of participants) {
      expect(result.consumedCards).toContainEqual({ teamId: participant.teamId, cardId: participant.cardId });
      expect(result.events.some((event) => event.cardId === participant.cardId)).toBe(true);
    }
  });

  it("adds minor race notes to make replay less repetitive", () => {
    const result = simulateRace(baseRace);

    expect(result.events.filter((event) => event.type === "race_note")).toHaveLength(4);
    expect(result.events.some((event) => event.severity === "minor" && event.tags.includes("flavor"))).toBe(true);
  });

  it("adds replay mini info toasts around race context", () => {
    const result = simulateRace({
      ...baseRace,
      seed: "mini-info-toasts",
      forecast: { dry: 0, light_rain: 100, heavy_rain: 0 },
      participants: baseRace.participants.map((participant, index) => ({
        ...participant,
        decision: {
          ...participant.decision,
          approach: index === 0 ? "aggressive" : participant.decision.approach,
          preparation: index === 0 ? "speed" : participant.decision.preparation,
          pitStrategy: index === 0 ? "mini_pack" : "standard"
        }
      }))
    });
    const miniTypes = new Set(result.events.filter((event) => event.tags.includes("mini_info")).map((event) => event.type));

    expect([...miniTypes].sort()).toEqual(expect.arrayContaining([
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
      "penalty_risk"
    ]));
  });

  it("annotates race events and replay facts with canonical track zones", () => {
    const circuit = CITY_CIRCUIT_IDENTITIES[0];
    const result = simulateRace({
      ...baseRace,
      ...raceInputFromCircuit(circuit),
      traits: circuit.traits,
      laps: circuit.laps,
      pitLaneProgress: circuit.pitLaneProgress,
      trackZones: trackZonesForCircuit(circuit)
    });
    const pitEvent = result.events.find((event) => event.type === "pit_stop");
    const pitBeat = result.replayFacts?.directorBeats?.find((beat) => beat.type === "pit_stop");

    expect(result.events.every((event) => typeof event.trackProgress === "number" && event.zoneKind && event.zoneLabel)).toBe(true);
    expect(pitEvent).toMatchObject({ zoneKind: "pit", zoneLabel: "pit_lane" });
    expect(pitBeat).toMatchObject({ zoneKind: "pit", zoneLabel: "pit_lane" });
    expect(result.replayFacts?.orderChanges.every((change) => typeof change.trackProgress === "number" && change.zoneKind && change.zoneLabel)).toBe(true);
  });

  it("uses circuit trait values in race timing", () => {
    const stable = simulateRace({ ...baseRace, traits: { grip: 78, overtaking: 50, energy: 72 } });
    const attack = simulateRace({ ...baseRace, traits: { grip: 50, overtaking: 82, energy: 48 } });

    expect(stable.replayTrace?.at(-1)?.times).not.toEqual(attack.replayTrace?.at(-1)?.times);
  });

  it("keeps positionChange as the pure grid-to-finish delta", () => {
    const result = simulateRace(baseRace);

    for (const entry of result.classification) {
      const gridRank = baseRace.participants.find((participant) => participant.teamId === entry.teamId)?.standingsRank;
      expect(entry.positionChange).toBe((gridRank ?? entry.position) - entry.position);
    }
    expect(result.classification.map((entry) => entry.position + entry.positionChange).sort((left, right) => left - right)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("keeps replay finish crossings aligned with final classification", () => {
    const result = simulateRace({
      ...baseRace,
      seed: "finish-order-debug",
      primaryTrait: "high_wear",
      secondaryTrait: "technical",
      traits: { grip: 80, overtaking: 40, energy: 80 },
      laps: 5,
      participants: [
        { teamId: "fast-low", teamName: "Fast Low", kind: "human", standingsRank: 1, decision: { approach: "aggressive", preparation: "speed", pitStrategy: "standard" } },
        { teamId: "slow-high", teamName: "Slow High", kind: "human", standingsRank: 2, decision: { approach: "prudent", preparation: "reliability", pitStrategy: "heavy_pack" } },
        { teamId: "mid", teamName: "Mid", kind: "human", standingsRank: 3, decision: { approach: "balanced", preparation: "weather", pitStrategy: "standard" } }
      ]
    });
    const finalTimes = result.replayTrace?.at(-1)?.times ?? {};
    const classified = result.classification.map((entry) => entry.teamId);

    expect(classified).toHaveLength(3);
    const classifiedTimes = classified.map((teamId) => finalTimes[teamId] ?? 0);
    expect(classifiedTimes).toEqual([...classifiedTimes].sort((left, right) => left - right));
    for (const point of result.replayTrace ?? []) {
      const finished = classified.filter((teamId) => point.cars?.[teamId]?.phase === "finished");
      expect(finished).toEqual(classified.slice(0, finished.length));
    }
    expect(validateReplayTrace(result)).toEqual([]);
  });

  it("covers forced risk scare and mechanic save branches", () => {
    const risky: RaceInput = {
      ...baseRace,
      participants: [
        {
          ...baseRace.participants[0]!,
          teamId: "scare",
          teamName: "Scare GP",
          standingsRank: 1,
          decision: { approach: "aggressive", preparation: "speed" }
        },
        {
          ...baseRace.participants[1]!,
          teamId: "save",
          teamName: "Save GP",
          standingsRank: 2,
          decision: { approach: "aggressive", preparation: "speed", cardId: "fleet_maintenance" }
        }
      ]
    };
    const result = simulateRace({ ...risky, seed: "risk-106" });

    expect(result.events.some((event) => event.teamId === "scare" && event.type === "mechanical_scare")).toBe(true);
    expect(result.events.some((event) => event.teamId === "save" && event.type === "mechanic_save")).toBe(true);
  });
});
