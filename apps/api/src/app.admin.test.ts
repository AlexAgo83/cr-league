import { describe, expect, it } from "vitest";
import { createTestApp } from "./app.testHelpers.js";
import { createMemoryDb } from "./testMemoryDb.js";

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
});
