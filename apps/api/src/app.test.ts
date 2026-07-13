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
    const teamId = created.teams[0].id;

    const readResponse = await app.inject({
      method: "GET",
      url: `/leagues/${leagueId}`
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

    await app.close();

    expect(createResponse.statusCode).toBe(200);
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json().league).toMatchObject({ id: leagueId, name: "Office League" });
    expect(decisionResponse.statusCode).toBe(200);
    expect(resolveResponse.statusCode).toBe(200);
    expect(resolveResponse.json().currentGrandPrix).toMatchObject({
      status: "resolved",
      result: expect.objectContaining({
        classification: expect.any(Array)
      })
    });
  });
});

function createMemoryDb(): PrismaClient {
  type LeagueRow = { id: string; name: string; code: string; status: string };
  type TeamRow = { id: string; leagueId: string; name: string; kind: string; points: number; credits: number };
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
      create: async ({ data }: { data: Omit<LeagueRow, "id" | "status"> }) => {
        const league = { id: id("league"), status: "active", ...data };
        leagues.push(league);
        return league;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const league = leagues.find((candidate) => candidate.id === where.id);
        if (!league) return null;
        const leagueGrandPrixes = grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === league.id)
          .sort((left, right) => right.round - left.round)
          .slice(0, 1)
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
      }
    },
    team: {
      createMany: async ({ data }: { data: Array<Omit<TeamRow, "id">> }) => {
        for (const team of data) {
          teams.push({ id: id("team"), ...team });
        }
        return { count: data.length };
      },
      update: async ({
        where,
        data
      }: {
        where: { id: string };
        data: { points?: { increment: number }; credits?: { increment: number } };
      }) => {
        const team = teams.find((candidate) => candidate.id === where.id);
        if (!team) throw new Error("Team not found");
        team.points += data.points?.increment ?? 0;
        team.credits += data.credits?.increment ?? 0;
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
      }
    }
  } as unknown as PrismaClient;
}
