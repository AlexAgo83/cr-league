## task_034_orchestrate_over_engineering_cleanup_pass_1 - Orchestrate over-engineering cleanup pass 1
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 35%
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
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate over-engineering cleanup pass 1
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_033_over_engineering_cleanup_pass_1`
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)
