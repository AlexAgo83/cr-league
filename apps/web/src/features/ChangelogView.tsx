import type { Translator } from "../app/helpers.js";

const CHANGELOGS = [
  {
    version: "0.3.6",
    title: "Visual identity and mobile polish",
    highlights: [
      "Chalk-paper setup and profile screens.",
      "Sticky mobile topbar and cleaner document backgrounds.",
      "Garage opens on Shop by default.",
      "Raster race-map car sprites tinted by team livery.",
      "Release contract and stronger e2e coverage."
    ]
  },
  {
    version: "0.3.5",
    title: "Playtest cockpit polish",
    highlights: [
      "Race plan moved to a dedicated cockpit screen.",
      "Replay and report kept inside the Race flow.",
      "Race actions moved onto the map.",
      "Inline chrono replay and final classification on the circuit.",
      "Bot qualifying runs before plan lock."
    ]
  },
  {
    version: "0.1.0",
    title: "Initial foundation",
    highlights: [
      "Product, gameplay, theme, responsive UX, architecture, and roadmap captured through Logics.",
      "Vite React web app, Fastify API, shared simulation package, and Prisma/PostgreSQL schema.",
      "Private-league playtest loop with replay, report, i18n, garage, card inventory, and restart flow."
    ]
  }
] as const;

export function ChangelogView({ currentVersion, tt }: { currentVersion: string; tt: Translator }) {
  return (
    <div className="plan-view changelog-view">
      <section className="panel changelog-hero">
        <span className="section-kicker">{tt("changelog_kicker")}</span>
        <h2>{tt("changelog_title")}</h2>
        <p>{tt("changelog_current", { version: currentVersion })}</p>
      </section>
      <div className="changelog-list">
        {CHANGELOGS.map((entry) => (
          <article key={entry.version} className="panel changelog-entry">
            <header>
              <span>v{entry.version}</span>
              <h3>{entry.title}</h3>
            </header>
            <ul>
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
