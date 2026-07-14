## spec_016_implementation_roadmap - Implementation Roadmap
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: Implementation order reflects the current prototype reality: private-league foundation, race recap readability, a thin garage/card progression hook, garage guidance, first-pass race desk immersion, session restart, and dashboard clarity were pulled forward after playtest feedback.
> Confidence: 90
> Related request: `req_008_define_cr_league_implementation_roadmap`
> Related backlog: `item_014_define_cr_league_implementation_roadmap`
> Related task: `task_009_define_cr_league_implementation_roadmap`
> Related product: `prod_001_cr_league_product_brief`
> Related architecture: `adr_001_cr_league_v1_static_pwa_api_architecture`
> Implementation note: The current prototype intentionally pulled private-league foundation, a thin card inventory/shop hook, race desk immersion, and repeatable playtest operation forward after playtest feedback.

# Purpose
Define the implementation order for CR League.

The roadmap should move from planning to code without trying to build the full V1 at once.

# Implementation Principle
Prove the solo Grand Prix loop first.

Everything else is secondary until the player can:

1. create a team;
2. see a race briefing;
3. choose a plan, technical bet, card, and rival;
4. resolve a race;
5. understand the report;
6. see standings and rewards;
7. want to run the next Grand Prix.

# Current Delivered Slice Notes
- The playable web/API prototype now supports private league create/join/rejoin, manual cadence, readiness, GP history, guarded session restart, guided briefing, state-driven race desk guidance, player-focused race recap, replay flavor events, English/French UI switching, and a seeded `PLAY01` playtest fixture.
- A thin between-GP progression hook exists before the full economy wave: teams persist `cards`, human teams start with `rain_grip`, players can buy fixed-price cards with credits, directives validate owned cards, resolved GPs consume played cards, and the garage now explains rewards, consumed cards, and contextual card fit.
- This does not replace the later economy/card-depth wave. Selling, rarity, draft offers, catch-up tuning, balance telemetry, and a richer collection UI remain out of scope until playtest feedback proves the thin loop.
- This also does not replace the later replay/visual polish wave. The current desk pass improves hierarchy and action clarity, but it is still not a visual track replay or final art direction.

# Wave 1: Monorepo Foundation
Goal: create the technical skeleton with no game complexity.

Scope:

- npm workspace monorepo;
- `apps/web` Vite React TypeScript app;
- `apps/api` Fastify TypeScript app;
- `packages/shared` TypeScript package;
- `prisma/schema.prisma`;
- root scripts for build, typecheck, lint, test;
- API `/health`;
- web app shell;
- baseline Vitest setup.

Exit criteria:

- `npm run typecheck` passes;
- `npm run build` passes;
- API health endpoint runs locally;
- web app runs locally;
- no production gameplay code yet.

Exclusions:

- no auth;
- no real DB behavior beyond Prisma setup if needed;
- no gameplay UI beyond shell.

# Wave 2: Pure Simulation Core
Goal: implement the game heart without API/UI/DB coupling.

Scope:

- shared or API-local simulation types;
- seedable PRNG;
- card definitions for first six cards;
- segment-based simulation;
- event timeline output;
- classification and rewards;
- report block generation;
- unit tests with fixed seeds.

Exit criteria:

- deterministic simulation tests pass;
- at least one Silver Ridge-style sample race produces meaningful events;
- every played card produces report/replay evidence.

Exclusions:

- no frontend replay yet;
- no DB persistence;
- no balance perfection.

# Wave 3: Prisma Data Model And API Solo Flow
Goal: persist and resolve solo championships.

Scope:

- Prisma schema subset from `spec_010`;
- seed card definitions;
- API endpoints:
  - `POST /api/solo/championships`;
  - `GET /api/leagues/:leagueId`;
  - `GET /api/races/:grandPrixId/briefing`;
  - `PUT /api/races/:grandPrixId/decision`;
  - `POST /api/races/:grandPrixId/resolve`;
  - `GET /api/races/:grandPrixId/result`;
  - `GET /api/teams/:teamId/inventory`;
- idempotent race resolution;
- default bot decisions.

Exit criteria:

- solo championship can be created through API;
- race can be decided, resolved, and fetched;
- duplicate resolve does not double-award credits or consume cards twice;
- API tests cover the core flow.

Exclusions:

- no private multiplayer;
- no full auth;
- no Render deployment yet.

# Wave 4: Web Solo Vertical Slice
Goal: make the loop playable in the browser.

Scope:

- team setup;
- solo dashboard;
- briefing;
- preparation form;
- result/report screen;
- standings panel;
- inventory/card offer basics;
- mobile-first responsive layout.

Exit criteria:

- player can complete at least 3 GP in browser;
- report explains the result;
- mobile and desktop layouts are usable;
- no hover-only controls.

Exclusions:

- no polished replay required yet;
- no multiplayer UI;
- no full shop.

# Wave 5: Highlight Replay And UX Polish
Goal: make results feel alive.

Scope:

- event-driven highlight replay;
- player/rival/card event emphasis;
- short mobile replay;
- larger desktop replay;
- report/replay linking;
- first pass visual theme for urban micro-EV.
- state-driven race desk that makes the current command obvious.
- clearer championship dashboard for playtest operation.

Exit criteria:

- replay renders from stored event timeline;
- replay is readable on mobile and desktop;
- report and replay tell the same story.

Exclusions:

- no 3D;
- no Pixi unless plain SVG/Canvas is insufficient;
- no long broadcast mode.

# Wave 6: Playtest Preparation
Goal: prepare the first useful test.

Scope:

- test fixture data;
- reset/start-over action;
- 3 GP prototype season;
- lightweight playtest checklist;
- known issue list;
- feedback capture notes.

Exit criteria:

- 3 to 5 testers can run a 3 GP session;
- feedback can answer whether choices feel causal and fun.

Exclusions:

- no public release;
- no analytics platform unless trivial;
- no multiplayer testing yet.

# Wave 7: Private Multiplayer Foundation
Goal: add the first private league layer after solo proves the loop.

Scope:

- invite codes;
- stable player identity;
- league creation/join;
- preparation deadlines;
- missing-player defaults;
- lazy race resolution for due races.

Exit criteria:

- 2+ human players can join a private league;
- race resolves with defaults for absent players;
- no always-on worker required.

Exclusions:

- no public matchmaking;
- no notifications unless needed;
- no live race watching.

# Recommended Next Request
Create the first code request:

> Scaffold CR League monorepo foundation

It should cover Wave 1 only.

Acceptance criteria for that request should include:

- `apps/web` exists and runs;
- `apps/api` exists and exposes `/health`;
- `packages/shared` builds;
- `prisma/schema.prisma` exists;
- root scripts exist;
- typecheck/build/test baseline pass.

# Non-goals
- Do not scaffold everything in one wave.
- Do not implement multiplayer before solo loop works.
- Do not add auth before there is a real multiplayer need.
- Do not add a rendering engine before simple replay fails.
- Do not tune economy before simulation/playtest feedback exists.

# Open Questions
- Should Wave 1 include local Docker Postgres, or wait until Wave 3?
- Should simulation live in `packages/shared` or API first and export only types?
- Should Wave 4 use real API only, or allow local mocked data for UI speed?
