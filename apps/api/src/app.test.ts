import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";

describe("api app", () => {
  it("responds to health checks", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:4873"
    });

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      app: "CR League",
      service: "api",
      status: "ok"
    });
  });

  it("returns a demo simulation preview", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:4873"
    });

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview"
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      grandPrixName: "Silver Ridge GP",
      classification: expect.any(Array),
      events: expect.any(Array),
      report: expect.objectContaining({
        headline: expect.any(String)
      })
    });
  });

  it("rejects invalid simulation preview input", async () => {
    const app = await buildApp({
      host: "127.0.0.1",
      port: 0,
      webOrigin: "http://localhost:4873"
    });

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview",
      payload: { seed: "missing-race-shape" }
    });

    await app.close();

    expect(response.statusCode).toBe(400);
  });

  it("creates, updates, and resolves a persisted demo league", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const claim = created.player;
    const createdTeam = created.teams.find((team: { kind: string }) => team.kind === "human");
    const teamId = createdTeam.id;

    const readResponse = await app.inject({
      method: "GET",
      url: `/leagues/${leagueId}`
    });
    const joinResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: created.league.code, teamName: "Late Apex" }
    });

    const decisionResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/decisions`,
      payload: {
        teamId,
        approach: "aggressive",
        preparation: "weather",
        cardId: "rain_grip"
      }
    });

    const resolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`
    });
    const resolved = resolveResponse.json();
    const resolvedTeam = resolved.teams.find((team: { id: string }) => team.id === teamId);

    const buyResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/cards/buy`,
      payload: {
        teamId,
        cardId: "launch_boost"
      }
    });
    const boughtTeam = buyResponse.json().teams.find((team: { id: string }) => team.id === teamId);

    const lateDecisionResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/decisions`,
      payload: {
        teamId,
        approach: "prudent",
        preparation: "reliability"
      }
    });
    const secondResolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`
    });

    await app.close();

    expect(createResponse.statusCode).toBe(200);
    expect(claim).toMatchObject({ teamId, claimCode: expect.any(String) });
    expect(createdTeam.cards).toEqual(["rain_grip"]);
    expect(created.cardShop).toContainEqual({ cardId: "rain_grip", price: 100 });
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json().league).toMatchObject({ id: leagueId, name: "Office League" });
    expect(joinResponse.statusCode).toBe(200);
    expect(decisionResponse.statusCode).toBe(200);
    expect(resolveResponse.statusCode).toBe(200);
    expect(resolved.currentGrandPrix).toMatchObject({
      status: "resolved",
      result: expect.objectContaining({
        classification: expect.any(Array)
      })
    });
    expect(resolvedTeam.cards).not.toContain("rain_grip");
    expect(buyResponse.statusCode).toBe(200);
    expect(boughtTeam.cards).toContain("launch_boost");
    expect(boughtTeam.credits).toBe(resolvedTeam.credits - 100);
    expect(lateDecisionResponse.statusCode).toBe(409);
    expect(secondResolveResponse.statusCode).toBe(409);
  });

  it("rejects resolving before the player submits a directive", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const leagueId = createResponse.json().league.id;

    const resolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`
    });

    await app.close();

    expect(resolveResponse.statusCode).toBe(409);
    expect(resolveResponse.json()).toMatchObject({
      message: "Submit your race directive before launching the Grand Prix."
    });
  });

  it("lets a player join an active league by code", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const code = createResponse.json().league.code;

    const joinResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code, teamName: "Late Apex" }
    });

    await app.close();

    expect(joinResponse.statusCode).toBe(200);
    expect(joinResponse.json().teams).toEqual(expect.arrayContaining([expect.objectContaining({ name: "Late Apex", kind: "human" })]));
  });

  it("rejects unknown, duplicate, and closed league joins", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const code = created.league.code;
    const teamId = created.teams.find((team: { kind: string }) => team.kind === "human").id;

    const unknownResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: "NOPE00", teamName: "Ghost Team" }
    });
    const duplicateResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code, teamName: "Circle One" }
    });
    await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/decisions`,
      payload: {
        teamId,
        approach: "balanced",
        preparation: "weather"
      }
    });
    await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`
    });
    const closedResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code, teamName: "Late Apex" }
    });

    await app.close();

    expect(unknownResponse.statusCode).toBe(404);
    expect(duplicateResponse.statusCode).toBe(409);
    expect(closedResponse.statusCode).toBe(409);
  });

  it("rejoins a claimed team, advances to the next Grand Prix, and can resolve with default decisions", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const teamId = created.player.teamId;

    const rejoinResponse = await app.inject({
      method: "POST",
      url: "/leagues/rejoin",
      payload: created.player
    });
    const badRejoinResponse = await app.inject({
      method: "POST",
      url: "/leagues/rejoin",
      payload: { teamId, claimCode: "WRONG" }
    });
    const defaultResolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`,
      payload: { allowDefaults: true }
    });
    const nextResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`
    });
    const earlyNextResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`
    });
    const restartResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/restart`
    });

    await app.close();

    expect(rejoinResponse.statusCode).toBe(200);
    expect(rejoinResponse.json().player).toMatchObject(created.player);
    expect(badRejoinResponse.statusCode).toBe(404);
    expect(defaultResolveResponse.statusCode).toBe(200);
    expect(defaultResolveResponse.json().currentGrandPrix.status).toBe("resolved");
    expect(nextResponse.statusCode).toBe(200);
    expect(nextResponse.json().currentGrandPrix).toMatchObject({ round: 2, status: "briefing", result: null });
    expect(nextResponse.json().grandPrixHistory.map((grandPrix: { round: number }) => grandPrix.round)).toEqual([2, 1]);
    expect(nextResponse.json().actionState).toMatchObject({
      submittedTeamIds: [],
      missingTeamIds: expect.arrayContaining([teamId]),
      canResolve: false,
      canStartNextGrandPrix: false,
      nextAction: "wait_for_directives"
    });
    expect(earlyNextResponse.statusCode).toBe(409);
    expect(restartResponse.statusCode).toBe(200);
    expect(restartResponse.json().currentGrandPrix).toMatchObject({ round: 1, status: "briefing", result: null });
    expect(restartResponse.json().grandPrixHistory.map((grandPrix: { round: number }) => grandPrix.round)).toEqual([1]);
    expect(restartResponse.json().teams.find((team: { id: string }) => team.id === teamId)).toMatchObject({
      points: 0,
      credits: 0,
      cards: ["rain_grip"]
    });
  });

  it("updates private league cadence and preparation deadline", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const leagueId = createResponse.json().league.id;
    const deadline = new Date(Date.now() + 60_000).toISOString();

    const settingsResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/settings`,
      payload: { cadence: "weekly", preparationDeadlineAt: deadline }
    });
    const invalidSettingsResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/settings`,
      payload: { cadence: "always_on" }
    });

    await app.close();

    expect(settingsResponse.statusCode).toBe(200);
    expect(settingsResponse.json().league).toMatchObject({
      cadence: "weekly",
      preparationDeadlineAt: deadline
    });
    expect(invalidSettingsResponse.statusCode).toBe(409);
  });

  it("runs a three Grand Prix private league scenario", async () => {
    const app = await buildApp(
      {
        host: "127.0.0.1",
        port: 0,
        webOrigin: "http://localhost:4873"
      },
      { db: createMemoryDb() }
    );

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Circle One" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const teamId = created.player.teamId;

    await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: created.league.code, teamName: "Late Apex" }
    });

    let state = created;
    for (const round of [1, 2, 3]) {
      const decisionResponse = await app.inject({
        method: "POST",
        url: `/leagues/${leagueId}/decisions`,
        payload: {
          teamId,
          approach: "balanced",
          preparation: "weather"
        }
      });
      const resolveResponse = await app.inject({
        method: "POST",
        url: `/leagues/${leagueId}/resolve`,
        payload: { allowDefaults: true }
      });

      expect(decisionResponse.statusCode).toBe(200);
      expect(resolveResponse.statusCode).toBe(200);
      expect(resolveResponse.json().currentGrandPrix).toMatchObject({ round, status: "resolved" });
      state = resolveResponse.json();

      if (round < 3) {
        const nextResponse = await app.inject({
          method: "POST",
          url: `/leagues/${leagueId}/next-grand-prix`
        });
        expect(nextResponse.statusCode).toBe(200);
        expect(nextResponse.json().currentGrandPrix).toMatchObject({ round: round + 1, status: "briefing" });
      }
    }

    await app.close();

    expect(state.grandPrixHistory.map((grandPrix: { round: number }) => grandPrix.round)).toEqual([3, 2, 1]);
    expect(state.teams.reduce((total: number, team: { points: number }) => total + team.points, 0)).toBeGreaterThan(0);
  });
});

