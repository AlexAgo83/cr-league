## road_001_cr_league_roadmap - CR League Roadmap
> Date: 2026-07-14
> Status: Proposed
> Related product: `prod_001_cr_league_product_brief`
> Related request: `req_008_define_cr_league_implementation_roadmap`
> Reminder: Update status, milestone scope, linked refs, risks, and success signals when you edit this doc.

# Summary
Plan CR League from the current playable prototype toward a stable private-league V1 without pretending the full game should be built in one pass.

This roadmap is the release-level companion to `spec_016_implementation_roadmap`. The spec keeps the implementation-wave detail; this document keeps the product increments, exit signals, and sequencing visible.

# Current Position
- Product discovery, core gameplay specs, architecture, device targets, theme direction, ADRs, repository governance, and implementation contracts are documented.
- The monorepo foundation exists with Vite React, Fastify, Prisma, shared simulation package, tests, lint, build, and Logics validation.
- The prototype can create a persisted demo league, submit a race directive, resolve a Grand Prix, show report/replay evidence, persist rewards, and join an active league by invite code.
- This is not yet a complete game loop: there is no multi-GP season progression, card inventory economy, replay polish, league schedule/deadline system, auth/player identity, or production deployment.

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

## 0.2 - Private league prototype
- Goal: Turn the current demo league into a credible private league session for colleagues.
- Status: Next major product increment.
- Scope:
  - stable lightweight player/team identity without full account complexity;
  - create/join/rejoin private league flow with clear invite code UX;
  - league roster view and participant status;
  - configurable cadence for manual, fast solo, and scheduled async modes;
  - preparation deadline model and missing-player default decisions;
  - next Grand Prix generation after a resolved GP;
  - basic league settings that do not require admin-heavy UI.
- Exit signal:
  - 2+ human players can join the same league, prepare for the same GP, and resolve a race with absent players defaulted;
  - a solo player can bypass waiting time with bots;
  - no always-on worker is required for the happy path.
- Linked docs:
  - `prod_001_cr_league_product_brief`
  - `spec_016_implementation_roadmap`
  - `req_020_add_join_league_by_code_flow`

## 0.3 - Playtest-ready game loop
- Goal: Make the prototype worth testing with colleagues beyond a single technical demo.
- Status: Planned.
- Scope:
  - 3-GP mini championship loop;
  - replay/report UX pass that makes player choices legible;
  - clearer dashboard for standings, next GP, deadline, and player action state;
  - reset/start-over flow for test sessions;
  - lightweight playtest checklist and feedback capture;
  - desktop and mobile layouts checked against real interaction paths.
- Exit signal:
  - 3 to 5 testers can complete a 3-GP session;
  - feedback can answer whether choices feel causal, whether waiting cadence is acceptable, and whether weaker players still feel in the game.
- Linked docs:
  - `spec_001_grand_prix_core_loop_and_simulation_v1`
  - `spec_016_implementation_roadmap`
  - `prod_001_cr_league_product_brief`

## 0.4 - Economy and card depth
- Goal: Add enough card and currency depth for repeated sessions without burying the casual player.
- Status: Planned.
- Scope:
  - inventory view;
  - buy/sell or draft-style card acquisition;
  - limited-use card consumption;
  - catch-up mechanisms that help low-ranked players without making first place feel random;
  - card balance telemetry or at least structured playtest notes;
  - economy rules documented before broadening the card list.
- Exit signal:
  - players earn and spend credits across multiple GPs;
  - card choices create visible replay/report moments;
  - bottom-table players have comeback options, but leaders still feel rewarded for good decisions.
- Linked docs:
  - `item_004_design_and_implement_the_v1_card_and_inventory_system`
  - `item_005_define_balancing_and_retention_mechanics_for_social_leagues`
  - `spec_001_grand_prix_core_loop_and_simulation_v1`

## 1.0 - Private league V1
- Goal: Ship a stable private-league experience that can run cheaply and be shared with non-gamer colleagues.
- Status: Target.
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
- Do not start 1.0 production hardening until the private-league loop has survived at least one real playtest.

# Next Recommended Requests
- Add multi-GP season progression and next Grand Prix generation.
- Add lightweight player/team identity and rejoin behavior.
- Add preparation deadline/default-decision rules.
- Improve the dashboard for league state, next action, and joined players.
- Add a first replay visualization pass from the stored event timeline.

# Risks
- Building the card economy before a repeated-GP loop would tune the wrong game.
- Private multiplayer without stable rejoin identity will become frustrating even with invite codes.
- Async cadence can feel dead if the next action and deadline are not obvious.
- A richer replay can become expensive if it starts with 3D before a simple event-driven view proves the need.
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
