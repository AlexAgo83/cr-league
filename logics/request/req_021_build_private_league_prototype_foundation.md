## req_021_build_private_league_prototype_foundation - Build private league prototype foundation
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 86%
> Complexity: High
> Theme: Private league prototype
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Move CR League from a one-GP demo toward the `0.2` private league prototype milestone.
- Keep the first private-league slice deliberately small: support returning players, defaulted absent-player decisions, and moving to the next Grand Prix.
- Avoid full authentication, scheduling workers, rich lobby UX, or economy depth in this slice.

# Context
- `road_001_cr_league_roadmap` identifies `0.2 - Private league prototype` as the next major product increment.
- The current prototype can create a league, join by code, submit one directive, resolve one GP, and show results.
- A colleague-friendly async league needs at least: rejoin identity, a next GP, visible readiness state, and a way to resolve when someone is absent.

# Acceptance criteria
- AC1: Created and joined human teams receive a lightweight claim token that can be used to rejoin.
- AC2: API exposes a rejoin endpoint that returns league state and player identity for a valid team claim.
- AC3: API can start the next Grand Prix after the current one is resolved.
- AC4: API rejects starting the next Grand Prix before the current one is resolved.
- AC5: Current GP resolution can optionally proceed with default decisions for absent players.
- AC6: League state exposes readiness/missing-player action state.
- AC7: Web stores a player claim locally, attempts rejoin on reload, shows ready/missing counts, and can start the next GP.
- AC8: PostgreSQL migration and seed support team claim codes.
- AC9: API/web tests, i18n validation, build/lint/typecheck, Logics validation, and real PostgreSQL smoke pass.

# AC Traceability
- AC1 -> `task_022_build_private_league_prototype_foundation`. Proof: `Team.claimCode` is generated for created/joined teams.
- AC2 -> `task_022_build_private_league_prototype_foundation`. Proof: `POST /leagues/rejoin` implemented.
- AC3 -> `task_022_build_private_league_prototype_foundation`. Proof: `POST /leagues/:leagueId/next-grand-prix` implemented.
- AC4 -> `task_022_build_private_league_prototype_foundation`. Proof: `startNextGrandPrix` rejects unresolved current GP.
- AC5 -> `task_022_build_private_league_prototype_foundation`. Proof: `resolveCurrentGrandPrix` accepts `allowDefaults`.
- AC6 -> `task_022_build_private_league_prototype_foundation`. Proof: `LeagueState.actionState` reports submitted and missing teams.
- AC7 -> `task_022_build_private_league_prototype_foundation`. Proof: `App.tsx` stores/rejoins player claims and exposes readiness/next-GP UI.
- AC8 -> `task_022_build_private_league_prototype_foundation`. Proof: Prisma schema, migration, and seed updated.
- AC9 -> `task_022_build_private_league_prototype_foundation`. Proof: validation commands passed on 2026-07-14.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_001_cr_league_v1_static_pwa_api_architecture`

# References
- `logics/roadmap/road_001_cr_league_roadmap.md`
- `logics/request/req_020_add_join_league_by_code_flow.md`
- `scripts/smoke-league-flow.ts`

# AI Context
- Summary: First private league prototype foundation for rejoin, defaulted resolution, and next Grand Prix progression.
- Keywords: private-league, rejoin, claim-code, next-grand-prix, default-decisions, 0.2
- Use when: Reviewing or extending the 0.2 private league prototype foundation.
- Skip when: Adding full auth, notifications, economy depth, or production scheduling workers.

# Backlog
- `item_027_build_private_league_prototype_foundation`
