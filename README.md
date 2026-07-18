# CR League

<p align="center">
  <a href="https://cr-league.onrender.com">
    <img src="docs/assets/readme/replay-desktop.png" alt="CR League race replay showing the Paris Docklands Sprint circuit, two cars, weather, traits, event markers, and replay controls." width="960">
  </a>
</p>

[![CI](https://github.com/AlexAgo83/cr-league/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/cr-league/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/AlexAgo83/cr-league?include_prereleases&label=release)](https://github.com/AlexAgo83/cr-league/releases)
[![API](https://img.shields.io/website?label=api%20health&url=https%3A%2F%2Fcr-league-api.onrender.com%2Fhealth)](https://cr-league-api.onrender.com/health)
[![App](https://img.shields.io/website?label=app&url=https%3A%2F%2Fcr-league.onrender.com)](https://cr-league.onrender.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)

**A private motorsport league where you do not drive the car. You run the team.**

CR League turns a small group into a compact team-principal championship: read the circuit, gamble on weather, spend garage cards, lock a race directive, then watch the city replay decide who was clever and who just got lucky.

Built for office leagues, friend groups, and playtest rooms where every Grand Prix leaves a story for the next round.

<p>
  <a href="https://cr-league.onrender.com"><strong>Play the live build</strong></a>
  ·
  <a href="https://cr-league-api.onrender.com/health">API health</a>
  ·
  <a href="docs/release-contract.md">Release contract</a>
</p>

## Why It Works

Every round asks one sharp question: do you chase pole, protect energy, gamble on weather, or save resources for the next Grand Prix?

| Moment | What the player does |
| --- | --- |
| **Briefing** | Read the city circuit, weather odds, traits, and championship pressure. |
| **Qualifying** | Run limited lap attempts before the race plan is locked. |
| **Directive** | Pick approach, preparation, rival pressure, and one card from the garage. |
| **Replay** | Watch the race unfold with event markers, gaps, weather, and report copy. |
| **Progression** | Carry points, credits, cards, livery, and history into the next round. |

## Screenshots

<table>
  <tr>
    <td width="58%">
      <img src="docs/assets/readme/cockpit-desktop.png" alt="CR League race cockpit with Paris circuit map, lap timing, traits, and race plan actions.">
    </td>
    <td width="42%">
      <img src="docs/assets/readme/plan-mobile.png" alt="CR League mobile race plan panel with approach, preparation, and directive controls.">
    </td>
  </tr>
  <tr>
    <td><strong>Race cockpit</strong><br>Full-width circuit reading, lap timing, qualifying, and launch controls.</td>
    <td><strong>Mobile plan</strong><br>The same race directive loop is usable on a phone.</td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="docs/assets/readme/championship-desktop.png" alt="CR League championship dashboard with standings, current GP, timeline, and league controls.">
    </td>
  </tr>
  <tr>
    <td colspan="2"><strong>Private championship hub</strong><br>League code, standings, round history, settings, and progression in one cockpit.</td>
  </tr>
</table>

## Live Preview

- App: [cr-league.onrender.com](https://cr-league.onrender.com)
- API health: [cr-league-api.onrender.com/health](https://cr-league-api.onrender.com/health)
- Release contract: [docs/release-contract.md](docs/release-contract.md)

Production uses a static Render site, a Fastify API, and a shared PostgreSQL database with a dedicated `cr_league` schema.

## Gameplay Loop

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

## What Is Built

CR League is already a playable vertical slice with persistence:

- profile creation, recovery code, league switching, and saved claims;
- private league create, join, rejoin, restart, and next-Grand-Prix flows;
- manual cadence with settings, readiness states, and guarded race actions;
- qualifying attempts, best-lap history, and replay support;
- seeded city-circuit race simulation with weather, traits, events, and reports;
- garage inventory, card shop, prices, credits, livery editing, and team rename;
- season history, championship standings, replayable past Grand Prix, and rollover;
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
- `0.3`: playtest game loop polish is active;
- `0.4`: economy and card depth has started, with broader progression waiting for playtest signal.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
