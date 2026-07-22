import { describe, expect, it } from "vitest";
import { createTestApp } from "./app.testHelpers.js";
import type { RecoveryMailer } from "./mailer.js";
import { hashLegacyRecoveryCode } from "./features/leagues/utils.js";
import { createMemoryDb } from "./testMemoryDb.js";

function recordingMailer(options: { active?: boolean; throwOnSend?: boolean } = {}) {
  const sent: Array<{ email: string; code: string }> = [];
  const mailer: RecoveryMailer = {
    active: options.active ?? true,
    async sendRecoveryCode(email, code) {
      if (options.throwOnSend) throw new Error("SMTP down");
      sent.push({ email, code });
      return mailer.active;
    }
  };
  return { mailer, sent };
}

describe("api app profile and admin", () => {
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
      payload: { name: "Office League", teamName: "Volt Union", profileId: profile.profile.id, recoveryCode: profile.recoveryCode }
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
      recoveryCode: expect.stringMatching(/^[0-9A-F]{12}$/),
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

  it("upgrades legacy recovery hashes on successful recovery", async () => {
    const db = createMemoryDb();
    const app = await createTestApp(db);
    const profileResponse = await app.inject({
      method: "POST",
      url: "/profiles",
      payload: { email: "legacy@example.test" }
    });
    const profile = profileResponse.json();
    await db.profile.update({
      where: { id: profile.profile.id },
      data: { recoveryCodeHash: hashLegacyRecoveryCode(profile.recoveryCode) }
    });

    const recoverResponse = await app.inject({
      method: "POST",
      url: "/profiles/recover",
      payload: { email: "legacy@example.test", recoveryCode: profile.recoveryCode }
    });
    const upgraded = await db.profile.findUnique({ where: { id: profile.profile.id } });

    await app.close();

    expect(recoverResponse.statusCode).toBe(200);
    expect(upgraded?.recoveryCodeHash).toMatch(/^scrypt\$/);
  });

  it("rate-limits repeated profile recovery attempts", async () => {
    const app = await createTestApp(createMemoryDb());

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/profiles/recover",
        payload: { email: "pilot@example.test", recoveryCode: `BAD-${attempt}` }
      });
      expect(response.statusCode).toBe(404);
    }
    const limitedResponse = await app.inject({
      method: "POST",
      url: "/profiles/recover",
      payload: { email: "pilot@example.test", recoveryCode: "BAD-5" }
    });

    await app.close();

    expect(limitedResponse.statusCode).toBe(429);
  });

  it("emails recovery codes on profile creation when mail is active", async () => {
    const { mailer, sent } = recordingMailer();
    const app = await createTestApp(createMemoryDb(), undefined, [], "http://localhost:4873", mailer);

    const response = await app.inject({
      method: "POST",
      url: "/profiles",
      payload: { email: "pilot@example.test" }
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json().recoveryEmailSent).toBe(true);
    expect(sent).toEqual([{ email: "pilot@example.test", code: response.json().recoveryCode }]);
  });

  it("keeps profile creation working when recovery email is inactive or fails", async () => {
    const inactive = recordingMailer({ active: false });
    const inactiveApp = await createTestApp(createMemoryDb(), undefined, [], "http://localhost:4873", inactive.mailer);
    const inactiveResponse = await inactiveApp.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });
    await inactiveApp.close();

    const failing = recordingMailer({ throwOnSend: true });
    const failingApp = await createTestApp(createMemoryDb(), undefined, [], "http://localhost:4873", failing.mailer);
    const failingResponse = await failingApp.inject({ method: "POST", url: "/profiles", payload: { email: "driver@example.test" } });
    await failingApp.close();

    expect(inactiveResponse.statusCode).toBe(200);
    expect(inactiveResponse.json().recoveryEmailSent).toBe(false);
    expect(inactive.sent).toHaveLength(1);
    expect(failingResponse.statusCode).toBe(200);
    expect(failingResponse.json().recoveryEmailSent).toBe(false);
  });

  it("re-issues recovery codes by email without leaking profile existence", async () => {
    const db = createMemoryDb();
    const setupApp = await createTestApp(db);
    const profileResponse = await setupApp.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });
    const oldCode = profileResponse.json().recoveryCode;
    await setupApp.close();

    const { mailer, sent } = recordingMailer();
    const app = await createTestApp(db, undefined, [], "http://localhost:4873", mailer);
    const knownResponse = await app.inject({ method: "POST", url: "/profiles/recovery-code", payload: { email: "pilot@example.test" } });
    const unknownResponse = await app.inject({ method: "POST", url: "/profiles/recovery-code", payload: { email: "missing@example.test" } });
    const oldRecoverResponse = await app.inject({ method: "POST", url: "/profiles/recover", payload: { email: "pilot@example.test", recoveryCode: oldCode } });
    const newRecoverResponse = await app.inject({ method: "POST", url: "/profiles/recover", payload: { email: "pilot@example.test", recoveryCode: sent[0]?.code } });
    await app.close();

    expect(knownResponse.statusCode).toBe(200);
    expect(unknownResponse.statusCode).toBe(200);
    expect(knownResponse.json()).toEqual(unknownResponse.json());
    expect(sent).toHaveLength(1);
    expect(oldRecoverResponse.statusCode).toBe(404);
    expect(newRecoverResponse.statusCode).toBe(200);
  });

  it("rate-limits and cooldowns recovery-code re-issue without changing the neutral body", async () => {
    const db = createMemoryDb();
    const setupApp = await createTestApp(db);
    const profileResponse = await setupApp.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });
    await db.profile.update({ where: { id: profileResponse.json().profile.id }, data: { recoveryEmailSentAt: new Date() } });
    await setupApp.close();

    const { mailer, sent } = recordingMailer();
    const app = await createTestApp(db, undefined, [], "http://localhost:4873", mailer);
    const cooldownResponse = await app.inject({ method: "POST", url: "/profiles/recovery-code", payload: { email: "pilot@example.test" } });
    const unknownResponse = await app.inject({ method: "POST", url: "/profiles/recovery-code", payload: { email: "missing@example.test" } });
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await app.inject({ method: "POST", url: "/profiles/recovery-code", payload: { email: "limited@example.test" } });
    }
    const limitedResponse = await app.inject({ method: "POST", url: "/profiles/recovery-code", payload: { email: "limited@example.test" } });
    await app.close();

    expect(cooldownResponse.statusCode).toBe(200);
    expect(unknownResponse.statusCode).toBe(200);
    expect(cooldownResponse.json()).toEqual(unknownResponse.json());
    expect(sent).toHaveLength(0);
    expect(limitedResponse.statusCode).toBe(429);
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

  it("does not whitelist localhost CORS origins for a non-local web origin", async () => {
    const app = await createTestApp(createMemoryDb(), "secret-admin-token", [], "https://cr-league.example");

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

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });


  it("does not expose admin eligibility from a bare profile id", async () => {
    const app = await createTestApp(createMemoryDb(), undefined, ["pilot@example.test"]);
    const adminProfile = await app.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });

    const adminStatus = await app.inject({ method: "GET", url: `/profiles/${adminProfile.json().profile.id}/admin-status` });

    await app.close();

    expect(adminProfile.json()).toMatchObject({ admin: true });
    expect(adminStatus.statusCode).toBe(404);
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
      payload: { name: "Office League", teamName: "Volt Union", profileId: profile.profile.id, recoveryCode: profile.recoveryCode }
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
    expect(usersResponse.json().pagination).toMatchObject({ page: 1, limit: 100, total: 1, totalPages: 1, hasNext: false, hasPrevious: false });
    expect(usersResponse.body).not.toContain("recoveryCodeHash");
    expect(resetResponse.statusCode).toBe(200);
    expect(resetResponse.json().recoveryCode).toMatch(/^[0-9A-F]{12}$/);
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
        teamCount: 8,
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

  it("filters and paginates admin users and leagues", async () => {
    const app = await createTestApp(createMemoryDb(), "secret-admin-token");
    const adminHeaders = { authorization: "Bearer secret-admin-token" };
    await app.inject({ method: "POST", url: "/profiles", payload: { email: "alpha@example.test" } });
    await app.inject({ method: "POST", url: "/profiles", payload: { email: "beta@example.test" } });
    await app.inject({ method: "POST", url: "/leagues", payload: { name: "Alpha Cup", teamName: "Volt Union" } });
    await app.inject({ method: "POST", url: "/leagues", payload: { name: "Beta Bowl", teamName: "Apex Team" } });

    const firstUserPage = await app.inject({ method: "GET", url: "/admin/users?limit=1&page=1", headers: adminHeaders });
    const secondUserPage = await app.inject({ method: "GET", url: "/admin/users?limit=1&page=2", headers: adminHeaders });
    const filteredUsers = await app.inject({ method: "GET", url: "/admin/users?q=alpha", headers: adminHeaders });
    const filteredLeagues = await app.inject({ method: "GET", url: "/admin/leagues?q=Beta", headers: adminHeaders });

    await app.close();

    expect(firstUserPage.json().users).toHaveLength(1);
    expect(firstUserPage.json().pagination).toMatchObject({ page: 1, limit: 1, total: 2, totalPages: 2, hasNext: true, hasPrevious: false });
    expect(secondUserPage.json().users).toHaveLength(1);
    expect(secondUserPage.json().pagination).toMatchObject({ page: 2, limit: 1, total: 2, totalPages: 2, hasNext: false, hasPrevious: true });
    expect(filteredUsers.json().users).toEqual([expect.objectContaining({ email: "alpha@example.test" })]);
    expect(filteredUsers.json().pagination.total).toBe(1);
    expect(filteredLeagues.json().leagues).toEqual([expect.objectContaining({ name: "Beta Bowl" })]);
    expect(filteredLeagues.json().pagination.total).toBe(1);
  });

  it("cleans up explicitly selected admin test data with confirmation and counts", async () => {
    const app = await createTestApp(createMemoryDb(), "secret-admin-token");
    const adminHeaders = { authorization: "Bearer secret-admin-token" };
    const profileResponse = await app.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.test" } });
    const profile = profileResponse.json();
    const leagueResponse = await app.inject({
      method: "POST",
      url: "/leagues",
      payload: { name: "Test League", teamName: "Volt Union", profileId: profile.profile.id, recoveryCode: profile.recoveryCode }
    });
    const created = leagueResponse.json();

    const cleanupResponse = await app.inject({
      method: "POST",
      url: "/admin/test-data-cleanup",
      headers: adminHeaders,
      payload: {
        confirmation: "DELETE TEST DATA",
        profileIds: [profile.profile.id],
        leagueIds: [created.league.id]
      }
    });
    const inspectResponse = await app.inject({ method: "GET", url: `/admin/leagues/${created.league.id}`, headers: adminHeaders });
    const recoverResponse = await app.inject({ method: "POST", url: "/profiles/recover", payload: { email: "pilot@example.test", recoveryCode: profile.recoveryCode } });

    await app.close();

    expect(cleanupResponse.statusCode).toBe(200);
    expect(cleanupResponse.json()).toEqual({
      ok: true,
      deleted: {
        profiles: 1,
        leagues: 1,
        teams: 8,
        grandPrixes: 1,
        decisions: 0
      }
    });
    expect(inspectResponse.statusCode).toBe(404);
    expect(recoverResponse.statusCode).toBe(404);
  });

  it("rejects admin cleanup without confirmation or clearly marked test data", async () => {
    const app = await createTestApp(createMemoryDb(), "secret-admin-token");
    const adminHeaders = { authorization: "Bearer secret-admin-token" };
    const profileResponse = await app.inject({ method: "POST", url: "/profiles", payload: { email: "pilot@example.com" } });
    const profile = profileResponse.json();

    const missingConfirmation = await app.inject({
      method: "POST",
      url: "/admin/test-data-cleanup",
      headers: adminHeaders,
      payload: { profileIds: [profile.profile.id] }
    });
    const unsafeProfile = await app.inject({
      method: "POST",
      url: "/admin/test-data-cleanup",
      headers: adminHeaders,
      payload: { confirmation: "DELETE TEST DATA", profileIds: [profile.profile.id] }
    });
    const forbidden = await app.inject({
      method: "POST",
      url: "/admin/test-data-cleanup",
      payload: { confirmation: "DELETE TEST DATA", profileIds: [profile.profile.id] }
    });

    await app.close();

    expect(missingConfirmation.statusCode).toBe(400);
    expect(unsafeProfile.statusCode).toBe(400);
    expect(forbidden.statusCode).toBe(403);
  });
});
