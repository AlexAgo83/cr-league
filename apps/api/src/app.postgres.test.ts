import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestApp } from "./app.testHelpers.js";
import { restartLeague } from "./features/leagues/store.js";
import type { Db } from "./features/leagues/types.js";

const run = process.env.POSTGRES_INTEGRATION === "1" ? describe : describe.skip;

run("api app postgres integration", () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "race_decisions", "grand_prixes", "teams", "leagues", "profiles" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("serializes concurrent qualifying attempts against the real row lock", async () => {
    const app = await createTestApp(prisma);
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false, qualifyingAttemptLimit: 1 }
    });
    const created = createResponse.json();
    const payload = {
      teamId: created.player.teamId,
      claimCode: created.player.claimCode,
      approach: "balanced",
      preparation: "weather",
      laps: 1
    };

    const responses = await Promise.all([
      app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload }),
      app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload })
    ]);
    const stateResponse = await app.inject({ method: "GET", url: `/leagues/${created.league.id}` });

    await app.close();

    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 409]);
    expect(stateResponse.json().currentGrandPrix.qualifyingRuns.filter((run: { teamId: string }) => run.teamId === created.player.teamId)).toHaveLength(1);
  });

  it("lets only one concurrent resolve claim the Grand Prix transition", async () => {
    const app = await createTestApp(prisma);
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const proof = { teamId: created.player.teamId, claimCode: created.player.claimCode };
    await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...proof, approach: "balanced", preparation: "weather" }
    });

    const responses = await Promise.all([
      app.inject({ method: "POST", url: `/leagues/${created.league.id}/resolve`, payload: proof }),
      app.inject({ method: "POST", url: `/leagues/${created.league.id}/resolve`, payload: proof })
    ]);

    await app.close();

    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 409]);
  });

  it("keeps concurrent card purchases credit-guarded", async () => {
    const app = await createTestApp(prisma);
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const payload = { teamId: created.player.teamId, claimCode: created.player.claimCode, cardId: "launch_boost" };

    const responses = await Promise.all([
      app.inject({ method: "POST", url: `/leagues/${created.league.id}/cards/buy`, payload }),
      app.inject({ method: "POST", url: `/leagues/${created.league.id}/cards/buy`, payload })
    ]);
    const stateResponse = await app.inject({ method: "GET", url: `/leagues/${created.league.id}` });
    const team = stateResponse.json().teams.find((candidate: { id: string }) => candidate.id === created.player.teamId);

    await app.close();

    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 409]);
    expect(team).toMatchObject({ credits: 0, cards: ["launch_boost"] });
  });

  it("rolls back restartLeague when the replacement Grand Prix insert fails", async () => {
    const app = await createTestApp(prisma);
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const proof = { teamId: created.player.teamId, claimCode: created.player.claimCode };
    await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/resolve`,
      payload: { ...proof, allowDefaults: true }
    });
    await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/next-grand-prix`,
      payload: proof
    });
    const before = (await app.inject({ method: "GET", url: `/leagues/${created.league.id}` })).json();

    await expect(restartLeague(dbWithFailingGrandPrixCreate(prisma), created.league.id, proof)).rejects.toThrow("boom");

    const after = (await app.inject({ method: "GET", url: `/leagues/${created.league.id}` })).json();
    await app.close();

    expect(after.currentGrandPrix).toMatchObject({ id: before.currentGrandPrix.id, season: 1, round: 2 });
    expect(after.grandPrixHistory.map((grandPrix: { id: string }) => grandPrix.id)).toEqual(before.grandPrixHistory.map((grandPrix: { id: string }) => grandPrix.id));
  });
});

function dbWithFailingGrandPrixCreate(prisma: PrismaClient): Db {
  return {
    league: prisma.league,
    grandPrix: prisma.grandPrix,
    team: prisma.team,
    raceDecision: prisma.raceDecision,
    profile: prisma.profile,
    $queryRaw: prisma.$queryRaw.bind(prisma),
    $transaction: async (fn) => prisma.$transaction((tx) => {
      const db = {
        league: tx.league,
        grandPrix: { ...tx.grandPrix, create: async () => { throw new Error("boom"); } },
        team: tx.team,
        raceDecision: tx.raceDecision,
        profile: tx.profile,
        $queryRaw: tx.$queryRaw.bind(tx)
      };
      return fn(db as unknown as Db);
    })
  };
}
