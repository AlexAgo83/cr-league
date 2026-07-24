## task_116_orchestrate_repo_review_maintainability_follow_up - Orchestrate repo review maintainability follow-up
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Implement the leagues/routes.ts helper first and prove response parity with the existing app tests.
- [x] 2. Split storeCore.ts by lifecycle behind the unchanged barrel, then run typecheck/lint/tests.
- [x] 3. Extract App.tsx screen concerns into focused children and verify with the web tests.
- [x] 4. Add targeted tests over the uncovered error/rule branches and re-check coverage.
- [x] 5. Extract the shared body-guard preamble in leagues/routes.ts into one asRecord helper (item_277) and confirm guard behavior via the app tests.
- [x] 6. Centralize web lap-time/gap second formatting in one helper (item_278) with byte-identical rendered text.
- [x] 7. Run the full gate (typecheck, lint, unit suite, balance:gate, logics:validate) and record validation evidence in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_273_centralize_leagues_route_error_guard_404_handling_behind_one_helper`
- `item_274_split_storecore_ts_below_the_size_ceiling`
- `item_275_decompose_app_tsx_into_focused_screen_components`
- `item_276_close_the_branch_coverage_gap_on_error_and_rule_violation_paths`
- `item_277_extract_shared_body_guard_preamble_in_leagues_routes_into_asrecord`
- `item_278_centralize_web_lap_time_and_gap_second_formatting_in_one_helper`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: item_273 delivered one leagues route helper with route-specific 400 messages preserved; API tests passed.
- request-AC2 -> This task. Proof: item_274 split storeCore.ts into focused modules; storeCore.ts is 27 lines and the largest league store file is 687 lines.
- request-AC3 -> This task. Proof: item_275 extracted HomeSplash, modal state, and preference constants; App.tsx is 796 lines and focused App tests passed.
- request-AC4 -> This task. Proof: item_276 added invalid shop input and qualifying-card mismatch tests; branch coverage moved 80.52% -> 80.62%.
- request-AC5 -> This task. Proof: npm run typecheck, npm run lint, npm test, npm test -- --coverage, npm run balance:gate, logics lint, and logics audit passed.
- request-AC6 -> This task. Proof: item_277 delivered asRecord(value) for leagues route body guards; API tests passed.
- request-AC7 -> This task. Proof: item_278 delivered formatSeconds(value, decimals); web tests passed with byte-identical text.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Passed: npm run typecheck; npm run lint; npm test (316 passed, 7 skipped); npm test -- --coverage (branches 80.62%, 316 passed, 7 skipped); npm run balance:gate; logics-manager lint --require-status; logics-manager audit --group-by-doc (OK with non-blocking Mermaid warnings).
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.
- Passed: npm run typecheck; npm run lint; npm test (316 passed, 7 skipped); npm test -- --coverage (branches 80.62%, 316 passed, 7 skipped); npm run balance:gate; logics-manager lint --require-status; logics-manager audit --group-by-doc (OK with non-blocking Mermaid warnings for prod_068/prod_069).

# Report
- Implementation complete.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_273_centralize_leagues_route_error_guard_404_handling_behind_one_helper`, `item_274_split_storecore_ts_below_the_size_ceiling`, `item_275_decompose_app_tsx_into_focused_screen_components`, `item_276_close_the_branch_coverage_gap_on_error_and_rule_violation_paths`, `item_277_extract_shared_body_guard_preamble_in_leagues_routes_into_asrecord`, `item_278_centralize_web_lap_time_and_gap_second_formatting_in_one_helper`
- Related request(s): `req_115_repo_review_maintainability_follow_up`

# AI Context
- Summary: Orchestrate repo review maintainability follow-up
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_115_repo_review_maintainability_follow_up`
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
