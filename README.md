# CR League

<p align="center">
  <a href="https://cr-league.onrender.com">
    <img src="docs/assets/readme/market-replay.png" alt="CR League live race replay with a city circuit, timing controls, leaderboard, track traits, and race director callout." width="960">
  </a>
</p>

[![CI](https://github.com/AlexAgo83/cr-league/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/cr-league/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/AlexAgo83/cr-league?include_prereleases&label=release)](https://github.com/AlexAgo83/cr-league/releases)
[![API](https://img.shields.io/website?label=api%20health&url=https%3A%2F%2Fcr-league-api.onrender.com%2Fhealth)](https://cr-league-api.onrender.com/health)
[![App](https://img.shields.io/website?label=app&url=https%3A%2F%2Fcr-league.onrender.com)](https://cr-league.onrender.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)

**Create a private Grand Prix league. Run the team. Watch the race answer your decisions.**

CR League is a multiplayer race-strategy game for small groups. Every player owns a team, reads the same circuit briefing, gambles on weather, spends garage cards, and locks one race plan before the Grand Prix launches.

You do not steer the car. You make the calls from the pit wall: protect the tires, attack early, prep for rain, save credits, burn a card, or hold the garage for the next round. Then the replay turns those choices into overtakes, mistakes, rewards, and grudges for the next GP.

Built for office leagues, friend groups, Discord servers, and playtest rooms where a championship should take minutes to run and still leave everyone with a story.

<p>
  <a href="https://cr-league.onrender.com"><strong>Play the live build</strong></a>
  ·
  <a href="https://cr-league-api.onrender.com/health">API health</a>
  ·
  <a href="docs/release-contract.md">Release contract</a>
</p>

## The Pitch

CR League compresses the fantasy of running a motorsport team into a short asynchronous loop:

| Phase | Player fantasy |
| --- | --- |
| **Read the track** | Spot what the circuit rewards: grip, attack, endurance, weather, timing. |
| **Set the plan** | Choose the risk profile, tire preparation, and one card that can swing the GP. |
| **Launch the race** | Review the grid, send the field away, and let the simulation expose the tradeoffs. |
| **Watch the replay** | Follow the cars, timing, incidents, weather beats, and race director moments. |
| **Build the season** | Score points, earn credits, buy cards, tune identity, and carry history forward. |

## Why Players Come Back

- **One decision is enough to matter.** Each GP is readable without becoming a spreadsheet.
- **The replay creates receipts.** Players see when their plan helped, failed, or got rescued by chaos.
- **The garage adds memory.** Credits and cards make the next race feel connected to the last one.
- **The league becomes social.** Standings, palmares, GP history, and team identity give every group its own lore.
- **It works for casual rooms.** No wheel, reflexes, or long session required.

## Product Tour

<table>
  <tr>
    <td colspan="2">
      <img src="docs/assets/readme/market-plan.png" alt="CR League plan screen with track briefing, grip, overtaking, energy, and race plan choices.">
    </td>
  </tr>
  <tr>
    <td colspan="2"><strong>Plan from the pit wall</strong><br>Read the track traits, compare chrono attempts, pick an approach, prep the right tires, and decide whether the next GP deserves a card.</td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/assets/readme/market-championship.png" alt="CR League championship screen with current GP, leader, players, standings, palmares, and Grand Prix history tabs.">
    </td>
    <td width="50%">
      <img src="docs/assets/readme/market-garage.png" alt="CR League garage shop with team header, points, credits, and strategy cards for sale.">
    </td>
  </tr>
  <tr>
    <td><strong>Run the championship</strong><br>Track leaders, readiness, standings, palmares, and every GP in the season arc.</td>
    <td><strong>Build the garage</strong><br>Turn results into credits, buy situational cards, and shape the team between races.</td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="docs/assets/readme/market-report.png" alt="CR League race report with finishing order, race phases, rewards, and personalized race recap.">
    </td>
  </tr>
  <tr><td colspan="2"><strong>Debrief the result</strong><br>Race phases, rewards, movement, and recap copy explain why the GP broke the way it did.</td></tr>
</table>

## Live Preview

- App: [cr-league.onrender.com](https://cr-league.onrender.com)
- API health: [cr-league-api.onrender.com/health](https://cr-league-api.onrender.com/health)
- Release contract: [docs/release-contract.md](docs/release-contract.md)

Production uses a static Render site, a Fastify API, and a shared PostgreSQL database with a dedicated `cr_league` schema.

## Game Loop

```mermaid
flowchart LR
  Profile[Create or recover profile] --> League[Create or join league]
  League --> Briefing[Read circuit and forecast]
  Briefing --> Qualifying[Run qualifying attempts]
  Qualifying --> Directive[Lock approach, prep, and card]
  Directive --> Race[Resolve Grand Prix]
  Race --> Replay[Animated replay and report]
  Replay --> Garage[Credits, cards, livery]
  Garage --> Briefing
```

## What Ships Today

CR League is already playable end to end:

- profile creation, recovery code, league switching, and saved claims;
- private league create, join, rejoin, restart, and next-Grand-Prix flows;
- manual cadence with settings, readiness states, and guarded race actions;
- qualifying attempts, chrono reports, best-lap history, and replay support;
- seeded city-circuit race simulation with weather, traits, events, and reports;
- garage inventory, card shop, prices, credits, livery editing, and team rename;
- season history, championship standings, replayable past Grand Prix, and rollover;
- inline pending feedback for API-backed actions across setup, race flow, garage, admin, and settings;
- English/French UI baseline and responsive cockpit layouts.

Still intentionally light:

- no full account authentication;
- no public matchmaking;
- no automated deadline scheduler or notifications;
- no live-ops tooling beyond the current private-playtest workflow.

## Architecture

```mermaid
flowchart LR
  Web[Vite React PWA] --> API[Fastify API]
  API --> DB[(PostgreSQL schema cr_league)]
  API --> Sim[Shared deterministic simulation]
  Sim --> Race[Qualifying, events, replay, report]
  Race --> Web
```

- `apps/web`: React 19 + Vite frontend, cockpit, garage, replay, and profile flows.
- `apps/api`: Fastify API, health, profile, league, qualifying, card, team, settings, restart, and progression endpoints.
- `packages/shared`: app metadata, race contracts, card catalogue, economy constants, circuits, and simulation engine.
- `prisma`: PostgreSQL schema and migrations targeting a dedicated `cr_league` schema.
- `logics`: product, architecture, roadmap, request, backlog, and task corpus.
- `docs`: playtest scripts, balance notes, release contract, and UI notes.
- `reports/balance`: generated balance simulation outputs.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **API:** Fastify, TypeScript
- **Database:** PostgreSQL, Prisma, schema-scoped deployment
- **Testing:** Vitest, Playwright, ESLint, TypeScript project builds
- **Delivery:** GitHub Actions, Render Blueprint, release health verification
- **Planning:** Logics corpus under `logics/`

## Quick Start

Install dependencies:

```bash
npm install
```

Prepare local config:

```bash
cp .env.example .env
```

Use a schema-scoped database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cr_league?schema=cr_league"
API_HOST="127.0.0.1"
API_PORT="4874"
WEB_ORIGIN="http://localhost:4873"
VITE_API_BASE_URL="http://localhost:4874"
ADMIN_EMAILS="admin@example.test"
ADMIN_TOKEN="change-me"
```

Prepare Prisma:

```bash
npm run db:generate
npm run db:migrate
```

Run the app:

```bash
npm run dev:api
npm run dev:web
```

Open:

```text
http://localhost:4873/
```

Check the API:

```bash
curl http://127.0.0.1:4874/health
```

## Useful Scripts

```bash
npm run typecheck
npm run build
npm test
npm run test:e2e
npm run lint
npm run logics:validate
```

Seed a private playtest league:

```bash
npm run playtest:seed
```

This creates league code `PLAY01` with bot teams. Use [docs/playtest/private-league-3gp-checklist.md](docs/playtest/private-league-3gp-checklist.md) for the manual three-Grand-Prix playtest script.

Run balance simulations:

```bash
npm run balance:sim -- --runs 300 --limit 10 --json reports/balance/latest.json
```

See [docs/balance-simulations.md](docs/balance-simulations.md) for the metrics.

## Render Configuration

The Blueprint creates:

- `cr-league`: static site at `https://cr-league.onrender.com`;
- `cr-league-api`: API at `https://cr-league-api.onrender.com`.

Runtime values stay in Render:

```text
WEB_ORIGIN=https://cr-league.onrender.com
VITE_API_BASE_URL=https://cr-league-api.onrender.com
DATABASE_URL=postgresql://.../alex_db_mnb8?schema=cr_league
```

Rules:

- never commit `.env`;
- never use `schema=public`;
- `VITE_*` values are public and end up in the browser bundle;
- database URLs and other secrets belong only in backend/runtime environment variables.

## Release Contract

Releases are immutable GitHub releases. The deploy workflow verifies that package versions match the tag, triggers Render deploy hooks, and polls `/health` until production reports the expected version and commit.

Details: [docs/release-contract.md](docs/release-contract.md)

## Logics Workflow

The delivery corpus lives under `logics/`.

Useful commands:

```bash
logics-manager status
logics-manager lint --require-status
logics-manager audit --group-by-doc
```

Current roadmap direction:

- `0.1`: playable vertical slice implemented;
- `0.2`: private league prototype foundation implemented;
- `0.3`: playtest game loop polish has reached navigation/admin/circuit patch `0.3.9`, with API pending feedback and image placeholders in the web app;
- `0.4`: ship rails are implemented; economy depth waits for playtest signal.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
