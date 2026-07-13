const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4874";

type LeagueState = {
  league: {
    id: string;
    code: string;
    cadence: string;
  };
  currentGrandPrix: {
    round: number;
    status: string;
    result: unknown;
  };
  grandPrixHistory: Array<{
    round: number;
    status: string;
  }>;
  teams: Array<{
    id: string;
    kind: string;
  }>;
  player?: {
    teamId: string;
    claimCode: string;
  };
};

const created = await request<LeagueState>("/leagues", {
  method: "POST",
  body: JSON.stringify({
    name: `Smoke League ${Date.now()}`,
    teamName: "Circle One"
  })
});

const playerTeam = created.teams.find((team) => team.kind === "human") ?? created.teams[0];
if (!playerTeam) {
  throw new Error("No team returned by league creation.");
}
if (!created.player) {
  throw new Error("No player claim returned by league creation.");
}

await request<LeagueState>("/leagues/rejoin", {
  method: "POST",
  body: JSON.stringify(created.player)
});
const configured = await request<LeagueState>(`/leagues/${created.league.id}/settings`, {
  method: "POST",
  body: JSON.stringify({
    cadence: "weekly",
    preparationDeadlineAt: new Date(Date.now() + 60_000).toISOString()
  })
});
if (configured.league.cadence !== "weekly") {
  throw new Error("League cadence did not update.");
}

const joinedTeamName = `Joined Team ${Date.now()}`;
const joined = await request<LeagueState>("/leagues/join", {
  method: "POST",
  body: JSON.stringify({
    code: created.league.code,
    teamName: joinedTeamName
  })
});

if (!joined.teams.some((team) => team.kind === "human")) {
  throw new Error("Joined league did not return human teams.");
}

await expectStatus("/leagues/join", 404, {
  method: "POST",
  body: JSON.stringify({
    code: "NOPE00",
    teamName: "Ghost Team"
  })
});
await expectStatus("/leagues/join", 409, {
  method: "POST",
  body: JSON.stringify({
    code: created.league.code,
    teamName: joinedTeamName
  })
});

await request<LeagueState>(`/leagues/${created.league.id}/decisions`, {
  method: "POST",
  body: JSON.stringify({
    teamId: playerTeam.id,
    approach: "balanced",
    preparation: "weather",
    cardId: "rain_grip"
  })
});

const resolved = await request<LeagueState>(`/leagues/${created.league.id}/resolve`, {
  method: "POST",
  body: JSON.stringify({ allowDefaults: true })
});

if (resolved.currentGrandPrix.status !== "resolved" || !resolved.currentGrandPrix.result) {
  throw new Error("Grand Prix did not resolve.");
}

await expectStatus(`/leagues/${created.league.id}/decisions`, 409, {
  method: "POST",
  body: JSON.stringify({
    teamId: playerTeam.id,
    approach: "prudent",
    preparation: "reliability"
  })
});
await expectStatus(`/leagues/${created.league.id}/resolve`, 409, {
  method: "POST"
});
await expectStatus("/leagues/join", 409, {
  method: "POST",
  body: JSON.stringify({
    code: created.league.code,
    teamName: `Late Team ${Date.now()}`
  })
});

const next = await request<LeagueState>(`/leagues/${created.league.id}/next-grand-prix`, {
  method: "POST"
});
if (next.currentGrandPrix.round !== resolved.currentGrandPrix.round + 1 || next.currentGrandPrix.status !== "briefing") {
  throw new Error("Next Grand Prix did not start.");
}
if (next.grandPrixHistory.length < 2) {
  throw new Error("Grand Prix history did not include previous rounds.");
}

console.log(`Smoke OK: ${resolved.league.code} resolved and advanced`);

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json", ...init.headers } : init.headers
  });

  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed with ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as T;
}

async function expectStatus(path: string, status: number, init: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json", ...init.headers } : init.headers
  });

  if (response.status !== status) {
    throw new Error(`${init.method ?? "GET"} ${path} expected ${status}, got ${response.status}: ${await response.text()}`);
  }
}
