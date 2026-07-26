import assert from "node:assert/strict";
import { funScore } from "./playtestBrain.js";
import type { RaceResult } from "../packages/shared/src/index.js";

const base = {
  grandPrixName: "Selftest GP",
  seed: "selftest",
  resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
  consumedCards: [],
  replayTrace: [],
  report: { headline: "", blocks: [] }
} satisfies Omit<RaceResult, "classification" | "events">;

assert.equal(funScore(5, result({ positionChange: 0, positionDelta: 0 }), "player"), 4);
assert.equal(funScore(5, result({ positionChange: 4, positionDelta: 0 }), "player"), 6);
assert.equal(funScore(5, result({ positionChange: 0, positionDelta: 2 }), "player"), 5);
assert.equal(funScore(5, result({ positionChange: 0, positionDelta: -2 }), "player"), 4);

function result(input: { positionChange: number; positionDelta: number }): RaceResult {
  return {
    ...base,
    classification: [
      { position: 5, teamId: "player", teamName: "Player", points: 10, credits: 60, score: 70, positionChange: input.positionChange, status: "finished", resultTags: [] }
    ],
    events: [
      {
        id: "event",
        order: 0,
        segment: "mid",
        lap: 3,
        type: "card_triggered",
        teamId: "player",
        severity: "major",
        positionDelta: input.positionDelta,
        tags: [],
        replayText: "",
        reportText: ""
      }
    ]
  };
}
