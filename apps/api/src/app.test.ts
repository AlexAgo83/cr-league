import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { CARD_PRICE } from "@cr-league/shared";
import { buildApp } from "./app.js";

function createTestApp(db?: PrismaClient) {
  const config = {
    host: "127.0.0.1",
    port: 0,
    webOrigin: "http://localhost:4873"
  };
  return db ? buildApp(config, { db }) : buildApp(config);
}

describe("api app", () => {
  it("responds to health checks", async () => {
    const app = await createTestApp();

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
    const app = await createTestApp();

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
    const app = await createTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview",
      payload: { seed: "missing-race-shape" }
    });

    await app.close();

    expect(response.statusCode).toBe(400);
  });

  it("creates, updates, and resolves a persisted demo league", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const claim = created.player;
    const createdTeam = created.teams.find((team: { id: string }) => team.id === claim.teamId);
    const createdBots = created.teams.filter((team: { kind: string }) => team.kind === "bot");
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

    const qualifyingResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/qualifying`,
      payload: {
        teamId,
        approach: "aggressive",
        preparation: "weather",
        cardId: "rain_grip",
        traits: { grip: 70, overtaking: 66, energy: 62 }
      }
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
    const boughtTeam = buyResponse.statusCode === 200 ? buyResponse.json().teams.find((team: { id: string }) => team.id === teamId) : undefined;
    const botBeforeNext = resolved.teams.find(
      (team: { id: string; kind: string; credits: number; cards: string[] }) => team.kind === "bot" && team.credits >= CARD_PRICE
    );
    if (!botBeforeNext) throw new Error("Expected a bot with enough credits to buy a card.");

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
    const nextResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`
    });
    const botAfterNext = nextResponse.json().teams.find((team: { id: string }) => team.id === botBeforeNext.id);

    await app.close();

    expect(createResponse.statusCode).toBe(200);
    expect(claim).toMatchObject({ teamId, claimCode: expect.any(String) });
    expect(created.league).toMatchObject({ maxPlayers: 8, fillWithBots: true, qualifyingAttemptLimit: 3, maxGrandPrixPerSeason: 6 });
    expect(created.currentGrandPrix).toMatchObject({
      primaryTrait: "weather_sensitive",
      secondaryTrait: "fast",
      forecast: { dry: 35, light_rain: 50, heavy_rain: 15 }
    });
    expect(createdTeam.cards).toEqual(["rain_grip"]);
    expect(createdTeam.livery).toMatchObject({
      primary: expect.stringMatching(/^#[0-9a-f]{6}$/i),
      secondary: expect.stringMatching(/^#[0-9a-f]{6}$/i)
    });
    expect(createdTeam.livery.primary).not.toBe(createdTeam.livery.secondary);
    expect(new Set(createdBots.map((team: { name: string }) => team.name.toLowerCase())).size).toBe(createdBots.length);
    expect(new Set(createdBots.map((team: { livery: { primary: string; secondary: string } }) => `${team.livery.primary}:${team.livery.secondary}`)).size).toBe(createdBots.length);
    expect(created.cardShop).toContainEqual({ cardId: "rain_grip", price: CARD_PRICE });
    expect(created.cardShop).toContainEqual({ cardId: "soft_tires", price: CARD_PRICE });
    expect(created.cardShop).toContainEqual({ cardId: "qualifying_focus", price: CARD_PRICE });
    expect(created.cardShop).toContainEqual({ cardId: "defensive_order", price: CARD_PRICE });
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json().league).toMatchObject({ id: leagueId, name: "Office League" });
    expect(joinResponse.statusCode).toBe(200);
    expect(joinResponse.json().teams.find((team: { name: string }) => team.name === "Late Apex").livery).toMatchObject({
      primary: expect.stringMatching(/^#[0-9a-f]{6}$/i),
      secondary: expect.stringMatching(/^#[0-9a-f]{6}$/i)
    });
    expect(decisionResponse.statusCode).toBe(200);
    expect(qualifyingResponse.statusCode).toBe(200);
    expect(qualifyingResponse.json()).toMatchObject({
      isBest: true,
      run: {
        teamId,
        time: expect.any(Number),
        attempts: 1,
        result: expect.objectContaining({ replayTrace: expect.any(Array) })
      },
      state: {
        currentGrandPrix: {
          qualifyingRuns: expect.arrayContaining([expect.objectContaining({ teamId, time: expect.any(Number) })])
        }
      }
    });
    expect(resolveResponse.statusCode).toBe(200);
    expect(resolved.teams).toHaveLength(8);
    const qualifyingTeamIds = new Set(resolved.currentGrandPrix.qualifyingRuns.map((run: { teamId: string }) => run.teamId));
    for (const botTeam of resolved.teams.filter((team: { kind: string }) => team.kind === "bot")) {
      expect(qualifyingTeamIds.has(botTeam.id)).toBe(true);
    }
    expect(resolved.currentGrandPrix).toMatchObject({
      status: "resolved",
      result: expect.objectContaining({
        classification: expect.any(Array)
      })
    });
    expect(resolvedTeam.cards).not.toContain("rain_grip");
    expect(buyResponse.statusCode).toBe(resolvedTeam.credits >= CARD_PRICE ? 200 : 409);
    if (resolvedTeam.credits >= CARD_PRICE) {
      expect(boughtTeam.cards).toContain("launch_boost");
      expect(boughtTeam.credits).toBe(resolvedTeam.credits - CARD_PRICE);
    }
    expect(lateDecisionResponse.statusCode).toBe(409);
    expect(secondResolveResponse.statusCode).toBe(409);
    expect(nextResponse.statusCode).toBe(200);
    expect(nextResponse.json().currentGrandPrix).toMatchObject({
      primaryTrait: "technical",
      secondaryTrait: "urban",
      forecast: { dry: 70, light_rain: 20, heavy_rain: 10 }
    });
    expect(botAfterNext.cards).toHaveLength(botBeforeNext.cards.length + 1);
    expect(botAfterNext.credits).toBeLessThan(botBeforeNext.credits);
  });

  it("creates and recovers a profile with linked league teams", async () => {
    const app = await createTestApp(createMemoryDb());

    const profileResponse = await app.inject({
      method: "POST",
      url: "/profiles",
      payload: { email: "Pilot@Example.test " }
    });
    const profile = profileResponse.json();
    const duplicateResponse = await app.inject({
      method: "POST",
      url: "/profiles",
      payload: { email: "pilot@example.test" }
    });
    const createLeagueResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", profileId: profile.profile.id }
    });
    const recoverResponse = await app.inject({
      method: "POST",
      url: "/profiles/recover",
      payload: { email: "pilot@example.test", recoveryCode: profile.recoveryCode }
    });
    const badRecoverResponse = await app.inject({
      method: "POST",
      url: "/profiles/recover",
      payload: { email: "pilot@example.test", recoveryCode: "BAD-CODE" }
    });

    await app.close();

    expect(profileResponse.statusCode).toBe(200);
    expect(profile).toMatchObject({
      profile: { email: "pilot@example.test" },
      recoveryCode: expect.stringMatching(/^[0-9A-F]{8}$/),
      teams: []
    });
    expect(duplicateResponse.statusCode).toBe(409);
    expect(createLeagueResponse.statusCode).toBe(200);
    expect(recoverResponse.statusCode).toBe(200);
    expect(recoverResponse.json()).toMatchObject({
      profile: { id: profile.profile.id, email: "pilot@example.test" },
      teams: [expect.objectContaining({ leagueName: "Office League", teamName: "Volt Union" })]
    });
    expect(badRecoverResponse.statusCode).toBe(404);
  });

  it("renames a team with readable unique names only", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const teamId = created.player.teamId;
    await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: created.league.code, teamName: "Mika Blitz" }
    });

    const renameResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, name: "Harbor Pulse" }
    });
    const duplicateResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, name: "Mika Blitz" }
    });
    const invalidResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, name: "x!" }
    });

    await app.close();

    expect(renameResponse.statusCode).toBe(200);
    expect(renameResponse.json().teams).toEqual(expect.arrayContaining([expect.objectContaining({ id: teamId, name: "Harbor Pulse" })]));
    expect(duplicateResponse.statusCode).toBe(409);
    expect(invalidResponse.statusCode).toBe(409);
  });

  it("limits qualifying attempts per league setting", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", qualifyingAttemptLimit: 1 }
    });
    const created = createResponse.json();
    const payload = {
      teamId: created.player.teamId,
      approach: "balanced",
      preparation: "weather",
      laps: 2
    };
    const firstRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });
    const secondRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });

    await app.close();

    expect(firstRun.statusCode).toBe(200);
    expect(firstRun.json().run.attempts).toBe(1);
    expect(secondRun.statusCode).toBe(409);
  });

  it("keeps every qualifying attempt for the timing board", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", qualifyingAttemptLimit: 2 }
    });
    const created = createResponse.json();
    const payload = {
      teamId: created.player.teamId,
      approach: "balanced",
      preparation: "weather",
      laps: 2
    };
    const firstRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });
    const secondRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });

    await app.close();

    expect(firstRun.statusCode).toBe(200);
    expect(secondRun.statusCode).toBe(200);
    expect(secondRun.json().run.attempts).toBe(2);
    expect(firstRun.json().state.currentGrandPrix.qualifyingRuns.filter((run: { teamId: string }) => run.teamId === created.player.teamId)).toHaveLength(2);
    expect(secondRun.json().state.currentGrandPrix.qualifyingRuns.filter((run: { teamId: string }) => run.teamId === created.player.teamId)).toHaveLength(4);
    expect(secondRun.json().run.time).toBeGreaterThan(70);
    expect(secondRun.json().run.result.replayTrace.at(-1).times[created.player.teamId]).toBe(20);
    expect(secondRun.json().run.result.events).toHaveLength(2);
  });

  it("locks the Grand Prix card after a qualifying card is used", async () => {
    const db = createMemoryDb();
    const app = await createTestApp(db);

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", qualifyingAttemptLimit: 2 }
    });
    const created = createResponse.json();
    await db.team.update({ where: { id: created.player.teamId }, data: { cards: ["rain_grip", "qualifying_focus"] } });
    const basePayload = {
      teamId: created.player.teamId,
      approach: "balanced",
      preparation: "weather",
      laps: 1
    };
    const firstRun = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/qualifying`,
      payload: { ...basePayload, cardId: "qualifying_focus" }
    });
    const secondRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload: basePayload });
    const decisionResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/decisions`, payload: basePayload });

    await app.close();

    expect(firstRun.statusCode).toBe(200);
    expect(secondRun.statusCode).toBe(200);
    expect(secondRun.json().run.decision.cardId).toBe("qualifying_focus");
    expect(decisionResponse.statusCode).toBe(200);
    expect(decisionResponse.json().decisions.find((decision: { teamId: string }) => decision.teamId === created.player.teamId).cardId).toBe("qualifying_focus");
  });

  it("does not lock race cards after a qualifying run", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", qualifyingAttemptLimit: 2 }
    });
    const created = createResponse.json();
    const basePayload = {
      teamId: created.player.teamId,
      approach: "balanced",
      preparation: "weather",
      laps: 1
    };
    const firstRun = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/qualifying`,
      payload: { ...basePayload, cardId: "rain_grip" }
    });
    const secondRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload: basePayload });
    const decisionResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/decisions`, payload: basePayload });

    await app.close();

    expect(firstRun.statusCode).toBe(200);
    expect(secondRun.statusCode).toBe(200);
    expect(secondRun.json().run.decision.cardId).toBeUndefined();
    expect(decisionResponse.statusCode).toBe(200);
    expect(decisionResponse.json().decisions.find((decision: { teamId: string }) => decision.teamId === created.player.teamId).cardId).toBeNull();
  });

  it("rejects qualifying after the player submits a directive", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const payload = {
      teamId: created.player.teamId,
      approach: "balanced",
      preparation: "weather"
    };
    const decisionResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/decisions`, payload });
    const qualifyingResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });

    await app.close();

    expect(decisionResponse.statusCode).toBe(200);
    expect(qualifyingResponse.statusCode).toBe(409);
  });

  it("rejects resolving before the player submits a directive", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
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
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
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
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
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
      payload: { code, teamName: "Volt Union" }
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
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
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
    expect(nextResponse.json().currentGrandPrix).toMatchObject({ season: 1, round: 2, status: "briefing", result: null });
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
    expect(restartResponse.json().currentGrandPrix).toMatchObject({ season: 1, round: 1, status: "briefing", result: null });
    expect(restartResponse.json().grandPrixHistory.map((grandPrix: { round: number }) => grandPrix.round)).toEqual([1]);
    expect(restartResponse.json().teams.find((team: { id: string }) => team.id === teamId)).toMatchObject({
      points: 0,
      credits: 0,
      cards: ["rain_grip"]
    });
  });

  it("updates private league cadence and preparation deadline", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
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
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", maxGrandPrixPerSeason: 3 }
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
    const nextSeasonResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`
    });

    await app.close();

    expect(nextSeasonResponse.statusCode).toBe(200);
    expect(nextSeasonResponse.json().currentGrandPrix).toMatchObject({ season: 2, round: 1, status: "briefing" });
    expect(nextSeasonResponse.json().teams.reduce((total: number, team: { points: number }) => total + team.points, 0)).toBe(0);
    expect(nextSeasonResponse.json().grandPrixHistory).toHaveLength(4);
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
    maxPlayers: number;
    fillWithBots: boolean;
    qualifyingAttemptLimit: number;
    maxGrandPrixPerSeason: number;
    preparationDeadlineAt: Date | null;
  };
  type ProfileRow = {
    id: string;
    email: string;
    recoveryCodeHash: string;
  };
  type TeamRow = {
    id: string;
    leagueId: string;
    profileId: string | null;
    name: string;
    kind: string;
    claimCode: string | null;
    points: number;
    credits: number;
    cards: string[];
    livery: { primary: string; secondary: string };
  };
  type GrandPrixRow = {
    id: string;
    leagueId: string;
    name: string;
    season: number;
    round: number;
    seed: string;
    primaryTrait: string;
    secondaryTrait: string;
    forecast: unknown;
    qualifyingRuns: unknown;
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
  };

  const leagues: LeagueRow[] = [];
  const profiles: ProfileRow[] = [];
  const teams: TeamRow[] = [];
  const grandPrixes: GrandPrixRow[] = [];
  const decisions: DecisionRow[] = [];
  let nextId = 1;
  const id = (prefix: string) => `${prefix}_${nextId++}`;

  return {
    league: {
      create: async ({
        data
      }: {
        data: Pick<LeagueRow, "name" | "code"> &
          Partial<
            Pick<LeagueRow, "cadence" | "maxPlayers" | "fillWithBots" | "qualifyingAttemptLimit" | "maxGrandPrixPerSeason" | "preparationDeadlineAt">
          >;
      }) => {
        const league = {
          id: id("league"),
          status: "active",
          cadence: "manual",
          maxPlayers: 8,
          fillWithBots: true,
          qualifyingAttemptLimit: 3,
          maxGrandPrixPerSeason: 6,
          preparationDeadlineAt: null,
          ...data
        };
        leagues.push(league);
        return league;
      },
      findUnique: async ({ where }: { where: { id?: string; code?: string } }) => {
        const league = leagues.find((candidate) => candidate.id === where.id || candidate.code === where.code);
        if (!league) return null;
        const leagueGrandPrixes = grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === league.id)
          .sort((left, right) => right.season - left.season || right.round - left.round)
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
    profile: {
      create: async ({ data }: { data: Omit<ProfileRow, "id"> }) => {
        const profile = { id: id("profile"), ...data };
        profiles.push(profile);
        return profile;
      },
      findUnique: async ({
        where,
        include
      }: {
        where: { id?: string; email?: string };
        include?: { teams?: { include?: { league?: boolean }; orderBy?: { updatedAt: string } } };
      }) => {
        const profile = profiles.find((candidate) => candidate.id === where.id || candidate.email === where.email);
        if (!profile) return null;
        if (!include?.teams) return profile;
        return {
          ...profile,
          teams: teams
            .filter((team) => team.profileId === profile.id)
            .map((team) => ({
              ...team,
              league: leagues.find((league) => league.id === team.leagueId) ?? null
            }))
        };
      }
    },
    team: {
      create: async ({
        data
      }: {
        data: Omit<TeamRow, "id" | "livery" | "profileId"> & Partial<Pick<TeamRow, "livery" | "profileId">>;
      }) => {
        const team = { id: id("team"), livery: { primary: "#16c784", secondary: "#38bdf8" }, ...data, profileId: data.profileId ?? null };
        teams.push(team);
        return team;
      },
      createMany: async ({
        data
      }: {
        data: Array<Omit<TeamRow, "id" | "livery" | "profileId"> & Partial<Pick<TeamRow, "livery" | "profileId">>>;
      }) => {
        for (const team of data) {
          teams.push({ id: id("team"), livery: { primary: "#16c784", secondary: "#38bdf8" }, ...team, profileId: team.profileId ?? null });
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
        data: {
          points?: number | { increment: number };
          credits?: number | { increment?: number; decrement?: number };
          cards?: string[];
          livery?: { primary: string; secondary: string };
          name?: string;
        };
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
        if (data.livery) team.livery = data.livery;
        if (data.name) team.name = data.name;
        return team;
      }
    },
    grandPrix: {
      create: async ({ data }: { data: Omit<GrandPrixRow, "id" | "qualifyingRuns" | "status" | "result"> }) => {
        const grandPrix = { id: id("gp"), qualifyingRuns: [], status: "briefing", result: null, ...data };
        grandPrixes.push(grandPrix);
        return grandPrix;
      },
      findFirst: async ({ where }: { where: { leagueId: string } }) =>
        grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === where.leagueId)
          .sort((left, right) => right.season - left.season || right.round - left.round)[0] ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<GrandPrixRow, "qualifyingRuns" | "status" | "result">> }) => {
        const grandPrix = grandPrixes.find((candidate) => candidate.id === where.id);
        if (!grandPrix) throw new Error("Grand Prix not found");
        Object.assign(grandPrix, data);
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
