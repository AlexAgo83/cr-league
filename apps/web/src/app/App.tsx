import { APP_NAME, type RaceResult } from "@cr-league/shared";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";

export function App() {
  const [result, setResult] = useState<RaceResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  async function loadPreview() {
    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE_URL}/simulation/preview`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Simulation preview failed with ${response.status}`);
      }

      setResult((await response.json()) as RaceResult);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadPreview();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <p className="eyebrow">Urban micro-EV racing league</p>
        <h1 id="app-title">{APP_NAME}</h1>
        <p>
          Prepare the team, pick the race bet, play one special move, and watch
          the Grand Prix explain what happened.
        </p>
        <button type="button" onClick={loadPreview} disabled={status === "loading"}>
          {status === "loading" ? "Simulating..." : "Run demo GP"}
        </button>
      </section>

      {status === "error" ? (
        <section className="panel" role="alert">
          <h2>Simulation unavailable</h2>
          <p>Start the API server, then run the demo Grand Prix again.</p>
        </section>
      ) : null}

      {result ? (
        <section className="preview-grid" aria-label="Simulation preview">
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
        </section>
      ) : null}
    </main>
  );
}
