## task_034_orchestrate_over_engineering_cleanup_pass_1 - Orchestrate over-engineering cleanup pass 1
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Re-verify each audited finding against the current tree before cutting (references, dynamic access, test usage).
- [ ] 2. Ship the two Low-complexity deletion/consolidation items first as one commit each, gates green.
- [x] 3. Run the qualifying-result verification and either implement the minimal shape or close the finding with proof. (Done 2026-07-15: finding invalid — App.tsx:1206 renders ReplayView with replayQualifyingRun.result; item_050 closed.)
- [ ] 4. Consolidate validation route by route with the API test suite as the contract.
- [ ] 5. Ship the pass-2 slices: item_052 (dead code, dead CSS, broken prisma seed; legacy PLAYER_CLAIM_KEY deletion and the defaulted-column migration are owner-approved — dev DB is disposable Docker) and item_053 (boilerplate consolidation).
- [ ] 6. Add @grifhinz/logics-manager as a root devDependency (owner decision, covered in item_052 scope).
- [ ] 7. Run typecheck, lint, unit tests, build, and e2e; record proof in the Logics closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_048_delete_dead_code_dead_i18n_keys_and_stray_files`
- `item_049_consolidate_duplicated_helpers_and_degenerate_constants`
- `item_050_slim_the_qualifying_result_to_what_the_client_renders`
- `item_051_single_layer_validation_between_routes_and_store`
- `item_052_delete_pass_2_dead_code_dead_css_and_the_broken_prisma_seed`
- `item_053_collapse_pass_2_duplicated_boilerplate_in_web_and_api_tests`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC2 -> This task. Proof: removed localizedReportBlocks, prng.int, and never-emitted RaceEventType members strong_start, poor_start, late_push_failure; `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, and `npm run test:e2e` passed on 2026-07-15.
- request-AC3 -> This task. Proof: replaced CARD_PRICES with CARD_PRICE and updated all consumers; full validation passed on 2026-07-15.
- request-AC4 -> This task. Proof: clampTrait was consolidated to one shared helper and imported where needed; trait/weather label duplication was collapsed where applicable; full validation passed on 2026-07-15.
- request-AC5 -> This task. Proof: shared barrel no longer exports createPrng, Prng, or InternalScores; package consumers still typecheck and full validation passed on 2026-07-15.
- request-AC6 -> This task. Proof: removed the empty root src directory, apps/api/src/simulation/.gitkeep, apps/api/src/db/.gitkeep, and the local .npm-cache artifact; full validation passed on 2026-07-15.
- request-AC7 -> This task. Proof: finding closed invalid because App.tsx renders ReplayView with replayQualifyingRun.result in the qualifying modal; item_050 records the proof.
- request-AC8 -> This task. Proof: route body guards retain shape/type validation while store-level duplicated shape checks were removed from rejoin/card/livery/name flows; API tests and full validation passed on 2026-07-15.
- request-AC9 -> This task. Proof: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` all passed on 2026-07-15.
- request-AC10 -> This task. Proof: removed prisma/seed.ts and root db:seed script; scripts/seed-playtest-league.ts remains; full validation passed on 2026-07-15.
- request-AC11 -> This task. Proof: dead CSS selectors/tokens from the audit were removed and e2e passed on 2026-07-15.
- request-AC12 -> This task. Proof: removed CardDefinition.id, CardDefinition.consumable, web-side rivalTeamId decision type field, bot claim codes, and RaceDecision.defaulted with a prisma migration; full validation passed on 2026-07-15.
- request-AC13 -> This task. Proof: inlined single-use parameterizations identified in pass 2 and full validation passed on 2026-07-15.
- request-AC14 -> This task. Proof: added createTestApp, pushNotification, mutateLeague, SetupShell, LiveryPlate, WEATHER_ICONS, hoisted language select reuse, and dropped the duplicated next_action label; full validation passed on 2026-07-15.
- request-AC15 -> This task. Proof: owner confirmed no live player predates PLAYER_CLAIMS_KEY, so the legacy PLAYER_CLAIM_KEY migration path was deleted; full validation passed on 2026-07-15.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Finish workflow executed on 2026-07-15.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-15.
- Linked backlog item(s): `item_048_delete_dead_code_dead_i18n_keys_and_stray_files`, `item_049_consolidate_duplicated_helpers_and_degenerate_constants`, `item_050_slim_the_qualifying_result_to_what_the_client_renders`, `item_051_single_layer_validation_between_routes_and_store`, `item_052_delete_pass_2_dead_code_dead_css_and_the_broken_prisma_seed`, `item_053_collapse_pass_2_duplicated_boilerplate_in_web_and_api_tests`
- Related request(s): `req_033_over_engineering_cleanup_pass_1`

# AI Context
- Summary: Orchestrate over-engineering cleanup pass 1
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_033_over_engineering_cleanup_pass_1`
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)
