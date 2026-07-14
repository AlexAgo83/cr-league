## spec_016_implementation_roadmap - Implementation Roadmap
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: Implementation order reflects the current prototype reality: private-league foundation, race recap readability, replay, qualifying, seasons, garage/card progression, balance simulation, race desk immersion, session restart, and dashboard clarity were pulled forward after playtest feedback.
> Confidence: 90
> Related request: `req_008_define_cr_league_implementation_roadmap`
> Related backlog: `item_014_define_cr_league_implementation_roadmap`
> Related task: `task_009_define_cr_league_implementation_roadmap`
> Related product: `prod_001_cr_league_product_brief`
> Related architecture: `adr_001_cr_league_v1_static_pwa_api_architecture`
> Implementation note: The current prototype intentionally pulled private-league foundation, a thin card inventory/shop hook, qualifying, replay, season rollover, balance tooling, race desk immersion, and repeatable playtest operation forward after playtest feedback.

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
- The playable web/API prototype now supports private league create/join/rejoin, manual cadence, readiness, GP history replay, guarded session restart, guided briefing, state-driven race desk guidance, player-focused race recap, animated road-routed replay, qualifying attempts, English/French UI switching, seasons, and a seeded `PLAY01` playtest fixture.
- A between-GP progression hook exists before the full economy wave: teams persist `cards`, human teams start with `rain_grip`, players can buy fixed-price cards with credits, directives validate owned cards, qualifying cards can lock the chrono card choice, resolved GPs consume played cards, and the garage now shows inventory/shop, rewards, livery, and contextual card fit.
- The balance kit exists and should be run before broadening cards/prices/credits again: `npm run balance:sim -- --runs 300 --limit 10 --json reports/balance/latest.json`.
- This does not replace the later economy/card-depth wave. Selling, rarity, draft offers, richer catch-up tuning, and collection depth remain out of scope until playtest feedback proves the thin loop.

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
- card definitions for the first prototype cards;
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
  - `POST /profiles`;
  - `POST /profiles/recover`;
  - `POST /leagues`;
  - `POST /leagues/join`;
  - `POST /leagues/rejoin`;
  - `GET /leagues/:leagueId`;
  - `POST /leagues/:leagueId/decisions`;
  - `POST /leagues/:leagueId/qualifying`;
  - `POST /leagues/:leagueId/resolve`;
  - `POST /leagues/:leagueId/next-grand-prix`;
  - `POST /leagues/:leagueId/cards/buy`;
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

- road-routed animated replay;
- player/rival/card event emphasis;
- short mobile replay;
- larger desktop replay;
- report/replay linking;
- first pass visual theme for urban micro-EV.
- state-driven race desk that makes the current command obvious.
- clearer championship dashboard for playtest operation.
- compact profile and pit-wall entry screens over the ambient replay map.
- replayable GP history from the championship screen.

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
- configurable GP-per-season limit and season rollover;
- qualifying attempt limits and qualifying replay;
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

# Wave 8: Balance And Economy Hardening
Goal: make cards, credits, qualifying, and circuits credible enough for repeated playtests.

Scope:

- balance simulation report for approaches, preparations, cards, circuits, grid, credits, and outliers;
- 15-card catalogue sanity pass;
- card price and credit payout checks;
- bot card purchase and qualifying behavior;
- documented known limits before adding rarity, selling, or draft offers.

Exit criteria:

- balance run output is saved under `reports/balance/`;
- no card or circuit obviously dominates the smoke run;
- playtest checklist asks about card value, credits, qualifying fairness, and comeback pressure.

Exclusions:

- no permanent upgrades;
- no card rarity/crafting;
- no live analytics platform.

# Recommended Next Request
Run the current prototype through a real private playtest pass before adding another feature lane.

Acceptance criteria for the next useful request should include:

- 3 to 5 testers complete a short season with qualifying, directives, replay, report, garage, and next-GP flow;
- notes capture whether qualifying feels fair, cards feel understandable, and replay matches the result;
- `npm run balance:sim -- --runs 300 --limit 10 --json reports/balance/latest.json` is attached to the playtest notes;
- the next roadmap update chooses between replay clarity, card economy, async cadence, or beta deployment based on that evidence.

# Non-goals
- Do not scaffold everything in one wave.
- Do not implement multiplayer before solo loop works.
- Do not add auth before there is a real multiplayer need.
- Do not add a rendering engine before simple replay fails.
- Do not tune economy before simulation/playtest feedback exists.

# Open Questions
- Does the current qualifying model make grid position feel earned without making GP outcomes too deterministic?
- Are card prices and credit rewards tight enough to make buying a choice, not an automatic click?
- Does season rollover need a dedicated season-history UI before live beta?
- Is automatic deadline resolution necessary for private playtests, or can manual launch remain the simpler operating model?
