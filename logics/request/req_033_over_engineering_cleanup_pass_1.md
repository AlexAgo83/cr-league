## req_033_over_engineering_cleanup_pass_1 - Over-engineering cleanup pass 1
> From version: 0.1.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Code health and simplification
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Remove dead code and dead localization keys identified by the audit so the codebase only carries what the product actually uses.
- Collapse duplicated helpers and degenerate data structures (a 15-entry price map where every value is identical) into single sources of truth.
- Reduce the shared package public surface to what consumers actually import, keeping internals internal.
- Replace the fabricated full RaceResult built for qualifying runs with a minimal shape, if the web client does not render the fabricated fields.
- Consolidate the duplicated input validation between API route body guards and store-level rule checks without weakening the trust boundary.
- Delete stray empty directories and placeholder files left over from earlier scaffolding.

# Context
- A three-way audit (web, api+shared, tooling) ran on 2026-07-15 and confirmed the repo is otherwise healthy: no committed build artifacts, no unused dependencies, prisma live, scripts wired.
- The 13 retained findings split into ten mechanical, zero-risk cuts and two changes that need verification first: the qualifying result shape (verify the web never renders qualifyingRuns[].result internals) and the route/store validation overlap (guarded by 1089 lines of existing API tests).
- All cuts must preserve behavior: this is deletion and consolidation, not redesign. TypeScript, unit tests, and e2e are the safety net.
- The shared package has zero runtime dependencies and its barrel currently re-exports internals (createPrng, Prng, InternalScores) no consumer imports.

# Acceptance criteria
- AC1: Dead i18n keys are removed from both EN and FR catalogs, and every remaining key is referenced by the web app.
- AC2: Dead code is deleted: localizedReportBlocks, prng.int, and the never-emitted RaceEventType members strong_start, poor_start, late_push_failure.
- AC3: CARD_PRICES is replaced by a single CARD_PRICE constant and all consumers are updated.
- AC4: clampTrait exists once and is imported where needed; traitLabel/weatherLabel collapse to one helper.
- AC5: The shared package barrel no longer exports createPrng, Prng, or InternalScores; internals stay importable inside the package.
- AC6: Stray artifacts are gone: empty root src/ directory, apps/api/src/simulation/.gitkeep, apps/api/src/db/.gitkeep, and the local .npm-cache directory.
- AC7: Qualifying runs persist a minimal result shape instead of a fabricated full RaceResult, unless verification shows the web renders the fabricated fields, in which case the finding is closed as invalid with proof.
- AC8: Route body guards keep shape/type checks as the single trust boundary while the store keeps only business rules, with no duplicated shape validation, and all existing API tests pass.
- AC9: Typecheck, lint, unit tests, build, and e2e all pass after the cleanup.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- packages/shared/src/index.ts
- packages/shared/src/simulation/prng.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/economy/constants.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/web/src/app/helpers.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- Audit findings: a repo-wide over-engineering audit identified 13 actionable cleanups: dead i18n keys, dead helpers, dead enum members, an all-identical price map, duplicated helpers, over-exposed package surface, stray empty directories, a fabricated qualifying RaceResult, and a redundant validation layer between routes and store.

# AI Context
- Summary: Over-engineering cleanup pass 1
- Keywords: request-chain-scaffold, over-engineering cleanup pass 1, development-ready
- Use when: You need to implement or review the scaffolded workflow for Over-engineering cleanup pass 1.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_048_delete_dead_code_dead_i18n_keys_and_stray_files`
- `item_049_consolidate_duplicated_helpers_and_degenerate_constants`
- `item_050_slim_the_qualifying_result_to_what_the_client_renders`
- `item_051_single_layer_validation_between_routes_and_store`
