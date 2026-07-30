import { describe, expect, it } from "vitest";
import {
  attackCost,
  counterCall,
  duelGapDuring,
  playerHabit,
  createDuel,
  duelOutcome,
  duelOver,
  duelSwing,
  DUEL_CALLS,
  DUEL_MAX_ENGAGEMENT,
  playDuelRound,
  rivalDuelCall,
  type DuelCall
} from "./duel.js";

const play = (calls: DuelCall[], seed = "duel-1", rival = "gambler" as const) =>
  calls.reduce((duel, call) => playDuelRound(duel, call), createDuel(seed, rival));

describe("duel ring", () => {
  it("has no dominant call: each one beats another and loses to the third", () => {
    for (const [winner, loser] of [["attack", "manage"], ["manage", "cover"], ["cover", "attack"]] as const) {
      expect(duelSwing(winner, loser, "dry"), `${winner} vs ${loser}`).toBeGreaterThan(0);
      expect(duelSwing(loser, winner, "dry"), `${loser} vs ${winner}`).toBeLessThan(0);
    }
  });

  it("is a zero-sum lap: what one takes, the other loses", () => {
    for (const playerCall of DUEL_CALLS) {
      for (const rivalCall of DUEL_CALLS) {
        expect(duelSwing(playerCall, rivalCall, "dry")).toBeCloseTo(-duelSwing(rivalCall, playerCall, "dry"), 5);
      }
    }
  });

  it("pays the driver who closes the door in the wet, and charges the one who attacks", () => {
    expect(duelSwing("attack", "manage", "heavy_rain")).toBeLessThan(duelSwing("attack", "manage", "dry"));
    expect(duelSwing("cover", "attack", "heavy_rain")).toBeGreaterThan(duelSwing("cover", "attack", "dry"));
    expect(attackCost("heavy_rain")).toBeGreaterThan(attackCost("dry"));
  });
});

describe("engagement", () => {
  it("drains on attack and comes back on management, within its bounds", () => {
    const attacked = play(["attack", "attack"]);
    expect(attacked.playerEngagement).toBe(0);

    const refilled = play(["attack", "attack", "manage", "manage", "manage"]);
    expect(refilled.playerEngagement).toBeLessThanOrEqual(DUEL_MAX_ENGAGEMENT);
    expect(refilled.playerEngagement).toBeGreaterThan(0);
  });

  it("punishes an attack made on an empty tank", () => {
    const dry = play(["attack", "attack", "attack"]);
    const last = dry.rounds.at(-1)!;

    expect(dry.rounds[2]!.playerCall).toBe("attack");
    expect(["player", "both"]).toContain(last.overreach);
    // Same calls, but the third one costs instead of paying.
    const paid = duelSwing(last.playerCall, last.rivalCall, "dry");
    expect(last.swing).toBeLessThan(paid);
  });
});

describe("the rival", () => {
  it("plays his archetype: the sprinter opens flat out, the mechanic waits", () => {
    const sprinter = createDuel("read-1", "sprinter");
    const mechanic = { ...createDuel("read-1", "mechanic"), rivalEngagement: 2 };

    expect(rivalDuelCall(sprinter)).toBe("attack");
    expect(rivalDuelCall(mechanic)).not.toBe("attack");
  });

  it("jumps an empty tank when he is the opportunist", () => {
    const duel = { ...createDuel("read-1", "opportunist"), playerEngagement: 0 };

    expect(rivalDuelCall(duel)).toBe("attack");
  });

  it("answers the same for one seed and differs across seeds", () => {
    const calls = (seed: string) => play(["attack", "manage", "cover", "attack"], seed).rounds.map((round) => round.rivalCall).join(",");

    expect(calls("seed-a")).toBe(calls("seed-a"));
    expect(new Set(["seed-a", "seed-b", "seed-c", "seed-d"].map(calls)).size).toBeGreaterThan(1);
  });
});

