## task_116_orchestrate_repo_review_maintainability_follow_up - Orchestrate repo review maintainability follow-up
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90
> Confidence: 85
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Implement the leagues/routes.ts helper first and prove response parity with the existing app tests.
- [ ] 2. Split storeCore.ts by lifecycle behind the unchanged barrel, then run typecheck/lint/tests.
- [ ] 3. Extract App.tsx screen concerns into focused children and verify with the web tests.
- [ ] 4. Add targeted tests over the uncovered error/rule branches and re-check coverage.
- [ ] 5. Extract the shared body-guard preamble in leagues/routes.ts into one asRecord helper (item_277) and confirm guard behavior via the app tests.
- [ ] 6. Centralize web lap-time/gap second formatting in one helper (item_278) with byte-identical rendered text.
- [ ] 7. Run the full gate (typecheck, lint, unit suite, balance:gate, logics:validate) and record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_273_centralize_leagues_route_error_guard_404_handling_behind_one_helper`
- `item_274_split_storecore_ts_below_the_size_ceiling`
- `item_275_decompose_app_tsx_into_focused_screen_components`
- `item_276_close_the_branch_coverage_gap_on_error_and_rule_violation_paths`
- `item_277_extract_shared_body_guard_preamble_in_leagues_routes_into_asrecord`
- `item_278_centralize_web_lap_time_and_gap_second_formatting_in_one_helper`

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
- Summary: Orchestrate repo review maintainability follow-up
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_115_repo_review_maintainability_follow_up`
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
