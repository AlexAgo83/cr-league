# CR League

Tactical urban micro-EV racing league prototype.

CR League is a private-league racing game where the player acts as a team principal rather than a driver. The current repository contains a Vite React PWA, Fastify API, shared TypeScript simulation package, Prisma/PostgreSQL schema, balance simulation kit, and Logics planning corpus.

```mermaid
flowchart LR
  Web[Vite React PWA] --> API[Fastify API]
  API --> DB[(PostgreSQL schema cr_league)]
  API --> Sim[Seeded race and qualifying simulation]
  Sim --> Events[Race events and report]
  Events --> Web
```

## Current Status

Implemented:

- npm workspace monorepo
- `apps/web` Vite + React app with profile setup, pit-wall setup, race cockpit, championship, garage, replay, report, and responsive layouts
- `apps/api` Fastify API with health, simulation preview, lightweight profile recovery, league, qualifying, card, team, settings, restart, and next-GP endpoints
- `packages/shared` shared metadata, race domain types, city circuits, card catalogue, economy constants, and simulation engine
- `prisma/schema.prisma` PostgreSQL league/team/profile/card inventory/Grand Prix/decision schema with seasons, qualifying runs, liveries, and league setup limits
- TypeScript, ESLint, Vitest baseline
- Logics product, gameplay, architecture, UX, implementation-contract, and roadmap docs
- balance simulation scripts and reports under `scripts/` and `reports/balance/`

Not implemented yet:

- full authentication
- production deployment config
- automatic deadline resolution/notifications
- public matchmaking or live beta operations

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **API:** Fastify, TypeScript
- **Shared package:** TypeScript workspace package under `packages/shared`
- **Database target:** PostgreSQL with Prisma, dedicated schema `cr_league`
- **Workflow:** Logics corpus under `logics/`

## Repository Topology

- `apps/web`: PWA frontend app and game screens
- `apps/api`: Fastify API with simulation and league routes
- `packages/shared`: shared app metadata, race domain contracts, and simulation engine
- `prisma`: Prisma schema
- `logics`: product, architecture, specs, requests, backlog, and task docs
- `changelogs`: curated release notes
- `docs`: playtest, balance, and UI-zone notes
- `reports/balance`: generated balance simulation outputs

## Getting Started

Install dependencies:

```bash
npm install
```

Start the web app:

```bash
npm run dev:web
```

Start the API:

```bash
npm run dev:api
```

Open the playable demo flow:

```text
http://localhost:4873/
```

Check the API:

```bash
curl http://127.0.0.1:4874/health
curl -X POST http://127.0.0.1:4874/simulation/preview
```

Create and resolve a demo league through the API:

```bash
curl -X POST http://127.0.0.1:4874/profiles \
  -H "content-type: application/json" \
  -d '{"email":"pilot@example.test"}'

curl -X POST http://127.0.0.1:4874/leagues \
  -H "content-type: application/json" \
  -d '{"name":"Office League","teamName":"Volt Union","profileId":"<profileId>"}'

curl -X POST http://127.0.0.1:4874/leagues/<leagueId>/resolve
```

Run the real API + PostgreSQL smoke flow after the API is started:

```bash
npm run smoke:league
```

Prepare a reusable private-league playtest fixture:

```bash
npm run playtest:seed
```

This creates league code `PLAY01` with bot teams. Human testers should first create or recover a lightweight profile, then join that code from separate browser profiles. Use [docs/playtest/private-league-3gp-checklist.md](docs/playtest/private-league-3gp-checklist.md) for the manual 3-GP script and feedback prompts. The in-app `Restart session` action resets a league to round 1 while keeping joined teams and claims.

Run the balance kit:

```bash
npm run balance:sim -- --runs 300 --limit 10 --json reports/balance/latest.json
```

See [docs/balance-simulations.md](docs/balance-simulations.md) for what the output measures.

## Configuration

Copy the example environment file when local runtime config is needed:

```bash
cp .env.example .env
```

Current variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cr_league?schema=cr_league"
API_HOST="127.0.0.1"
API_PORT="4874"
WEB_ORIGIN="http://localhost:4873"
```

Prepare the local PostgreSQL schema:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

For hosted or non-interactive environments, use:

```bash
npm run db:deploy
```

Rules:

- never commit `.env`;
- never use `schema=public`;
- frontend `VITE_*` values are public by design when added later;
- secrets belong in backend/runtime environment, not in source files.

## Validation

Run the local quality gate:

```bash
npm run typecheck
npm run build
npm test
npm run test:e2e
npm run lint
npm run db:generate
npm run logics:validate
```

`npm install` may use a local cache if the global npm cache is unhealthy:

```bash
npm install --cache .npm-cache
```

`.npm-cache/` is ignored by Git.

## Logics Workflow

The project planning and delivery memory lives under `logics/`.

Useful commands:

```bash
logics-manager status
logics-manager lint --require-status
logics-manager audit --group-by-doc
```

The current release roadmap is:

- `logics/roadmap/road_001_cr_league_roadmap.md`

The detailed implementation-wave roadmap is:

- `logics/specs/spec_016_implementation_roadmap.md`

Current roadmap direction:

- `0.1` playable vertical slice is implemented;
- `0.2` private league prototype foundation is implemented for local/private playtests: lightweight profile recovery, create/join/rejoin, manual cadence, readiness, GP history, restart, seed fixture, i18n, and guarded state rules;
- `0.3` playtest game loop is now the active polish lane: guided race prep, qualifying attempts with replay, animated road-routed city replays, compact profile/pit-wall entry screens, championship history replay, season rollover, garage, cards, and balance checks are present but still need real playtest validation;
- `0.4` economy/card depth has started with inventory/shop, 15 cards, prices, credits, recommendations, and a balance simulation kit; broader progression should wait for playtest signal.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
