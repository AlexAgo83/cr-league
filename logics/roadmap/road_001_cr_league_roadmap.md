## road_001_cr_league_roadmap - CR League Roadmap
> Date: 2026-07-14
> Status: Accepted
> Related product: `prod_001_cr_league_product_brief`
> Related request: `req_008_define_cr_league_implementation_roadmap`
> Reminder: Update status, milestone scope, linked refs, risks, and success signals when you edit this doc.
> Confidence: 96
> Non-semantic edit: clarified pre-1.0 beta sequencing and renamed cockpit/replay seed away from V1.

# Summary
Plan CR League from the current playable prototype toward a stable private-league V1 without pretending the full game should be built in one pass.

This roadmap is the release-level companion to `spec_016_implementation_roadmap`. The spec keeps the implementation-wave detail; this document keeps the product increments, exit signals, and sequencing visible.

# Current Position
- Product discovery, core gameplay specs, architecture, device targets, theme direction, ADRs, repository governance, and implementation contracts are documented.
- The monorepo foundation exists with Vite React, Fastify, Prisma, shared simulation package, tests, lint, build, and Logics validation.
- The prototype can create a persisted demo league, submit a race directive, resolve a Grand Prix, show report/replay evidence, persist rewards, join an active league by invite code, rejoin a claimed team, advance to the next Grand Prix, restart a playtest league, configure cadence/deadline, show GP history/readiness, switch between English and French UI, show a guided GP briefing, present a state-driven race desk, buy/hold/consume simple cards, and seed a manual private-league playtest session.
- This is not yet a complete game loop: there is no automatic scheduler, notifications, deep card economy, replay polish, full auth/permissions, or production deployment.

# Milestones
## 0.1 - Playable vertical slice
- Goal: Make the smallest end-to-end CR League loop playable and technically validated.
- Status: Mostly implemented.
- Scope:
  - monorepo foundation and repository governance;
  - pure deterministic simulation core;
  - simulation preview API and starter screen;
  - minimal persisted league API;
  - playable web flow for create league, submit directive, resolve GP, and read results;
  - current-GP state guards;
  - web copy routed through the i18n catalog;
  - join-by-code prototype for an active league.
