## req_041_api_integrity_hardening_from_repo_review - API integrity hardening from repo review
> From version: 0.3.5
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: API security and data integrity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Require proof of team ownership for every player-controlled mutation instead of trusting teamId alone.
- Make Grand Prix resolution idempotent under concurrent requests so rewards and card consumption apply once.
- Make card purchasing atomic so concurrent buys cannot overspend credits or lose inventory writes.
- Return client-safe status codes for league creation validation errors, matching the rest of the league API.
- Use cryptographically strong random bytes for league codes and team claim codes, with collision handling where the database has unique constraints.
- Keep lint reproducible from a clean checkout by removing or ignoring transient local scratch artifacts.

# Context
- The API currently exposes claimCode only in LeagueState.player and uses it for /leagues/rejoin; all subsequent player mutations post teamId only.
- Routes affected by ownership checks include /cards/buy, /teams/livery, /teams/name, /decisions, /qualifying, and any future team-scoped mutation.
- resolveCurrentGrandPrix reads the current GrandPrix, checks status, updates status/result, then increments team points and credits and removes consumed cards outside a transaction.
- buyCard reads state, checks credits, then updates credits and JSON cards from a stale in-memory copy.
- The Prisma schema has unique constraints for League.code, Team.claimCode, GrandPrix league/season/round, and RaceDecision grandPrix/team; use these constraints instead of adding speculative app-side registries.
- Existing fast API tests use an in-memory Prisma-shaped fake and cover the happy paths; concurrency tests may need either a tiny focused fake hook or a real transaction-backed test if the fake cannot model races honestly.
- Ponytail constraint: prefer one shared guard/helper and Prisma transactions/conditional updates over new auth frameworks or broad abstractions.

# Acceptance criteria
- AC1: Every player-controlled team mutation requires and verifies claimCode for the submitted team; missing or wrong claimCode returns 404 or 409 consistently with existing rejoin/error semantics.
- AC2: The web client includes claimCode in team mutation payloads without exposing it anywhere new in visible UI.
- AC3: Concurrent calls to resolve the same Grand Prix cannot apply points, credits, or card consumption more than once; a second resolver receives a conflict or returns the already-resolved state without duplicate rewards.
- AC4: Concurrent card purchases cannot reduce credits below zero, cannot lose an appended card update, and cannot buy when the pre-update balance is insufficient.
- AC5: /leagues catches LeagueRuleError from createDemoLeague and returns the same client-safe error style as the other league endpoints.
- AC6: League codes and claim codes are generated with crypto random bytes and collision retries that respect the existing unique database constraints.
- AC7: npm run typecheck, npm test, npm run build, npm run logics:validate, and npm run lint pass from a clean worktree.
- AC8: Focused tests cover wrong/missing claimCode, duplicate Grand Prix resolution, card double-spend prevention, create-league validation errors, and deterministic code collision retry behavior where feasible.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- package.json
- eslint.config.js
- prisma/schema.prisma
- apps/api/src/app.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/app.test.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/types.ts
- packages/shared/src/simulation/simulateRace.ts
- Review findings from 2026-07-17: team mutations trust teamId without claimCode, Grand Prix resolution is non-atomic, card purchases can double-spend under concurrency, /leagues creation leaks LeagueRuleError as 500, league and claim codes use Math.random, and lint currently fails only because of an untracked .shot-tmp.mjs scratch file.

# AI Context
- Summary: API integrity hardening from repo review
- Keywords: request-chain-scaffold, api integrity hardening from repo review, development-ready
- Use when: You need to implement or review the scaffolded workflow for API integrity hardening from repo review.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_079_require_claim_codes_for_team_mutations`
- `item_080_make_grand_prix_resolution_idempotent_and_transactional`
- `item_081_make_card_purchases_atomic`
- `item_082_handle_create_league_validation_errors_consistently`
- `item_083_use_crypto_backed_league_and_claim_codes_with_collision_retry`
- `item_084_restore_lint_reproducibility_from_a_clean_tree`