function createMemoryDb(): PrismaClient {
  type LeagueRow = {
    id: string;
    name: string;
    code: string;
    status: string;
    cadence: string;
    preparationDeadlineAt: Date | null;
  };
  type TeamRow = {
    id: string;
    leagueId: string;
    name: string;
    kind: string;
    claimCode: string | null;
    points: number;
    credits: number;
    cards: string[];
  };
  type GrandPrixRow = {
    id: string;
    leagueId: string;
    name: string;
    round: number;
    seed: string;
    primaryTrait: string;
    secondaryTrait: string;
    forecast: unknown;
    status: string;
    result: unknown;
  };
  type DecisionRow = {
    id: string;
    grandPrixId: string;
    teamId: string;
    approach: string;
    preparation: string;
    cardId: string | null;
    rivalTeamId: string | null;
    defaulted: boolean;
  };

  const leagues: LeagueRow[] = [];
  const teams: TeamRow[] = [];
  const grandPrixes: GrandPrixRow[] = [];
  const decisions: DecisionRow[] = [];
  let nextId = 1;
  const id = (prefix: string) => `${prefix}_${nextId++}`;

  return {
    league: {
      create: async ({ data }: { data: Pick<LeagueRow, "name" | "code"> & Partial<Pick<LeagueRow, "cadence" | "preparationDeadlineAt">> }) => {
        const league = { id: id("league"), status: "active", cadence: "manual", preparationDeadlineAt: null, ...data };
        leagues.push(league);
        return league;
      },
      findUnique: async ({ where }: { where: { id?: string; code?: string } }) => {
        const league = leagues.find((candidate) => candidate.id === where.id || candidate.code === where.code);
        if (!league) return null;
        const leagueGrandPrixes = grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === league.id)
          .sort((left, right) => right.round - left.round)
          .map((grandPrix) => ({
            ...grandPrix,
            decisions: decisions.filter((decision) => decision.grandPrixId === grandPrix.id)
          }));

        return {
          ...league,
          teams: teams
            .filter((team) => team.leagueId === league.id)
            .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name)),
          grandPrixes: leagueGrandPrixes
        };
      },
      update: async ({
        where,
        data
      }: {
        where: { id: string };
        data: { cadence?: string; preparationDeadlineAt?: Date | null };
      }) => {
        const league = leagues.find((candidate) => candidate.id === where.id);
        if (!league) throw new Error("League not found");
        Object.assign(league, data);
        return league;
      }
    },
    team: {
      create: async ({ data }: { data: Omit<TeamRow, "id"> }) => {
        const team = { id: id("team"), ...data };
        teams.push(team);
        return team;
      },
      createMany: async ({ data }: { data: Array<Omit<TeamRow, "id">> }) => {
        for (const team of data) {
          teams.push({ id: id("team"), ...team });
        }
        return { count: data.length };
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const team = teams.find((candidate) => candidate.id === where.id);
        if (!team) return null;
        return {
          ...team,
          league: leagues.find((league) => league.id === team.leagueId) ?? null
        };
      },
      update: async ({
        where,
        data
      }: {
        where: { id: string };
        data: { points?: number | { increment: number }; credits?: number | { increment?: number; decrement?: number }; cards?: string[] };
      }) => {
        const team = teams.find((candidate) => candidate.id === where.id);
        if (!team) throw new Error("Team not found");
        if (typeof data.points === "number") {
          team.points = data.points;
        } else {
          team.points += data.points?.increment ?? 0;
        }
        if (typeof data.credits === "number") {
          team.credits = data.credits;
        } else {
          team.credits += data.credits?.increment ?? 0;
          team.credits -= data.credits?.decrement ?? 0;
        }
        if (data.cards) team.cards = data.cards;
        return team;
      }
    },
    grandPrix: {
      create: async ({ data }: { data: Omit<GrandPrixRow, "id" | "status" | "result"> }) => {
        const grandPrix = { id: id("gp"), status: "briefing", result: null, ...data };
        grandPrixes.push(grandPrix);
        return grandPrix;
      },
      findFirst: async ({ where }: { where: { leagueId: string } }) =>
        grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === where.leagueId)
          .sort((left, right) => right.round - left.round)[0] ?? null,
      update: async ({ where, data }: { where: { id: string }; data: { status: string; result: unknown } }) => {
        const grandPrix = grandPrixes.find((candidate) => candidate.id === where.id);
        if (!grandPrix) throw new Error("Grand Prix not found");
        grandPrix.status = data.status;
        grandPrix.result = data.result;
        return grandPrix;
      },
      deleteMany: async ({ where }: { where: { leagueId: string } }) => {
        for (let index = grandPrixes.length - 1; index >= 0; index -= 1) {
          const grandPrix = grandPrixes[index];
          if (grandPrix?.leagueId === where.leagueId) {
            const grandPrixId = grandPrix.id;
            for (let decisionIndex = decisions.length - 1; decisionIndex >= 0; decisionIndex -= 1) {
              if (decisions[decisionIndex]?.grandPrixId === grandPrixId) decisions.splice(decisionIndex, 1);
            }
            grandPrixes.splice(index, 1);
          }
        }
        return { count: 0 };
      }
    },
    raceDecision: {
      upsert: async ({
        where,
        update,
        create
      }: {
        where: { grandPrixId_teamId: { grandPrixId: string; teamId: string } };
        update: Omit<DecisionRow, "id" | "grandPrixId" | "teamId">;
        create: Omit<DecisionRow, "id">;
      }) => {
        const existing = decisions.find(
          (decision) =>
            decision.grandPrixId === where.grandPrixId_teamId.grandPrixId &&
            decision.teamId === where.grandPrixId_teamId.teamId
        );
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }

        const decision: DecisionRow = {
          id: id("decision"),
          ...create,
          cardId: create.cardId ?? null,
          rivalTeamId: create.rivalTeamId ?? null,
          defaulted: create.defaulted ?? false
        };
        decisions.push(decision);
        return decision;
      },
      deleteMany: async ({ where }: { where: { grandPrix: { leagueId: string } } }) => {
        const grandPrixIds = new Set(grandPrixes.filter((grandPrix) => grandPrix.leagueId === where.grandPrix.leagueId).map((grandPrix) => grandPrix.id));
        for (let index = decisions.length - 1; index >= 0; index -= 1) {
          if (grandPrixIds.has(decisions[index]?.grandPrixId ?? "")) decisions.splice(index, 1);
        }
        return { count: 0 };
      }
    }
  } as unknown as PrismaClient;
}
