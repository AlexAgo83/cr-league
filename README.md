# CR League

[![CI](https://github.com/AlexAgo83/cr-league/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/cr-league/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/AlexAgo83/cr-league?include_prereleases&label=release)](https://github.com/AlexAgo83/cr-league/releases)
[![API](https://img.shields.io/website?label=api%20health&url=https%3A%2F%2Fcr-league-api.onrender.com%2Fhealth)](https://cr-league-api.onrender.com/health)
[![App](https://img.shields.io/website?label=app&url=https%3A%2F%2Fcr-league.onrender.com)](https://cr-league.onrender.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)

CR League is a private racing league where you do not drive the car. You run the team.

Build a garage, read the circuit, choose a race directive, spend cards, watch the city replay, and live with the consequences across a short asynchronous championship. It is designed for small private groups: a few friends, an office league, or a playtest room where every Grand Prix creates a new story.

## The Fantasy

You are the team principal on a compact urban EV grid.

Every round asks the same tense question: do you chase pole, protect energy, gamble on weather, or save resources for the next Grand Prix? The game compresses the best parts of motorsport management into a fast private-league loop:

- create or join a league with a lightweight profile;
- claim a team and tune its livery;
- run qualifying attempts before locking your directive;
- spend cards from the garage to shape risk and reward;
- launch the Grand Prix and watch a replayed race report;
- carry points, credits, and history into the next round.

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
