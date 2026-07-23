import { describe, expect, it } from "vitest";
import { createMemoryDb } from "./testMemoryDb.js";
import { CARD_PRICE, CARD_PRICES, circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit } from "@cr-league/shared";
import { createTestApp } from "./app.testHelpers.js";
import type { RecoveryMailer } from "./mailer.js";

function recordingMailer() {
  const sent: Array<{ email: string; code: string }> = [];
  const mailer: RecoveryMailer = {
    active: true,
    async sendRecoveryCode(email, code) {
      sent.push({ email, code });
      return true;
    }
  };
  return { mailer, sent };
}

describe("api app", () => {
  it("gates opponent configuration reveal at the API boundary", async () => {
    const app = await createTestApp(createMemoryDb());
    const createdResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Reveal League", teamName: "Volt Union" }
    });
    const created = createdResponse.json();
    const leagueId = created.league.id;
    const claim = created.player;

    const blocked = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/opponent-configs`,
      payload: { teamId: claim.teamId, claimCode: claim.claimCode }
    });
    const locked = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/decisions`,
      payload: {
        teamId: claim.teamId,
        claimCode: claim.claimCode,
        approach: "balanced",
        preparation: "speed"
      }
    });
    const publicRead = await app.inject({ method: "GET", url: `/leagues/${leagueId}` });
    const revealed = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/opponent-configs`,
      payload: { teamId: claim.teamId, claimCode: claim.claimCode }
    });
    const resolved = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/resolve`,
      payload: { teamId: claim.teamId, claimCode: claim.claimCode }
    });
    const revealedAfterRace = await app.inject({
      method: "POST",
      url: `/leagues/${leagueId}/opponent-configs`,
      payload: { teamId: claim.teamId, claimCode: claim.claimCode }
    });

    await app.close();

    expect(blocked.statusCode).toBe(409);
    expect(locked.statusCode).toBe(200);
    expect(locked.json().decisions.length).toBeGreaterThan(1);
    expect(publicRead.json().decisions).toEqual([]);
    expect(revealed.statusCode).toBe(200);
    expect(revealed.json().teams[0]).toMatchObject({
      teamId: expect.any(String),
      teamName: expect.any(String),
      approach: expect.any(String),
      preparation: expect.any(String),
      pitStrategy: expect.any(String),
      result: null
    });
    expect(resolved.statusCode).toBe(200);
    expect(revealedAfterRace.json().teams[0].result).toMatchObject({ position: expect.any(Number), points: expect.any(Number), credits: expect.any(Number) });
  });

  it("varies default bot pit strategies across circuit identities", async () => {
    const app = await createTestApp(createMemoryDb());
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Bot Strategy League", teamName: "Volt Union", maxGrandPrixPerSeason: 24 }
    });
    const created = createResponse.json();
    const leagueId = created.league.id;
    const claim = created.player;
    const pitStrategies = new Set<string>();
    const signatures = new Set<string>();

    for (let round = 0; round < 8; round += 1) {
      await app.inject({
        method: "POST",
        url: `/leagues/${leagueId}/decisions`,
        payload: { teamId: claim.teamId, claimCode: claim.claimCode, approach: "balanced", preparation: "speed" }
      });
      const revealed = await app.inject({
        method: "POST",
        url: `/leagues/${leagueId}/opponent-configs`,
        payload: { teamId: claim.teamId, claimCode: claim.claimCode }
      });
      const configs = revealed.json().teams as Array<{ teamName: string; pitStrategy: string }>;
      configs.forEach((config) => pitStrategies.add(config.pitStrategy));
      signatures.add(configs.map((config) => `${config.teamName}:${config.pitStrategy}`).join("|"));

      await app.inject({ method: "POST", url: `/leagues/${leagueId}/resolve`, payload: { teamId: claim.teamId, claimCode: claim.claimCode } });
      if (round < 7) await app.inject({ method: "POST", url: `/leagues/${leagueId}/next-grand-prix`, payload: { teamId: claim.teamId, claimCode: claim.claimCode } });
    }

    await app.close();

    expect([...pitStrategies].sort()).toEqual(["heavy_pack", "mini_pack", "standard"]);
    expect(signatures.size).toBeGreaterThan(1);
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
    expect(createdBots.every((team: { livery: { carAssetId?: string } }) => /^car-0(0[1-9]|1[0-6])$/.test(team.livery.carAssetId ?? ""))).toBe(true);
    expect(new Set(createdBots.map((team: { livery: { carAssetId?: string } }) => team.livery.carAssetId)).size).toBe(createdBots.length);
    expect(created.cardShop).toContainEqual({ cardId: "rain_grip", price: CARD_PRICES.rain_grip });
    expect(created.cardShop).toContainEqual({ cardId: "soft_tires", price: CARD_PRICES.soft_tires });
    expect(created.cardShop).toContainEqual({ cardId: "qualifying_focus", price: CARD_PRICES.qualifying_focus });
    expect(created.cardShop).toContainEqual({ cardId: "adjustable_wing", price: CARD_PRICES.adjustable_wing });
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json().league).toMatchObject({ id: leagueId, name: "Office League" });
    expect(joinResponse.statusCode).toBe(409);
    expect(starterBuyResponse.statusCode).toBe(200);
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
    expect(buyResponse.statusCode).toBe(resolvedTeam.credits >= CARD_PRICES.launch_boost ? 200 : 409);
    if (resolvedTeam.credits >= CARD_PRICES.launch_boost) {
      expect(boughtTeam.cards).toContain("launch_boost");
      expect(boughtTeam.credits).toBe(resolvedTeam.credits - CARD_PRICES.launch_boost);
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
    expect(soldTeam.credits).toBe(180 - CARD_PRICES.rain_grip + CARD_PRICES.rain_grip / 2);
    expect(sellAgainResponse.statusCode).toBe(409);
    expect(lockedSellResponse.statusCode).toBe(409);
  });

  it("buys multiple affordable copies of a card", async () => {
    const db = createMemoryDb();
    const app = await createTestApp(db);
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Bulk Buy League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const claim = created.player;
    await db.team.update({ where: { id: claim.teamId }, data: { credits: 300 } });

    const buyResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/cards/buy`,
      payload: { teamId: claim.teamId, claimCode: claim.claimCode, cardId: "rain_grip", quantity: 2 }
    });
    const team = buyResponse.json().teams.find((candidate: { id: string }) => candidate.id === claim.teamId);

    await app.close();

    expect(buyResponse.statusCode).toBe(200);
    expect(team.cards.filter((cardId: string) => cardId === "rain_grip")).toHaveLength(2);
    expect(team.credits).toBe(300 - CARD_PRICES.rain_grip * 2);
  });

  it("keeps custom livery colors exact", async () => {
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
    expect(updatedTeam.livery).toEqual({ primary: "#ffffff", secondary: "#000000" });
  });

  it("renames a team with readable unique names only", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
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
    expect(secondRun.json().run.result.replayTrace.at(-1).times[created.player.teamId]).toBeGreaterThan(secondRun.json().run.time);
    expect(secondRun.json().run.result.events).toHaveLength(2);
    expect(secondRun.json().run.result.replayTrace.at(-1).distanceMeters).toBeGreaterThan(1000);
    expect(secondRun.json().run.result.replayTrace.at(-1).cars[created.player.teamId]).toMatchObject({ trackProgress: 1, phase: "finished" });
    expect(secondRun.json().run.result.events.map((event: { traceProgress: number }) => event.traceProgress)).toEqual([0.5, 1]);
  });

  it("caps each qualifying attempt to three laps", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
    });
    const created = createResponse.json();
    const qualifyingResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/qualifying`,
      payload: {
        teamId: created.player.teamId,
        claimCode: created.player.claimCode,
        approach: "balanced",
        preparation: "weather",
        laps: 20
      }
    });

    await app.close();

    expect(qualifyingResponse.statusCode).toBe(200);
    expect(qualifyingResponse.json().state.currentGrandPrix.qualifyingRuns.filter((run: { teamId: string }) => run.teamId === created.player.teamId)).toHaveLength(3);
    expect(qualifyingResponse.json().run.result.events).toHaveLength(3);
  });

  it("adds one bot qualifying attempt after each player qualifying attempt", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", qualifyingAttemptLimit: 2 }
    });
    const created = createResponse.json();
    const botIds = created.teams.filter((team: { kind: string }) => team.kind === "bot").map((team: { id: string }) => team.id);
    const payload = {
      teamId: created.player.teamId,
      claimCode: created.player.claimCode,
      approach: "balanced",
      preparation: "weather",
      laps: 1
    };
    const firstRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });
    const secondRun = await app.inject({ method: "POST", url: `/leagues/${created.league.id}/qualifying`, payload });

    await app.close();

    expect(firstRun.statusCode).toBe(200);
    expect(secondRun.statusCode).toBe(200);
    for (const botId of botIds) {
      const botRuns = secondRun.json().state.currentGrandPrix.qualifyingRuns.filter((run: { teamId: string }) => run.teamId === botId);
      expect(botRuns).toHaveLength(2);
      expect(botRuns.map((run: { attempts: number }) => run.attempts)).toEqual([1, 2]);
    }
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
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
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
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
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

  it("repairs admin actions when the league owner is missing", async () => {
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
    const league = await db.league.findUnique({ where: { id: created.league.id } });

    await app.close();

    expect(settingsResponse.statusCode).toBe(200);
    expect(league?.ownerTeamId).toBe(created.player.teamId);
  });

  it("repairs admin actions when the league owner is dangling", async () => {
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
    const league = await db.league.findUnique({ where: { id: created.league.id } });

    await app.close();

    expect(settingsResponse.statusCode).toBe(200);
    expect(league?.ownerTeamId).toBe(created.player.teamId);
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

  it("resolves from the stored circuit instead of client simulation overrides", async () => {
    const app = await createTestApp(createMemoryDb());
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const created = createResponse.json();
    const circuit = circuitIdentityForRound(1, circuitSeasonSeed(created.league.id, 1));

    await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...created.player, approach: "balanced", preparation: "speed" }
    });
    const resolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/resolve`,
      payload: { ...created.player, traits: { grip: 1, overtaking: 1, energy: 1 }, trackLengthMeters: 8000, laps: 99, pitLaneProgress: 0.999 }
    });

    await app.close();

    const trace = resolveResponse.json().currentGrandPrix.result.replayTrace;
    expect(resolveResponse.statusCode).toBe(200);
    expect(trace.at(-1).distanceMeters).toBe(circuit.trackLengthMeters);
    expect(Math.max(...trace.map((point: { lap: number }) => point.lap))).toBe(circuit.laps);
  });

  it("does not consume a card for a human that never submitted a plan", async () => {
    const app = await createTestApp(createMemoryDb());
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
    });
    const created = createResponse.json();
    const joinResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: created.league.code, teamName: "Late Apex" }
    });
    const joinedTeam = joinResponse.json().teams.find((team: { name: string }) => team.name === "Late Apex");

    await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...created.player, approach: "balanced", preparation: "speed" }
    });
    const resolveResponse = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/resolve`,
      payload: created.player
    });
    const teamAfterRace = resolveResponse.json().teams.find((team: { id: string }) => team.id === joinedTeam.id);

    await app.close();

    expect(resolveResponse.statusCode).toBe(200);
    expect(resolveResponse.json().currentGrandPrix.result.consumedCards).not.toContainEqual(expect.objectContaining({ teamId: joinedTeam.id }));
    expect(teamAfterRace.cards).toEqual(joinedTeam.cards);
  });

  it("lets a player join an active league by code", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
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

  it("requires profile proof when creating or joining with a profile id", async () => {
    const db = createMemoryDb();
    const { mailer, sent } = recordingMailer();
    const app = await createTestApp(db, undefined, [], "http://localhost:4873", mailer);

    await app.inject({
      method: "POST",
      url: "/profiles",
      payload: { email: "pilot@example.test" }
    });
    const profile = await db.profile.findUnique({ where: { email: "pilot@example.test" } });
    const recoveryCode = sent[0]?.code;
    const bareCreateResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", profileId: profile!.id }
    });
    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union", profileId: profile!.id, recoveryCode }
    });
    const bareJoinResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: createResponse.json().league.code, teamName: "Late Apex", profileId: profile!.id }
    });
    const wrongJoinResponse = await app.inject({
      method: "POST",
      url: "/leagues/join",
      payload: { code: createResponse.json().league.code, teamName: "Late Apex", profileId: profile!.id, recoveryCode: "WRONG" }
    });

    await app.close();

    expect(bareCreateResponse.statusCode).toBe(403);
    expect(createResponse.statusCode).toBe(200);
    expect(bareJoinResponse.statusCode).toBe(403);
    expect(wrongJoinResponse.statusCode).toBe(403);
  });

  it("hides the invite code from public league reads", async () => {
    const app = await createTestApp(createMemoryDb());

    const createResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Office League", teamName: "Volt Union" }
    });
    const publicResponse = await app.inject({
      method: "GET",
      url: `/leagues/${createResponse.json().league.id}`
    });

    await app.close();

    expect(createResponse.json().league.code).toMatch(/^[0-9A-F]{6}$/);
    expect(publicResponse.json().league.code).toBeNull();
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
      payload: { name: "Office League", teamName: "Volt Union", fillWithBots: false }
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
    const selfRival = await app.inject({
      method: "POST",
      url: `/leagues/${created.league.id}/decisions`,
      payload: { ...base, approach: "balanced", preparation: "speed", rivalTeamId: base.teamId }
    });
    const stateResponse = await app.inject({ method: "GET", url: `/leagues/${created.league.id}` });

    await app.close();

    for (const response of [badApproach, badPreparation, badCard, badRival, selfRival]) {
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
