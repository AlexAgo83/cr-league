import { APP_NAME, type RaceDecision, type RaceResult } from "@cr-league/shared";
import { useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";

type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    round: number;
    status: string;
    result: RaceResult | null;
  };
  teams: Array<{
    id: string;
    name: string;
    kind: string;
    points: number;
    credits: number;
  }>;
  decisions: Array<{
    teamId: string;
    approach: RaceDecision["approach"];
    preparation: RaceDecision["preparation"];
    cardId: RaceDecision["cardId"] | null;
    rivalTeamId: string | null;
  }>;
};

type FormState = {
  leagueName: string;
  teamName: string;
  approach: RaceDecision["approach"];
  preparation: RaceDecision["preparation"];
  cardId: RaceDecision["cardId"] | "";
};

const initialForm: FormState = {
  leagueName: "Office League",
  teamName: "Circle One",
  approach: "balanced",
  preparation: "weather",
  cardId: "rain_grip"
};

export function App() {
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("Create a demo league to start.");

  const playerTeam = useMemo(() => leagueState?.teams.find((team) => team.kind === "human") ?? leagueState?.teams[0], [leagueState]);
  const playerDecision = leagueState?.decisions.find((decision) => decision.teamId === playerTeam?.id);
  const result = leagueState?.currentGrandPrix.result;

  async function createLeague() {
    await run("Creating league...", async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName
        })
      });
      setLeagueState(state);
      setMessage("League created. Submit your race directive.");
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;

    await run("Submitting directive...", async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/decisions`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          approach: form.approach,
          preparation: form.preparation,
          cardId: form.cardId || undefined
        })
      });
      setLeagueState(state);
      setMessage("Directive locked. You can launch the Grand Prix.");
    });
  }

  async function resolveGrandPrix() {
    if (!leagueState) return;

    await run("Resolving Grand Prix...", async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/resolve`, {
        method: "POST"
      });
      setLeagueState(state);
      setMessage("Grand Prix resolved.");
    });
  }

  async function run(nextMessage: string, action: () => Promise<void>) {
    setStatus("loading");
    setMessage(nextMessage);

    try {
      await action();
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("API unavailable. Start the API server and retry.");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <p className="eyebrow">Urban micro-EV racing league</p>
        <h1 id="app-title">{APP_NAME}</h1>
        <p>
          Create a demo league, set your team directive, then launch the Grand Prix.
        </p>
      </section>

      <section className="play-grid" aria-label="Demo league flow">
        <article className="panel control-panel">
          <h2>Race desk</h2>
          <p className={status === "error" ? "status error" : "status"}>{message}</p>

          <div className="field-grid">
            <label>
              League
              <input
                value={form.leagueName}
                onChange={(event) => setForm({ ...form, leagueName: event.target.value })}
                disabled={Boolean(leagueState)}
              />
            </label>
            <label>
              Team
              <input
                value={form.teamName}
                onChange={(event) => setForm({ ...form, teamName: event.target.value })}
                disabled={Boolean(leagueState)}
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              Approach
              <select value={form.approach} onChange={(event) => setForm({ ...form, approach: event.target.value as FormState["approach"] })}>
                <option value="prudent">Prudent</option>
                <option value="balanced">Balanced</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </label>
            <label>
              Preparation
              <select
                value={form.preparation}
                onChange={(event) => setForm({ ...form, preparation: event.target.value as FormState["preparation"] })}
              >
                <option value="speed">Speed</option>
                <option value="reliability">Reliability</option>
                <option value="weather">Weather</option>
              </select>
            </label>
            <label>
              Card
              <select value={form.cardId} onChange={(event) => setForm({ ...form, cardId: event.target.value as FormState["cardId"] })}>
                <option value="">No card</option>
                <option value="rain_grip">Rain Grip</option>
                <option value="fleet_maintenance">Fleet Maintenance</option>
                <option value="launch_boost">Launch Boost</option>
                <option value="urban_draft">Urban Draft</option>
                <option value="final_surge">Final Surge</option>
                <option value="fleet_sponsorship">Fleet Sponsorship</option>
              </select>
            </label>
          </div>

          <div className="actions">
            <button type="button" onClick={createLeague} disabled={status === "loading" || Boolean(leagueState)}>
              Create league
            </button>
            <button type="button" onClick={submitDirective} disabled={status === "loading" || !leagueState || Boolean(result)}>
              Submit directive
            </button>
            <button type="button" onClick={resolveGrandPrix} disabled={status === "loading" || !playerDecision || Boolean(result)}>
              Launch GP
            </button>
          </div>
        </article>

        {leagueState ? (
          <article className="panel">
            <h2>{leagueState.league.name}</h2>
            <p>
              Code {leagueState.league.code} · Round {leagueState.currentGrandPrix.round} · {leagueState.currentGrandPrix.status}
            </p>
            <ol className="classification">
              {leagueState.teams.map((team) => (
                <li key={team.id}>
                  <span>
                    <strong>{team.name}</strong> {team.kind === "bot" ? "bot" : "you"}
                  </span>
                  <span>
                    {team.points} pts · {team.credits} credits
                  </span>
                </li>
              ))}
            </ol>
          </article>
        ) : null}

        {result ? (
          <>
            <article className="panel">
              <h2>{result.grandPrixName}</h2>
              <p>{result.report.headline}</p>
              <ol className="classification">
                {result.classification.map((entry) => (
                  <li key={entry.teamId}>
                    <span>
                      <strong>P{entry.position}</strong> {entry.teamName}
                    </span>
                    <span>
                      {entry.points} pts · {entry.credits} credits
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="panel">
              <h2>Key moments</h2>
              <ul className="events">
                {result.events.slice(0, 6).map((event) => (
                  <li key={event.id}>
                    <span>Lap {event.lap}</span>
                    {event.replayText}
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel report-panel">
              <h2>Race report</h2>
              {result.report.blocks.map((block) => (
                <section key={block.title}>
                  <h3>{block.title}</h3>
                  <p>{block.body}</p>
                </section>
              ))}
            </article>
          </>
        ) : null}
      </section>
    </main>
  );
}

async function api<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}
