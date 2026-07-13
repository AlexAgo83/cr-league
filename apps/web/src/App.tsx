import { APP_NAME } from "@cr-league/shared";

export function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Urban micro-EV racing league</p>
        <h1>{APP_NAME}</h1>
        <p>
          Prepare the team, pick the race bet, play one special move, and watch
          the Grand Prix explain what happened.
        </p>
      </section>
    </main>
  );
}