- Exit signal:
  - `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `logics-manager i18n validate`, and `npm run logics:validate` pass;
  - temporary PostgreSQL smoke creates a league, joins by code, submits a directive, resolves a GP, and rejects invalid late actions;
  - a tester can understand the core promise from one browser session.
- Linked docs:
  - `req_009_scaffold_cr_league_monorepo_foundation`
  - `req_013_implement_cr_league_pure_simulation_core`
  - `req_014_add_cr_league_simulation_preview_api_and_screen`
  - `req_015_add_minimal_league_persistence_api`
  - `req_016_add_playable_demo_league_web_flow`
  - `req_017_prepare_real_postgresql_migration_and_seed_workflow`
  - `req_018_wire_web_copy_to_i18n_catalog`
  - `req_019_harden_current_grand_prix_state_rules`
  - `req_020_add_join_league_by_code_flow`
  - `req_021_build_private_league_prototype_foundation`
  - `req_022_add_private_league_cadence_and_dashboard`

## 0.2 - Private league prototype
- Goal: Turn the current demo league into a credible private league session for colleagues.
- Status: Foundation started; playtest kit available.
- Scope:
  - stable lightweight player/team identity without full account complexity;
  - create/join/rejoin private league flow with clear invite code UX;
  - league roster view and participant status;
  - configurable cadence for manual, fast solo, and scheduled async modes;
  - preparation deadline model and missing-player default decisions;
  - next Grand Prix generation after a resolved GP;
  - basic league settings that do not require admin-heavy UI;
  - seeded manual playtest setup for a short private-league session.
- Delivered foundation:
  - team claim tokens for local rejoin;
  - `POST /leagues/rejoin`;
  - `POST /leagues/:leagueId/next-grand-prix`;
  - optional defaulted resolution through `allowDefaults`;
  - submitted/missing team action state;
  - manual cadence/deadline settings;
  - GP history and dashboard readiness/action display;
  - guarded playtest session restart that keeps league/team identity;
  - manual 3-GP playtest checklist and `PLAY01` fixture seed;
  - lightweight lap-tagged replay timeline;
  - French language switcher;
  - GP briefing with track profile, likely weather, and directive hints;
  - deterministic minor race notes for replay variety;
  - player-focused race recap with directive summary and next-GP takeaway;
  - state-driven race desk with pit-wall hierarchy and one dominant command per state;
  - first thin card inventory/shop hook for between-GP progression;
  - post-GP garage summary and contextual card fit labels.
- Exit signal:
  - 2+ human players can join the same league, prepare for the same GP, and resolve a race with absent players defaulted;
  - a solo player can bypass waiting time with bots;
  - no always-on worker is required for the happy path.
- Linked docs:
  - `prod_001_cr_league_product_brief`
  - `spec_016_implementation_roadmap`
  - `req_020_add_join_league_by_code_flow`
  - `req_024_prepare_private_league_playtest_kit`
  - `req_025_add_guided_race_weekend_experience`

## 0.3 - Playtest-ready game loop
- Goal: Make the prototype worth testing with colleagues beyond a single technical demo.
- Status: Started; cockpit/replay visual pass in progress.
- Scope:
  - 3-GP mini championship loop;
  - V2 race cockpit redesign with clear Course, Championship, Garage, and Result/Replay responsibilities;
  - static 0.3 city circuit seed: Paris Docklands Sprint/Left Bank Loop, Amsterdam Canal Loop/Harbor Sprint, Berlin Ring Sector/Mitte Dash;
  - city-circuit rendering from stored road-routed geometry, without Leaflet/OSRM runtime dependencies;
  - deterministic animated race replay with cars moving on the circuit, simple controls, visible overtakes when supported by the generated timeline, and a static readout fallback;
  - replay/report UX pass that makes player choices legible;
  - more race-event variety and non-impact flavor moments;
  - clearer dashboard for standings, next GP, deadline, and player action state;
  - reset/start-over flow for test sessions;
  - structured playtest result capture after running the checklist;
  - desktop and mobile layouts checked against real interaction paths.
- Exit signal:
  - 3 to 5 testers can complete a 3-GP session;
  - feedback can answer whether choices feel causal, whether waiting cadence is acceptable, and whether weaker players still feel in the game.
- Delivered foundation:
  - resolved GP recap panel explaining key difference, player directive, and next-GP lesson;
  - replay timeline now prioritizes player and key events before ambience notes;
  - dark Pit Wall Compact shell with desktop rail, compact header, telemetry chips, timing rows, and calmer secondary controls;
  - race desk now shows one dominant command per state instead of competing action buttons;
  - city circuit and replay panels use larger dark route surfaces with visible moving cars and clearer callouts;
  - cockpit rail now exposes Course, Directive, Championship, Garage, Replay, and Report as dedicated game views instead of hiding secondary gameplay or stacking everything on one page;
  - six 0.3 seed circuits now use stored OSRM-sampled road geometry for Paris, Amsterdam, and Berlin layouts;
  - French display now localizes redesigned report/event summaries instead of showing raw English simulator prose;
  - desktop and mobile briefing/replay screenshots captured in `~/Desktop/CRL/`;
  - desktop Prepare/Ready desk states and mobile resolved state visually checked after the pit-wall pass;
  - guarded session restart and clearer championship dashboard visually checked on desktop and mobile.
- Linked docs:
  - `spec_001_grand_prix_core_loop_and_simulation_v1`
  - `spec_016_implementation_roadmap`
  - `prod_001_cr_league_product_brief`
  - `prod_003_race_cockpit_redesign_v0_product_brief`
  - `req_032_redesign_the_cr_league_race_cockpit_v0`

## 0.4 - Economy and card depth
- Goal: Add enough card and currency depth for repeated sessions without burying the casual player.
- Status: Started with a thin inventory/shop hook; deeper economy planned.
- Scope:
  - inventory view;
  - buy/sell or draft-style card acquisition;
  - limited-use card consumption;
  - catch-up mechanisms that help low-ranked players without making first place feel random;
  - card balance telemetry or at least structured playtest notes;
  - economy rules documented before broadening the card list.
- Delivered foundation:
  - `Team.cards` persisted as JSON;
  - fixed 100-credit card purchase endpoint;
  - owned-card validation on directive submission;
  - consumed cards removed after GP resolution;
  - minimal garage UI with inventory counts, buy buttons, post-GP reward summary, and three recommended offers.
- Exit signal:
  - players earn and spend credits across multiple GPs;
  - card choices create visible replay/report moments;
  - bottom-table players have comeback options, but leaders still feel rewarded for good decisions.
- Linked docs:
  - `item_004_design_and_implement_the_v1_card_and_inventory_system`
  - `item_005_define_balancing_and_retention_mechanics_for_social_leagues`
  - `spec_001_grand_prix_core_loop_and_simulation_v1`

## 0.5 - Live beta foundation
- Goal: Move from local/private playtests to a small live beta that can run without hand-holding.
- Status: Planned.
- Scope:
  - hosted web/API/database environment;
  - repeatable deploy and smoke checks;
  - beta league creation/join/rejoin hardening;
  - basic admin reset/support path;
  - persisted short-season data that survives browser/device changes;
  - explicit known-limits page for beta testers.
- Exit signal:
  - a small invited beta group can run a short league live without local dev tooling;
  - deploy, rollback, smoke, and database backup expectations are documented.
- Linked docs:
  - `adr_001_cr_league_v1_static_pwa_api_architecture`
  - `adr_004_data_security`
  - `spec_016_implementation_roadmap`

## 0.7 - Live beta season
- Goal: Run a real beta season long enough to validate cadence, replay comprehension, economy pressure, and return behavior.
- Status: Planned.
- Scope:
  - beta season setup and lifecycle;
  - feedback capture after multiple GP cycles;
  - balance tweaks based on observed card/replay/cadence behavior;
  - notification or reminder approach if beta usage shows it is needed;
  - polish only where beta feedback proves friction.
- Exit signal:
  - beta players complete a short season with enough feedback to decide what belongs in 1.0;
  - remaining 1.0 work is known, not guessed.
- Linked docs:
  - `prod_001_cr_league_product_brief`
  - `spec_016_implementation_roadmap`

## 1.0 - Private league V1
- Goal: Ship a stable private-league experience that can run cheaply and be shared with non-gamer colleagues.
- Status: Post-beta target.
- Scope:
  - production deploy path for static web app and dedicated API;
  - PostgreSQL schema and migration discipline for hosted environments;
  - league lifecycle, roster, schedule, GP resolution, standings, cards, and reports;
  - accessibility and i18n baseline respected in product UI;
  - operational docs for configuration, smoke tests, backup expectations, and known limits;
  - minimal abuse/security guardrails appropriate for private invite-code leagues.
- Exit signal:
  - a private league can run a full short championship without manual database intervention;
  - validation and smoke gates are repeatable from a clean environment;
  - cost model stays compatible with a small hobby/private project.
- Linked docs:
  - `adr_001_cr_league_v1_static_pwa_api_architecture`
  - `adr_004_data_security`
  - `adr_006_accessibility`
  - `adr_007_i18n`
  - `adr_008_testing_quality`
  - `spec_016_implementation_roadmap`

# Sequencing
- Finish the 0.1 validation loop before expanding product surface area.
- Treat 0.2 as the next meaningful multiplayer step: private league session mechanics before economy depth.
- Keep 0.3 focused on playtest truth, not polish for its own sake.
- Defer 0.4 card/economy breadth until repeated-GP behavior exists.
- Use 0.5 for live beta foundations before pretending the product is near 1.0.
- Use 0.7 for a real beta season before locking the 1.0 scope.
- Do not start 1.0 production hardening until the live beta has produced real usage feedback.

# Next Recommended Requests
- Add automatic deadline resolution only if manual operation becomes painful in playtest.
- Implement the V2 cockpit and deterministic animated replay before adding more economy depth.
- Improve the dashboard layout only where it supports the cockpit flow.
- Re-test whether the race desk state badge and primary command make the next action obvious.
- Re-test whether the dashboard and restart flow make repeated playtests easy to operate.
- Expand card economy only after the thin garage loop has playtest feedback.

# Risks
- Building the card economy before a repeated-GP loop would tune the wrong game.
- Private multiplayer without stable rejoin identity will become frustrating even with invite codes.
- Async cadence can feel dead if the next action and deadline are not obvious.
- A richer replay can become expensive if it turns into real-time simulation, 3D, or live routing before deterministic playback proves the need.
- The prototype can drift from the Circle One / urban micro-EV tone if visual polish is postponed too long.

# References
- Product brief(s): `prod_001_cr_league_product_brief`
- Implementation roadmap spec: `spec_016_implementation_roadmap`
- Request(s): `req_008_define_cr_league_implementation_roadmap`, `req_020_add_join_league_by_code_flow`
- Backlog item(s): `item_014_define_cr_league_implementation_roadmap`, `item_026_add_join_league_by_code_flow`
- Task(s): `task_009_define_cr_league_implementation_roadmap`, `task_021_add_join_league_by_code_flow`

# AI Context
- Summary: Release-level roadmap for CR League from playable prototype to private league V1.
- Keywords: roadmap, milestones, versions, private-league, playtest, economy, release-plan
- Use when: Planning or sequencing CR League product increments across multiple requests.
- Skip when: You need execution details for a single backlog item or task.
