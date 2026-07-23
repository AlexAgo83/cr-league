// @vitest-environment node

import { describe, expect, it } from "vitest";
import { CARD_DEFINITIONS } from "../cards/definitions.js";
import { RACE_APPROACHES, TECHNICAL_PREPARATIONS, PIT_STRATEGIES, type RaceInput } from "../domain/race.js";
import { createChronoFinalTimes, createChronoReplayTrace, createChronoScores, motionParametersForDecision } from "./chronoRaceEngine.js";

const baseParticipant: RaceInput["participants"][number] = {
  teamId: "atlas",
  teamName: "Atlas Works",
  kind: "human",
  standingsRank: 1,
  decision: { approach: "balanced", preparation: "speed", pitStrategy: "standard" }
};

const baseRace: RaceInput = {
  seed: "chrono-engine-module",
  grandPrixName: "Chrono Engine GP",
  primaryTrait: "fast",
  secondaryTrait: "technical",
  forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
  participants: [
    baseParticipant,
    {
      teamId: "bravo",
      teamName: "Bravo",
      kind: "human",
      standingsRank: 2,
      decision: { approach: "prudent", preparation: "reliability", pitStrategy: "standard" }
    }
  ]
};

describe("chronoRaceEngine", () => {
  it("maps every decision and card path into bounded motion parameters", () => {
    const baseline = motionParametersForDecision(baseParticipant);
    const changedKeys = (parameters: typeof baseline) =>
      Object.entries(parameters).filter(([key, value]) => value !== baseline[key as keyof typeof baseline]).map(([key]) => key);

    for (const approach of RACE_APPROACHES.filter((approach) => approach !== "balanced")) {
      expect(changedKeys(motionParametersForDecision({ ...baseParticipant, decision: { approach, preparation: "speed", pitStrategy: "standard" } }))).not.toHaveLength(0);
    }
    for (const preparation of TECHNICAL_PREPARATIONS.filter((preparation) => preparation !== "speed")) {
      expect(changedKeys(motionParametersForDecision({ ...baseParticipant, decision: { approach: "balanced", preparation, pitStrategy: "standard" } }))).not.toHaveLength(0);
    }
    for (const pitStrategy of PIT_STRATEGIES.filter((pitStrategy) => pitStrategy !== "standard")) {
      expect(changedKeys(motionParametersForDecision({ ...baseParticipant, decision: { approach: "balanced", preparation: "speed", pitStrategy } }))).not.toHaveLength(0);
    }
    for (const cardId of Object.keys(CARD_DEFINITIONS) as Array<keyof typeof CARD_DEFINITIONS>) {
      expect(changedKeys(motionParametersForDecision({ ...baseParticipant, decision: { approach: "balanced", preparation: "speed", pitStrategy: "standard", cardId } }))).not.toHaveLength(0);
    }

    for (const value of Object.values(motionParametersForDecision({ ...baseParticipant, decision: { approach: "aggressive", preparation: "speed", cardId: "launch_boost" } }))) {
      expect(value).toBeGreaterThanOrEqual(0.72);
      expect(value).toBeLessThanOrEqual(1.28);
    }
  });

  it("creates deterministic finite chrono finish times from sampled circuit motion factors", () => {
    const states = baseRace.participants.map((participant) => ({
      participant,
      scores: createChronoScores(participant),
      elapsedTime: Math.max(0, participant.standingsRank - 1) * 0.25,
      positionDelta: 0,
      resultTags: new Set<string>()
    }));
    const options = {
      trackLengthMeters: 3200,
      laps: 10,
      speedProfile: [{ startProgress: 0.2, endProgress: 0.35, factor: 0.76, kind: "corner" as const }],
      weather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" } as const,
      input: baseRace,
      next: () => 0.5,
      baseReplaySeconds: 142,
      defaultTrackLengthMeters: 3200,
      gridGapSeconds: 0.25
    };

    expect(createChronoFinalTimes(states, [], options)).toEqual(createChronoFinalTimes(states, [], options));
    for (const time of createChronoFinalTimes(states, [], options).values()) {
      expect(Number.isFinite(time)).toBe(true);
      expect(time).toBeGreaterThan(1);
    }
  });

  it("captures replay cars from deterministic sampled time-distance motion state", () => {
    const states = [
      ...baseRace.participants,
      { ...baseRace.participants[1]!, teamId: "charlie", teamName: "Charlie", standingsRank: 3 }
    ].map((participant, index) => ({
      participant,
      scores: createChronoScores(participant),
      elapsedTime: index === 0 ? 120 : 122,
      positionDelta: 0,
      resultTags: new Set<string>()
    }));
    const trace = createChronoReplayTrace(states, {
      classification: [
        { position: 1, teamId: "atlas", teamName: "Atlas Works", points: 25, credits: 40, score: 100, positionChange: 0, status: "finished", resultTags: [] },
        { position: 2, teamId: "bravo", teamName: "Bravo", points: 18, credits: 30, score: 90, positionChange: 0, status: "finished", resultTags: [] },
        { position: 3, teamId: "charlie", teamName: "Charlie", points: 15, credits: 25, score: 80, positionChange: 0, status: "finished", resultTags: [] }
      ],
      snapshots: [{ segment: "mid", pitCosts: new Map([["atlas", 6]]) }],
      trackLengthMeters: 3200,
      laps: 10,
      pitLaneProgress: 0.5,
      speedProfile: [{ startProgress: 0.2, endProgress: 0.35, factor: 0.76, kind: "corner" }],
      weather: { start: "dry", early: "dry", mid: "light_rain", late: "dry", finish: "dry" },
      energy: 62,
      replayStepsPerSegment: 20,
      gridGapSeconds: 0.25
    });

    expect(trace.at(-1)?.order).toEqual(["atlas", "bravo", "charlie"]);
    expect(trace.find((point) => point.cars?.bravo?.phase === "launch")?.cars?.bravo?.trackProgress).toBeGreaterThan(0);
    expect(trace.some((point) => point.cars?.atlas?.phase === "pit_stop")).toBe(true);
    expect(trace.some((point) => (point.cars?.atlas?.speed ?? 0) > 0 && (point.cars?.atlas?.speed ?? 0) < 1)).toBe(true);
    for (let index = 1; index < trace.length; index += 1) {
      expect(trace[index]!.cars!.atlas!.trackProgress).toBeGreaterThanOrEqual(trace[index - 1]!.cars!.atlas!.trackProgress);
    }
  });
});
