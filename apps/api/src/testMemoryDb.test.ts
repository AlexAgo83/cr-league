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
