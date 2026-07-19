import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { CARD_PRICE, DEMO_RACE_INPUT, circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit } from "@cr-league/shared";
import { buildApp } from "./app.js";
import { APP_COMMIT, APP_VERSION } from "./version.js";

function createTestApp(db?: PrismaClient, adminToken?: string, adminEmails: string[] = []) {
  const config = {
    host: "127.0.0.1",
    port: 0,
    webOrigin: "http://localhost:4873",
    adminToken,
    adminEmails
  };
  return buildApp(config, { db, logger: false });
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
      status: "ok",
      version: APP_VERSION,
      commit: APP_COMMIT
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

    const responses = await Promise.all(
      [
        { seed: "missing-race-shape" },
        { ...DEMO_RACE_INPUT, primaryTrait: "magic" },
        { ...DEMO_RACE_INPUT, forecast: { dry: 0, light_rain: -1, heavy_rain: 0 } },
        { ...DEMO_RACE_INPUT, participants: [{ ...DEMO_RACE_INPUT.participants[0], decision: { approach: "wild", preparation: "speed" } }] }
      ].map((payload) =>
        app.inject({
          method: "POST",
          url: "/simulation/preview",
          payload
        })
      )
    );

    await app.close();

    expect(responses.map((response) => response.statusCode)).toEqual([400, 400, 400, 400]);
  });

  it("accepts a valid custom simulation preview input", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview",
      payload: DEMO_RACE_INPUT
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json().classification).toEqual(expect.any(Array));
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
    const starterBuyResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/cards/buy`,
      payload: { teamId, claimCode: claim.claimCode, cardId: "rain_grip" }
    });

    const qualifyingResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/qualifying`,
      payload: {
        teamId,
        claimCode: claim.claimCode,
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
        claimCode: claim.claimCode,
        approach: "aggressive",
        preparation: "weather",
        cardId: "rain_grip"
      }
    });
    const decisionQualifyingTeamIds = new Set(decisionResponse.json().currentGrandPrix.qualifyingRuns.map((run: { teamId: string }) => run.teamId));

    const resolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`,
      payload: { teamId, claimCode: claim.claimCode }
    });
    const resolved = resolveResponse.json();
    const resolvedTeam = resolved.teams.find((team: { id: string }) => team.id === teamId);

    const buyResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/cards/buy`,
      payload: {
        teamId,
        claimCode: claim.claimCode,
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
        claimCode: claim.claimCode,
        approach: "prudent",
        preparation: "reliability"
      }
    });
    const secondResolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`,
      payload: { teamId, claimCode: claim.claimCode }
    });
    const nextResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`,
      payload: { teamId, claimCode: claim.claimCode }
    });
    const botAfterNext = nextResponse.json().teams.find((team: { id: string }) => team.id === botBeforeNext.id);

    await app.close();

    expect(createResponse.statusCode).toBe(200);
    expect(claim).toMatchObject({ teamId, claimCode: expect.any(String) });
    expect(created.league).toMatchObject({ maxPlayers: 8, fillWithBots: true, qualifyingAttemptLimit: 3, maxGrandPrixPerSeason: 6 });
    expect(created.currentGrandPrix).toMatchObject(raceInputFromCircuit(circuitIdentityForRound(1, circuitSeasonSeed(created.league.id, 1))));
    expect(createdTeam.cards).toEqual([]);
    expect(createdTeam.credits).toBe(180);
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
    expect(starterBuyResponse.statusCode).toBe(200);
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
    for (const botTeam of createdBots) {
      expect(decisionQualifyingTeamIds.has(botTeam.id)).toBe(true);
    }
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
    expect(nextResponse.json().currentGrandPrix).toMatchObject(raceInputFromCircuit(circuitIdentityForRound(2, circuitSeasonSeed(created.league.id, 1))));
    expect(botAfterNext.cards).toHaveLength(botBeforeNext.cards.length + 1);
    expect(botAfterNext.credits).toBeLessThan(botBeforeNext.credits);
  });

  it("sells an unused card for half price but rejects cards locked in a plan", async () => {
    const app = await createTestApp(createMemoryDb());
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Sell League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const claim = created.player;
    const payload = { teamId: claim.teamId, claimCode: claim.claimCode, cardId: "rain_grip" };

    const buyBeforeSellResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/cards/buy`, payload });
    const sellResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/cards/sell`, payload });
    const soldTeam = sellResponse.json().teams.find((team: { id: string }) => team.id === claim.teamId);
    const sellAgainResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/cards/sell`, payload });

    const lockedCreateResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Locked League", teamName: "Volt Union" }
    });
    const locked = lockedCreateResponse.json();
    const lockedClaim = locked.player;
    const lockedPayload = { teamId: lockedClaim.teamId, claimCode: lockedClaim.claimCode, cardId: "rain_grip" };
    await app.inject({ method: "POST", url: `/leagues/${locked.league.id}/cards/buy`, payload: lockedPayload });
    await app.inject({
      method: "POST",
      url: `/leagues/${locked.league.id}/decisions`,
      payload: { ...lockedPayload, approach: "balanced", preparation: "weather" }
    });
    const lockedSellResponse = await app.inject({ method: "POST", url: `/leagues/${locked.league.id}/cards/sell`, payload: lockedPayload });

    await app.close();

    expect(CARD_PRICE % 2).toBe(0);
    expect(buyBeforeSellResponse.statusCode).toBe(200);
    expect(sellResponse.statusCode).toBe(200);
    expect(soldTeam.cards).toEqual([]);
    expect(soldTeam.credits).toBe(180 - CARD_PRICE + CARD_PRICE / 2);
    expect(sellAgainResponse.statusCode).toBe(409);
    expect(lockedSellResponse.statusCode).toBe(409);
  });

  it("keeps custom livery colors in dark-primary and light-secondary ranges", async () => {
    const app = await createTestApp(createMemoryDb());
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Livery League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const claim = created.player;

    const updateResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/teams/livery`,
      payload: {
        teamId: claim.teamId,
        claimCode: claim.claimCode,
        livery: { primary: "#ffffff", secondary: "#000000" }
      }
    });
    const updatedTeam = updateResponse.json().teams.find((team: { id: string }) => team.id === claim.teamId);

    await app.close();

    expect(updateResponse.statusCode).toBe(200);
    expect(updatedTeam.livery).toEqual({ primary: "#787878", secondary: "#969696" });
  });

  it("creates and recovers a profile with linked league teams", async () => {
    const app = await createTestApp(createMemoryDb(), undefined, ["pilot@example.test"]);

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
      admin: true,
      recoveryCode: expect.stringMatching(/^[0-9A-F]{8}$/),
      teams: []
    });
    expect(duplicateResponse.statusCode).toBe(409);
    expect(createLeagueResponse.statusCode).toBe(200);
    expect(recoverResponse.statusCode).toBe(200);
    expect(recoverResponse.json()).toMatchObject({
      profile: { id: profile.profile.id, email: "pilot@example.test" },
      admin: true,
      teams: [expect.objectContaining({ leagueName: "Office League", teamName: "Volt Union" })]
    });
    expect(badRecoverResponse.statusCode).toBe(404);
  });

  it("guards admin routes behind the configured bearer token", async () => {
    const unavailableApp = await createTestApp(createMemoryDb());
    const unavailableResponse = await unavailableApp.inject({ method: "GET", url: "/admin/users" });
    await unavailableApp.close();

    const app = await createTestApp(createMemoryDb(), "secret-admin-token");
    const missingResponse = await app.inject({ method: "GET", url: "/admin/users" });
    const wrongResponse = await app.inject({
      method: "GET",
      url: "/admin/users",
      headers: { authorization: "Bearer wrong-token" }
    });
    const okResponse = await app.inject({
      method: "GET",
      url: "/admin/users",
      headers: { authorization: "Bearer secret-admin-token" }
    });
    await app.close();

    expect(unavailableResponse.statusCode).toBe(503);
    expect(missingResponse.statusCode).toBe(403);
    expect(wrongResponse.statusCode).toBe(403);
    expect(okResponse.statusCode).toBe(200);
  });

  it("allows browser preflight for admin delete requests", async () => {
    const app = await createTestApp(createMemoryDb(), "secret-admin-token");

    const response = await app.inject({
      method: "OPTIONS",
      url: "/admin/users/profile_1",
      headers: {
        origin: "http://127.0.0.1:4873",
        "access-control-request-method": "DELETE",
        "access-control-request-headers": "authorization"
      }
    });

    await app.close();

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toContain("DELETE");
    expect(response.headers["access-control-allow-headers"]).toContain("authorization");
  });

  it("reports admin eligibility for a saved profile session refresh", async () => {
    const app = await createTestApp(createMemoryDb(), undefined, ["pilot@example.test"]);
    const adminProfile = await app.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });
    const regularProfile = await app.inject({ method: "POST", url: "/profiles", payload: { email: "driver@example.test" } });

    const adminStatus = await app.inject({ method: "GET", url: `/profiles/${adminProfile.json().profile.id}/admin-status` });
    const regularStatus = await app.inject({ method: "GET", url: `/profiles/${regularProfile.json().profile.id}/admin-status` });

    await app.close();

    expect(adminStatus.json()).toEqual({ admin: true });
    expect(regularStatus.json()).toEqual({ admin: false });
  });

  it("lists admin users, resets recovery codes, and deletes profiles without deleting teams", async () => {
    const db = createMemoryDb();
    const app = await createTestApp(db, "secret-admin-token");
    const adminHeaders = { authorization: "Bearer secret-admin-token" };

    const profileResponse = await app.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });
    const profile = profileResponse.json();
    const leagueResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", profileId: profile.profile.id }
    });
    const teamId = leagueResponse.json().player.teamId;

    const usersResponse = await app.inject({ method: "GET", url: "/admin/users", headers: adminHeaders });
    const resetResponse = await app.inject({
      method: "POST",
      url: `/admin/users/${profile.profile.id}/recovery-code`,
      headers: adminHeaders
    });
    const oldRecoveryResponse = await app.inject({
      method: "POST",
      url: "/profiles/recover",
      payload: { email: "pilot@example.test", recoveryCode: profile.recoveryCode }
    });
    const newRecoveryResponse = await app.inject({
      method: "POST",
      url: "/profiles/recover",
      payload: { email: "pilot@example.test", recoveryCode: resetResponse.json().recoveryCode }
    });
    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/admin/users/${profile.profile.id}`,
      headers: adminHeaders
    });
    const orphanedTeam = await db.team.findUnique({ where: { id: teamId } });

    await app.close();

    expect(usersResponse.statusCode).toBe(200);
    expect(usersResponse.json().users).toEqual([
      expect.objectContaining({
        id: profile.profile.id,
        email: "pilot@example.test",
        createdAt: expect.any(String),
        teamCount: 1,
        leagueCount: 1
      })
    ]);
    expect(usersResponse.body).not.toContain("recoveryCodeHash");
    expect(resetResponse.statusCode).toBe(200);
    expect(resetResponse.json().recoveryCode).toMatch(/^[0-9A-F]{8}$/);
    expect(oldRecoveryResponse.statusCode).toBe(404);
    expect(newRecoveryResponse.statusCode).toBe(200);
    expect(deleteResponse.statusCode).toBe(200);
    expect(orphanedTeam).toMatchObject({ id: teamId, profileId: null });
  });

  it("lists leagues for admin operations and inspects one without a player claim", async () => {
    const app = await createTestApp(createMemoryDb(), "secret-admin-token");
    const adminHeaders = { authorization: "Bearer secret-admin-token" };
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();

    const leaguesResponse = await app.inject({ method: "GET", url: "/admin/leagues", headers: adminHeaders });
    const inspectResponse = await app.inject({ method: "GET", url: `/admin/leagues/${created.league.id}`, headers: adminHeaders });

    await app.close();

    expect(leaguesResponse.statusCode).toBe(200);
    expect(leaguesResponse.json().leagues).toEqual([
      expect.objectContaining({
        id: created.league.id,
        code: created.league.code,
        name: "Office League",
        status: "active",
        currentSeason: 1,
        currentRound: 1,
        playerCount: 1,
        teamCount: 1,
        createdAt: expect.any(String)
      })
    ]);
    expect(inspectResponse.statusCode).toBe(200);
    expect(inspectResponse.json()).toMatchObject({
      league: { id: created.league.id, name: "Office League" },
      currentGrandPrix: { season: 1, round: 1 }
    });
    expect(inspectResponse.json().player).toBeUndefined();
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
    const claimCode = created.player.claimCode;
    await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: created.league.code, teamName: "Mika Blitz" }
    });

    const renameResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, claimCode, name: "Harbor Pulse" }
    });
    const missingClaimResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, name: "Shadow Team" }
    });
    const wrongClaimResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, claimCode: "WRONG", name: "Shadow Team" }
    });
    const duplicateResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, claimCode, name: "Mika Blitz" }
    });
    const invalidResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/teams/name`,
      payload: { teamId, claimCode, name: "x!" }
    });

    await app.close();

    expect(renameResponse.statusCode).toBe(200);
    expect(renameResponse.json().teams).toEqual(expect.arrayContaining([expect.objectContaining({ id: teamId, name: "Harbor Pulse" })]));
    expect(missingClaimResponse.statusCode).toBe(400);
    expect(wrongClaimResponse.statusCode).toBe(409);
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
      claimCode: created.player.claimCode,
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
      claimCode: created.player.claimCode,
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
      claimCode: created.player.claimCode,
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
    const buyResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/cards/buy`,
      payload: { teamId: created.player.teamId, claimCode: created.player.claimCode, cardId: "rain_grip" }
    });
    const basePayload = {
      teamId: created.player.teamId,
      claimCode: created.player.claimCode,
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

    expect(buyResponse.statusCode).toBe(200);
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
      claimCode: created.player.claimCode,
      approach: "balanced",
      preparation: "weather"
    };
    const decisionResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/decisions`, payload });
    const qualifyingResponse = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });

    await app.close();

    expect(decisionResponse.statusCode).toBe(200);
    expect(qualifyingResponse.statusCode).toBe(409);
  });

  it("adds missing bot qualifying runs when the directive is locked", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const botIds = created.teams.filter((team: { kind: string }) => team.kind === "bot").map((team: { id: string }) => team.id);

    const decisionResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: {
        teamId: created.player.teamId,
        claimCode: created.player.claimCode,
        approach: "balanced",
        preparation: "weather"
      }
    });

    await app.close();

    expect(decisionResponse.statusCode).toBe(200);
    const runTeamIds = new Set(decisionResponse.json().currentGrandPrix.qualifyingRuns.map((run: { teamId: string }) => run.teamId));
    for (const botId of botIds) {
      expect(runTeamIds.has(botId)).toBe(true);
    }
  });

  it("self-heals a missing league owner from the earliest human team", async () => {
    const db = createMemoryDb();
    const app = await createTestApp(db);

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    await db.league.update({ where: { id: created.league.id }, data: { ownerTeamId: null } });

    const settingsResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/settings`,
      payload: { ...created.player, cadence: "fast" }
    });
    const repaired = await db.league.findUnique({ where: { id: created.league.id } });

    await app.close();

    expect(settingsResponse.statusCode).toBe(200);
    expect(repaired?.ownerTeamId).toBe(created.player.teamId);
  });

  it("self-heals a dangling league owner from the earliest human team", async () => {
    const db = createMemoryDb();
    const app = await createTestApp(db);

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    await db.league.update({ where: { id: created.league.id }, data: { ownerTeamId: "missing-team" } });

    const settingsResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/settings`,
      payload: { ...created.player, cadence: "weekly" }
    });
    const repaired = await db.league.findUnique({ where: { id: created.league.id } });

    await app.close();

    expect(settingsResponse.statusCode).toBe(200);
    expect(repaired?.ownerTeamId).toBe(created.player.teamId);
  });

  it("rejects resolving before the player submits a directive", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const leagueId = createResponse.json().league.id;
    const player = createResponse.json().player;

    const resolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`,
      payload: player
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
    const claimCode = created.player.claimCode;

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
        claimCode,
        approach: "balanced",
        preparation: "weather"
      }
    });
    await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`,
      payload: { teamId, claimCode }
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
      payload: { ...created.player, allowDefaults: true }
    });
    const nextResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`,
      payload: created.player
    });
    const earlyNextResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`,
      payload: created.player
    });
    const restartResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/restart`,
      payload: created.player
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
      credits: 180,
      cards: []
    });
  });

  it("updates private league cadence and preparation deadline", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const deadline = new Date(Date.now() + 60_000).toISOString();

    const settingsResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/settings`,
      payload: { ...created.player, cadence: "weekly", preparationDeadlineAt: deadline }
    });
    const wrongClaimResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/settings`,
      payload: { ...created.player, claimCode: "WRONG", cadence: "fast" }
    });
    const invalidSettingsResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/settings`,
      payload: { ...created.player, cadence: "always_on" }
    });

    await app.close();

    expect(settingsResponse.statusCode).toBe(200);
    expect(wrongClaimResponse.statusCode).toBe(409);
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
          claimCode: created.player.claimCode,
          approach: "balanced",
          preparation: "weather"
        }
      });
      const resolveResponse = await app.inject({
        method: "POST",
        url: `/leagues/${leagueId}/resolve`,
        payload: { ...created.player, allowDefaults: true }
      });

      expect(decisionResponse.statusCode).toBe(200);
      expect(resolveResponse.statusCode).toBe(200);
      expect(resolveResponse.json().currentGrandPrix).toMatchObject({ round, status: "resolved" });
      state = resolveResponse.json();

      if (round < 3) {
        const nextResponse = await app.inject({
          method: "POST",
          url: `/leagues/${leagueId}/next-grand-prix`,
          payload: created.player
        });
        expect(nextResponse.statusCode).toBe(200);
        expect(nextResponse.json().currentGrandPrix).toMatchObject({ round: round + 1, status: "briefing" });
      }
    }
    const nextSeasonResponse = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/next-grand-prix`,
      payload: created.player
    });

    await app.close();

    expect(nextSeasonResponse.statusCode).toBe(200);
    expect(nextSeasonResponse.json().currentGrandPrix).toMatchObject({ season: 2, round: 1, status: "briefing" });
    expect(nextSeasonResponse.json().teams.reduce((total: number, team: { points: number }) => total + team.points, 0)).toBe(0);
    expect(nextSeasonResponse.json().grandPrixHistory).toHaveLength(4);
    expect(state.grandPrixHistory.map((grandPrix: { round: number }) => grandPrix.round)).toEqual([3, 2, 1]);
    expect(state.teams.reduce((total: number, team: { points: number }) => total + team.points, 0)).toBeGreaterThan(0);
  });

  it("rejects league admin actions from a member that is not the owner", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const joinResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: created.league.code, teamName: "Late Apex" }
    });
    const member = joinResponse.json().player;

    const memberSettings = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/settings`,
      payload: { ...member, cadence: "fast" }
    });
    const memberResolve = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/resolve`, payload: member });
    const memberNext = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/next-grand-prix`, payload: member });
    const memberRestart = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/restart`, payload: member });
    const ownerSettings = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/settings`,
      payload: { ...created.player, cadence: "fast" }
    });

    await app.close();

    for (const response of [memberSettings, memberResolve, memberNext, memberRestart]) {
      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ message: "Only the league owner can perform this action." });
    }
    expect(ownerSettings.statusCode).toBe(200);
    expect(ownerSettings.json().league.cadence).toBe("fast");
  });

  it("rejects invalid decision enum, card, and rival values with 400", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const base = { teamId: created.player.teamId, claimCode: created.player.claimCode };

    const badApproach = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...base, approach: "reckless", preparation: "speed" }
    });
    const badPreparation = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...base, approach: "balanced", preparation: "vibes" }
    });
    const badCard = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...base, approach: "balanced", preparation: "speed", cardId: "not_a_card" }
    });
    const badRival = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/qualifying`,
      payload: { ...base, approach: "balanced", preparation: "speed", rivalTeamId: "team_missing" }
    });
    const stateResponse = await app.inject({ method: "GET", url: `/leagues/${created.league.id}` });

    await app.close();

    for (const response of [badApproach, badPreparation, badCard, badRival]) {
      expect(response.statusCode).toBe(400);
    }
    expect(stateResponse.json().decisions).toHaveLength(0);
  });

  it("rejects an oversized simulation preview participants array", async () => {
    const app = await createTestApp();

    const participant = (index: number) => ({
      teamId: `team_${index}`,
      teamName: `Team ${index}`,
      kind: "bot",
      standingsRank: index + 1,
      decision: { approach: "balanced", preparation: "speed" }
    });
    const response = await app.inject({
      method: "POST",
      url: "/simulation/preview",
      payload: {
        seed: "cap-check",
        grandPrixName: "Cap Check GP",
        primaryTrait: "fast",
        secondaryTrait: "technical",
        forecast: { dry: 80, light_rain: 15, heavy_rain: 5 },
        participants: Array.from({ length: 17 }, (_, index) => participant(index))
      }
    });

    await app.close();

    expect(response.statusCode).toBe(400);
  });

  it("rejects starting the next grand prix twice", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const player = created.player;

    await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...player, approach: "balanced", preparation: "speed" }
    });
    await app.inject({ method: "POST", url: `/leagues/${created.league.id}/resolve`, payload: player });
    const firstNext = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/next-grand-prix`, payload: player });
    const secondNext = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/next-grand-prix`, payload: player });

    await app.close();

    expect(firstNext.statusCode).toBe(200);
    expect(secondNext.statusCode).toBe(409);
    expect(secondNext.json()).toMatchObject({ message: "Resolve the current Grand Prix before starting the next one." });
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
    ownerTeamId: string | null;
    preparationDeadlineAt: Date | null;
    createdAt: Date;
  };
  type ProfileRow = {
    id: string;
    email: string;
    recoveryCodeHash: string;
    createdAt: Date;
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
    createdAt: Date;
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
          ownerTeamId: null,
          preparationDeadlineAt: null,
          createdAt: new Date(),
          ...data
        };
        leagues.push(league);
        return league;
      },
      findUnique: async ({
        where,
        include
      }: {
        where: { id?: string; code?: string };
        include?: { teams?: { orderBy?: { createdAt?: string } | Array<{ points?: string; name?: string }> } };
      }) => {
        const league = leagues.find((candidate) => candidate.id === where.id || candidate.code === where.code);
        if (!league) return null;
        const leagueTeams = teams.filter((team) => team.leagueId === league.id);
        if (Array.isArray(include?.teams?.orderBy)) {
          leagueTeams.sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));
        } else {
          leagueTeams.sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
        }
        const leagueGrandPrixes = grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === league.id)
          .sort((left, right) => right.season - left.season || right.round - left.round)
          .map((grandPrix) => ({
            ...grandPrix,
            decisions: decisions.filter((decision) => decision.grandPrixId === grandPrix.id)
          }));

        return {
          ...league,
          teams: leagueTeams,
          grandPrixes: leagueGrandPrixes
        };
      },
      findMany: async ({
        include
      }: {
        orderBy?: { createdAt?: string };
        include?: {
          teams?: boolean;
          grandPrixes?: { orderBy?: Array<{ season?: string; round?: string }>; take?: number };
        };
      }) =>
        [...leagues]
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .map((league) => ({
            ...league,
            teams: include?.teams ? teams.filter((team) => team.leagueId === league.id) : undefined,
            grandPrixes: include?.grandPrixes
              ? grandPrixes
                  .filter((grandPrix) => grandPrix.leagueId === league.id)
                  .sort((left, right) => right.season - left.season || right.round - left.round)
                  .slice(0, include.grandPrixes.take)
              : undefined
          })),
      update: async ({
        where,
        data
      }: {
        where: { id: string };
        data: { cadence?: string; ownerTeamId?: string | null; preparationDeadlineAt?: Date | null };
      }) => {
        const league = leagues.find((candidate) => candidate.id === where.id);
        if (!league) throw new Error("League not found");
        Object.assign(league, data);
        return league;
      }
    },
    profile: {
      create: async ({ data }: { data: Omit<ProfileRow, "id" | "createdAt"> }) => {
        const profile = { id: id("profile"), createdAt: new Date(), ...data };
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
      },
      findMany: async ({
        include
      }: {
        orderBy?: { createdAt?: string };
        include?: { teams?: { include?: { league?: boolean } } };
      }) =>
        [...profiles]
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .map((profile) => ({
            ...profile,
            teams: include?.teams
              ? teams
                  .filter((team) => team.profileId === profile.id)
                  .map((team) => ({
                    ...team,
                    league: include.teams?.include?.league ? (leagues.find((league) => league.id === team.leagueId) ?? null) : undefined
                  }))
              : undefined
          })),
      update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<ProfileRow, "recoveryCodeHash">> }) => {
        const profile = profiles.find((candidate) => candidate.id === where.id);
        if (!profile) {
          const error = new Error("Profile not found") as Error & { code?: string };
          error.code = "P2025";
          throw error;
        }
        Object.assign(profile, data);
        return profile;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const index = profiles.findIndex((candidate) => candidate.id === where.id);
        if (index === -1) {
          const error = new Error("Profile not found") as Error & { code?: string };
          error.code = "P2025";
          throw error;
        }
        const [profile] = profiles.splice(index, 1);
        for (const team of teams) {
          if (team.profileId === where.id) team.profileId = null;
        }
        return profile;
      }
    },
    team: {
      create: async ({
        data
      }: {
        data: Omit<TeamRow, "id" | "livery" | "profileId" | "createdAt"> & Partial<Pick<TeamRow, "livery" | "profileId">>;
      }) => {
        const team = { id: id("team"), livery: { primary: "#16c784", secondary: "#38bdf8" }, createdAt: new Date(), ...data, profileId: data.profileId ?? null };
        teams.push(team);
        return team;
      },
      createMany: async ({
        data
      }: {
        data: Array<Omit<TeamRow, "id" | "livery" | "profileId" | "createdAt"> & Partial<Pick<TeamRow, "livery" | "profileId">>>;
      }) => {
        for (const team of data) {
          teams.push({ id: id("team"), livery: { primary: "#16c784", secondary: "#38bdf8" }, createdAt: new Date(), ...team, profileId: team.profileId ?? null });
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
      },
      updateMany: async ({
        where,
        data
      }: {
        where: { id: string; credits?: { gte: number } };
        data: {
          credits?: { decrement: number };
          cards?: string[];
        };
      }) => {
        const team = teams.find((candidate) => candidate.id === where.id && candidate.credits >= (where.credits?.gte ?? Number.NEGATIVE_INFINITY));
        if (!team) return { count: 0 };
        team.credits -= data.credits?.decrement ?? 0;
        if (data.cards) team.cards = data.cards;
        return { count: 1 };
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
      updateMany: async ({
        where,
        data
      }: {
        where: { id: string; status?: string };
        data: Partial<Pick<GrandPrixRow, "qualifyingRuns" | "status" | "result">>;
      }) => {
        const grandPrix = grandPrixes.find((candidate) => candidate.id === where.id && (!where.status || candidate.status === where.status));
        if (!grandPrix) return { count: 0 };
        Object.assign(grandPrix, data);
        return { count: 1 };
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
    },
    $queryRaw: async () => []
  } as unknown as PrismaClient;
}
