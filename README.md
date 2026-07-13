# CR League

Tactical urban micro-EV racing league prototype.

CR League is a solo-first, private-league-ready racing game where the player acts as a team principal rather than a driver. The current repository contains a Vite React PWA shell, Fastify API, shared TypeScript simulation package, Prisma/PostgreSQL schema, and Logics planning corpus.

```mermaid
flowchart LR
  Web[Vite React PWA] --> API[Fastify API]
  API --> DB[(PostgreSQL schema cr_league)]
  API --> Sim[Future seeded simulation]
  Sim --> Events[Race events and report]
  Events --> Web
```

## Current Status

Implemented:

- npm workspace monorepo
- `apps/web` Vite + React shell with playable demo league flow
- `apps/api` Fastify API with health, simulation preview, and minimal league endpoints
- `packages/shared` shared metadata, race domain types, demo race, and simulation engine
- `prisma/schema.prisma` PostgreSQL league/team/Grand Prix/decision schema
- TypeScript, ESLint, Vitest baseline
- Logics product, gameplay, architecture, UX, implementation-contract, and roadmap docs

Not implemented yet:

- full gameplay UI
- authentication
- private multiplayer
- deployment config

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript
- **API:** Fastify, TypeScript
- **Shared package:** TypeScript workspace package under `packages/shared`
- **Database target:** PostgreSQL with Prisma, dedicated schema `cr_league`
- **Workflow:** Logics corpus under `logics/`

## Repository Topology

- `apps/web`: PWA frontend shell and demo league flow
- `apps/api`: Fastify API with simulation and league routes
- `packages/shared`: shared app metadata, race domain contracts, and simulation engine
- `prisma`: Prisma schema
- `logics`: product, architecture, specs, requests, backlog, and task docs
- `changelogs`: curated release notes

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
curl -X POST http://127.0.0.1:4874/leagues \
  -H "content-type: application/json" \
  -d '{"name":"Office League","teamName":"Circle One"}'

curl -X POST http://127.0.0.1:4874/leagues/<leagueId>/resolve
```

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
npm run lint
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

The current implementation roadmap is:

- `logics/specs/spec_016_implementation_roadmap.md`

Next planned code wave:

- scaffolded foundation is complete;
- next wave should implement the pure simulation core.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
