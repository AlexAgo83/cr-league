import { describe, expect, it } from "vitest";
import { createMemoryDb } from "../../testMemoryDb.js";
import { createDemoLeague, rejoinLeague } from "./lifecycle.js";
import { hashRecoveryCode, verifyTeamClaimCode } from "./utils.js";

const legacyTeam = async (db: ReturnType<typeof createMemoryDb>, claimCode: string) => {
  const league = await db.league.create({ data: { name: "Legacy league", code: "LEGACY" } });
  return db.team.create({
    data: { leagueId: league.id, name: "Legacy team", kind: "human", claimCode, points: 0, credits: 0, cards: [] }
  });
};

describe("team claim codes", () => {
  it("stores only a hash for freshly created teams", async () => {
    const db = createMemoryDb();
    const state = await createDemoLeague(db, { name: "Fresh league", teamName: "Fresh team", fillWithBots: false });

    const team = await db.team.findUnique({ where: { id: state!.player!.teamId } });

    expect(team?.claimCode).toBe(null);
    expect(team?.claimCodeHash).toMatch(/^scrypt\$/);
  });

  it("verifies a hashed claim code and rejects a wrong one", async () => {
    const db = createMemoryDb();
    const league = await db.league.create({ data: { name: "Hashed league", code: "HASHED" } });
    const team = await db.team.create({
      data: { leagueId: league.id, name: "Hashed team", kind: "human", claimCode: null, claimCodeHash: await hashRecoveryCode("GOODCODE"), points: 0, credits: 0, cards: [] }
    });

    expect(await verifyTeamClaimCode(db, team, "GOODCODE")).toBe(true);
    expect(await verifyTeamClaimCode(db, team, "BADCODE")).toBe(false);
    expect(await verifyTeamClaimCode(db, team, undefined)).toBe(false);
  });

  it("accepts a pre-migration plaintext claim code once, then upgrades it to a hash", async () => {
    const db = createMemoryDb();
    const team = await legacyTeam(db, "LEGACYCODE");

    expect(await verifyTeamClaimCode(db, team, "LEGACYCODE")).toBe(true);

    const upgraded = await db.team.findUnique({ where: { id: team.id } });
    expect(upgraded?.claimCode).toBe(null);
    expect(upgraded?.claimCodeHash).toMatch(/^scrypt\$/);
    // the same code keeps working, now through the hash path only
    expect(await verifyTeamClaimCode(db, upgraded!, "LEGACYCODE")).toBe(true);
    expect(await verifyTeamClaimCode(db, upgraded!, "LEGACYCOD")).toBe(false);
  });

  it("rejects a wrong claim code against a pre-migration team without upgrading it", async () => {
    const db = createMemoryDb();
    const team = await legacyTeam(db, "LEGACYCODE");

    expect(await verifyTeamClaimCode(db, team, "WRONGCODE")).toBe(false);

    const untouched = await db.team.findUnique({ where: { id: team.id } });
    expect(untouched?.claimCode).toBe("LEGACYCODE");
    expect(untouched?.claimCodeHash).toBe(null);
  });

  it("lets a pre-migration team rejoin its league with the plaintext code", async () => {
    const db = createMemoryDb();
    const team = await legacyTeam(db, "LEGACYCODE");
    await db.grandPrix.create({
      data: { leagueId: team.leagueId, name: "Round 1", season: 1, round: 1, seed: "seed", primaryTrait: "grip", secondaryTrait: "attack", forecast: { phases: [] } }
    });

    const state = await rejoinLeague(db, { teamId: team.id, claimCode: "LEGACYCODE" });
    const rejected = await rejoinLeague(db, { teamId: team.id, claimCode: "NOPE" });

    expect(state?.player?.teamId).toBe(team.id);
    expect(rejected).toBe(null);
  });
});
