## req_091_modularize_the_oversized_leagues_store - Modularize the oversized leagues store
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Backend maintainability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Break apps/api/src/features/leagues/store.ts into cohesive modules organized by lifecycle so the file stops being a single 1197-line grab-bag.
- Keep the public import surface identical: leagues/routes.ts, admin/store.ts, and every test must import the same named symbols from the same path with no source changes.
- Preserve behavior exactly — no change to transaction boundaries, row locks, rule errors, or race-integrity guarantees added in the recent hardening pass.
- Give contributors an obvious home for each concern (profiles, league lifecycle, cards, decisions, qualifying, resolution, state reads, shared transaction helpers).

# Context
- This is a backend Fastify + Prisma workspace under apps/api.
- store.ts is behavior-critical: it holds the race-integrity fixes (in-transaction re-checks with lockTeamRow/lockGrandPrixRow) landed in the current branch.
- No new dependencies are wanted; this is a pure internal reorganization.
- The repo convention keeps a module's public API as named exports; a barrel re-export from store.ts keeps consumers untouched.

# Acceptance criteria
- AC1: store.ts is split into cohesive per-lifecycle modules (e.g. profiles, league lifecycle, cards, decisions, qualifying, resolution, state reads) plus one shared transaction-helpers module.
- AC2: The shared transaction helpers (runWrite, lockTeamRow, lockGrandPrixRow, getCurrentGrandPrix, normalizeQualifyingRuns, requireTeamClaim, requireAdminClaim) live in one module and are imported by the lifecycle modules that need them, with no duplicated logic.
- AC3: store.ts remains a barrel that re-exports every symbol currently imported by routes.ts, admin/store.ts, and the tests, so no consumer or test import path changes.
- AC4: No behavior change — transaction boundaries, row locks, LeagueRuleError messages, and the in-transaction re-checks are preserved verbatim.
- AC5: Typecheck, lint, and the full unit test suite (currently 250 passing) pass unchanged, with no weakened assertions.

# AC Traceability
- AC1 -> `task_092_orchestrate_leagues_store_modularization`. Proof: lifecycle modules exist under `apps/api/src/features/leagues/`; `store.ts` is now a re-export barrel.
- AC2 -> `task_092_orchestrate_leagues_store_modularization`. Proof: `transactionHelpers.ts` centralizes the shared transaction/claim helper surface.
- AC3 -> `task_092_orchestrate_leagues_store_modularization`. Proof: no route, admin-store, script, or test import path changed.
- AC4 -> `task_092_orchestrate_leagues_store_modularization`. Proof: behavior-critical implementation is preserved in `storeCore.ts`; full unit suite passes.
- AC5 -> `task_092_orchestrate_leagues_store_modularization`. Proof: task validation records passing typecheck, lint, test, and build.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_055_leagues_store_modularization_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/admin/store.ts
- Current diagnostic: apps/api/src/features/leagues/store.ts is 1197 lines and is by far the largest hand-written source file in the repo.
- Current diagnostic: the file mixes several unrelated lifecycles — profile recovery, league create/join, card buy/sell, team livery/name, decision submission, qualifying, grand prix resolution, admin start/restart, opponent comparison, and state read/reveal — plus their private helpers.
- Current diagnostic: the only external consumers of store.ts are leagues/routes.ts (named imports) and admin/store.ts (getLeagueState); the test suite imports from the same module path.
- Current diagnostic: transaction primitives (runWrite, lockTeamRow, lockGrandPrixRow, getCurrentGrandPrix, normalizeQualifyingRuns, requireTeamClaim, requireAdminClaim) are shared across sellCard, submitDecision, submitQualifyingRun, and resolveCurrentGrandPrix.

# AI Context
- Summary: Modularize the oversized leagues store
- Keywords: request-chain-scaffold, modularize the oversized leagues store, development-ready
- Use when: You need to implement or review the scaffolded workflow for Modularize the oversized leagues store.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_207_split_leagues_store_into_lifecycle_modules_behind_a_barrel`
