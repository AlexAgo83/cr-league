const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:4874";

type LeagueState = {
  league: {
    id: string;
    code: string;
  };
  currentGrandPrix: {
    status: string;
    result: unknown;
  };
  teams: Array<{
    id: string;
    kind: string;
  }>;
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
  method: "POST"
});

if (resolved.currentGrandPrix.status !== "resolved" || !resolved.currentGrandPrix.result) {
  throw new Error("Grand Prix did not resolve.");
}

console.log(`Smoke OK: ${resolved.league.code} resolved`);

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed with ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as T;
}
