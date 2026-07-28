import { describe, expect, it } from "vitest";
import { createMemoryDb } from "./testMemoryDb.js";

const seedGrandPrix = async (db: ReturnType<typeof createMemoryDb>) => {
  const league = await db.league.create({ data: { name: "Test league", code: "TEST01" } });
  await db.grandPrix.create({
    data: {
      leagueId: league.id,
      name: "Round 1",
      season: 1,
      round: 1,
      seed: "seed-1",
      primaryTrait: "grip",
      secondaryTrait: "attack",
      forecast: { phases: [] }
    }
  });
  return league;
};

describe("createMemoryDb select handling", () => {
  it("returns only the selected fields from grandPrix.findMany", async () => {
    const db = createMemoryDb();
    const league = await seedGrandPrix(db);

    const rows = await db.grandPrix.findMany({
      where: { leagueId: league.id },
      select: { id: true, name: true, season: true, round: true, status: true, result: true }
    });

    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0] ?? {}).sort()).toEqual(["id", "name", "result", "round", "season", "status"]);
  });

  it("returns full rows when no select is requested", async () => {
    const db = createMemoryDb();
    const league = await seedGrandPrix(db);

    const [row] = await db.grandPrix.findMany({ where: { leagueId: league.id } });

    expect(row).toMatchObject({ seed: "seed-1", primaryTrait: "grip", secondaryTrait: "attack" });
  });

  it("honours select on grandPrix.findFirst and team.findUnique", async () => {
    const db = createMemoryDb();
    const league = await seedGrandPrix(db);
    const team = await db.team.create({ data: { leagueId: league.id, name: "Alpha", kind: "human", claimCode: "CLAIM1", points: 0, credits: 0, cards: [] } });

    const grandPrix = await db.grandPrix.findFirst({ where: { leagueId: league.id }, select: { id: true, status: true } });
    const teamRow = await db.team.findUnique({ where: { id: team.id }, select: { id: true, name: true } });

    expect(Object.keys(grandPrix ?? {}).sort()).toEqual(["id", "status"]);
    expect(teamRow).toEqual({ id: team.id, name: "Alpha" });
  });
});

describe("createMemoryDb include handling", () => {
  it("only attaches relations the caller asked for", async () => {
    const db = createMemoryDb();
    const league = await seedGrandPrix(db);
    const team = await db.team.create({ data: { leagueId: league.id, name: "Alpha", kind: "human", claimCode: "CLAIM2", points: 0, credits: 0, cards: [] } });

    const bare = await db.team.findUnique({ where: { id: team.id } });
    const withLeague = await db.team.findUnique({ where: { id: team.id }, include: { league: true } });
    const bareLeague = await db.league.findUnique({ where: { id: league.id } });

    expect(bare).not.toHaveProperty("league");
    expect(withLeague?.league?.id).toBe(league.id);
    expect((bareLeague as Record<string, unknown> | null)?.teams).toBeUndefined();
    expect((bareLeague as Record<string, unknown> | null)?.grandPrixes).toBeUndefined();
  });

  it("honours take on an included grandPrixes relation", async () => {
    const db = createMemoryDb();
    const league = await seedGrandPrix(db);
    await db.grandPrix.create({
      data: { leagueId: league.id, name: "Round 2", season: 1, round: 2, seed: "seed-2", primaryTrait: "grip", secondaryTrait: "attack", forecast: { phases: [] } }
    });

    const withOne = await db.league.findUnique({ where: { id: league.id }, include: { grandPrixes: { orderBy: [{ season: "desc" }, { round: "desc" }], take: 1 } } });

    expect(withOne?.grandPrixes).toHaveLength(1);
    expect(withOne?.grandPrixes?.[0]?.round).toBe(2);
  });
});

describe("createMemoryDb mutation counts", () => {
  it("reports the real number of affected rows", async () => {
    const db = createMemoryDb();
    const league = await seedGrandPrix(db);
    const team = await db.team.create({ data: { leagueId: league.id, name: "Alpha", kind: "human", claimCode: "CLAIM3", points: 0, credits: 0, cards: [] } });
    const grandPrix = await db.grandPrix.findFirst({ where: { leagueId: league.id } });
    await db.raceDecision.upsert({
      where: { grandPrixId_teamId: { grandPrixId: grandPrix!.id, teamId: team.id } },
      update: { approach: "balanced", preparation: "standard", cardId: null, rivalTeamId: null },
      create: { grandPrixId: grandPrix!.id, teamId: team.id, approach: "balanced", preparation: "standard", cardId: null, rivalTeamId: null }
    });

    const deletedDecisions = await db.raceDecision.deleteMany({ where: { grandPrix: { leagueId: league.id } } });
    const deletedGrandPrixes = await db.grandPrix.deleteMany({ where: { leagueId: league.id } });

    expect(deletedDecisions).toEqual({ count: 1 });
    expect(deletedGrandPrixes).toEqual({ count: 1 });
  });
});
