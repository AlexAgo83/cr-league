## task_125_orchestrate_the_review_follow_up - Orchestrate the review follow-up
> From version: 0.5.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Run npm run build and record the baseline index chunk raw and gzip sizes.
- [ ] 2. Convert the AdminConsoleView import to React.lazy following the existing GameViews.tsx pattern, and confirm the render site is under a Suspense boundary.
- [ ] 3. Rebuild and record the index chunk delta against the baseline.
- [ ] 4. Run npm run playtest:ux:cold-start and record the first-paint evidence.
- [ ] 5. Decide the GameApp split from that evidence: implement with a splash-mount prefetch, or decline in writing citing the numbers.
- [ ] 6. Add the Scripts section to CONTRIBUTING.md and verify every package.json script is covered.
- [ ] 7. Record the App.tsx and speed-profile skips with their reopen triggers.
- [ ] 8. Run typecheck, lint, unit tests, and build, and record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_308_lazy_load_the_admin_console_out_of_the_eager_chunk`
- `item_309_measure_cold_start_and_decide_the_gameapp_split_on_the_numbers`
- `item_310_document_the_release_gate_and_diagnostic_script_split`
- `item_311_record_the_app_tsx_and_speed_profile_skips_with_reopen_triggers`

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
- Summary: Orchestrate the review follow-up
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)