describe("a duel", () => {
  it("runs its laps and then stops accepting calls", () => {
    const duel = play(Array.from({ length: 8 }, () => "manage" as const));

    expect(duelOver(duel)).toBe(true);
    expect(duel.rounds).toHaveLength(8);
    expect(playDuelRound(duel, "attack")).toBe(duel);
  });

  it("keeps the gap and the lap history in step", () => {
    const duel = play(["attack", "cover", "manage"]);

    expect(duel.lap).toBe(4);
    expect(duel.gap).toBeCloseTo(duel.rounds.reduce((total, round) => total + round.swing, 0), 5);
    expect(duel.rounds.map((round) => round.lap)).toEqual([1, 2, 3]);
  });

  it("gives a dead heat to the rival, since he is the one to beat", () => {
    expect(duelOutcome({ ...createDuel("x", "prudent"), gap: 0 })).toBe("rival");
    expect(duelOutcome({ ...createDuel("x", "prudent"), gap: 0.1 })).toBe("player");
  });
});

describe("what the rival has learned", () => {
  const round = (playerCall: DuelCall, lap: number) => ({ lap, playerCall, rivalCall: "manage" as const, swing: 0, overreach: null });

  it("spots a habit only when there is one", () => {
    expect(playerHabit([round("attack", 1), round("attack", 2), round("manage", 3), round("attack", 4)])).toBe("attack");
    expect(playerHabit([round("attack", 1), round("cover", 2), round("manage", 3)])).toBe(null);
    expect(playerHabit([round("attack", 1)])).toBe(null);
  });

  it("answers a habit, the student harder than the reckless one", () => {
    const attacking = [round("attack", 1), round("attack", 2), round("attack", 3)];
    const seeds = Array.from({ length: 40 }, (_, index) => `read-${index}`);
    const countered = (rival: "opportunist" | "gambler") =>
      seeds.filter((seed) => rivalDuelCall({ ...createDuel(seed, rival), lap: 4, rounds: attacking }) === counterCall("attack")).length;

    expect(countered("opportunist")).toBeGreaterThan(countered("gambler"));
    expect(countered("opportunist")).toBeGreaterThan(seeds.length / 2);
  });

  it("comes forward when the flag is close and he is losing", () => {
    const losing = { ...createDuel("late-1", "prudent"), lap: 8, gap: 1.2, rounds: Array.from({ length: 7 }, (_, index) => round("manage", index + 1)) };

    expect(rivalDuelCall(losing)).toBe("attack");
  });

  it("shuts the door on a lead worth keeping", () => {
    const leading = { ...createDuel("late-2", "gambler"), lap: 8, gap: -1.2, rounds: Array.from({ length: 7 }, (_, index) => round("manage", index + 1)) };

    expect(rivalDuelCall(leading)).toBe("cover");
  });
});

describe("the lap in between", () => {
  const round = { lap: 1, playerCall: "attack" as const, rivalCall: "cover" as const, swing: -0.6, overreach: null };

  it("starts on the gap the lap opened with and lands on the one it closed with", () => {
    expect(duelGapDuring(round, 1.2, 0)).toBeCloseTo(1.2, 5);
    expect(duelGapDuring(round, 1.2, 1)).toBeCloseTo(0.6, 5);
    // Beyond the lap it holds the finished gap rather than drifting.
    expect(duelGapDuring(round, 1.2, 1.5)).toBeCloseTo(0.6, 5);
  });

  it("lets the lunge arrive before it fails", () => {
    // Mid-lap he is closer than either end of the lap suggests.
    expect(duelGapDuring(round, 1.2, 0.5)).toBeGreaterThan(1.2);
  });

  it("lets the attacker arrive when he is the one attacking", () => {
    const defended = { ...round, playerCall: "cover" as const, rivalCall: "attack" as const, swing: 0.6 };

    expect(duelGapDuring(defended, 1.2, 0.5)).toBeLessThan(1.2 + defended.swing / 2);
  });

  it("never wanders on a lap where both drivers made the same call", () => {
    const mirror = { ...round, playerCall: "manage" as const, rivalCall: "manage" as const, swing: 0 };
    const samples = [0.2, 0.5, 0.8].map((time) => duelGapDuring(mirror, 1, time));

    expect(Math.max(...samples) - 1).toBeLessThan(0.2);
  });
});
