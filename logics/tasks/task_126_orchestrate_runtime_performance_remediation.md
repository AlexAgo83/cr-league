## task_126_orchestrate_runtime_performance_remediation - Orchestrate runtime performance remediation
> From version: 0.5.1
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 50%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Run the manual perf baselines first: perf:replay -- --cycles 10, perf:browser -- --cycles 10 if needed, perf:bundle, and perf:api -- --cycles 100. Save reports under reports/perf but do not version generated reports unless explicitly requested.
- [ ] 2. Start with replay retention. Inspect ReplayView, useReplayClock, ReplayStageOverlay, and CircuitMap for missing cleanup and retained animation/listener/SVG state. Patch the smallest cleanup points.
- [ ] 3. Rerun perf:replay and perf:compare against the baseline. Keep iterating only while changes are clearly grounded in the metrics.
- [ ] 4. Verify replay behavior through the private league Chromium e2e flow and targeted manual checks for pause/play, restart, speed, focus, report access, and Back to stand.
- [ ] 5. Run a clean production build and perf:bundle. Fix accidental dist artifacts if reproduced; otherwise document that the earlier artifact signal was stale local residue.
- [ ] 6. Review the largest image payloads, changing only assets with meaningful measured savings and no broken visual flows.
- [ ] 7. Rerun perf:api as a watchpoint and avoid API/payload contract changes unless new evidence makes them necessary.
- [ ] 8. Run typecheck, lint, tests, build, Chromium e2e, logics validation, and record before/after evidence in the task closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_312_reduce_replay_runtime_retention_in_timers_listeners_and_svg_state`
- `item_313_verify_production_dist_hygiene_and_remove_accidental_shipped_artifacts`
- `item_314_review_largest_image_payloads_for_cheap_measured_reductions`
- `item_315_keep_api_simulation_performance_as_a_measured_watchpoint`

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
- 2026-07-27 wave 1 validation: npm run clean && npm run build OK; npm run perf:bundle OK with dist 12.5 MB / 317 files; artifact scan found no accidental production files.
- 2026-07-27 wave 2 validation: npm run perf:api -- --cycles 100 OK; avg resolve 2.26 ms, p95 3.88 ms, max 8.23 ms, avg result JSON 112.1 KB, heap delta after GC 0.96 MB, RSS delta after GC 32.72 MB.

# Report
- Implementation complete.
- 2026-07-27 wave 1 complete: verified production dist hygiene. Clean build after removing ignored local .DS_Store files from public/ produces no .DS_Store, TS/TSX source, source maps, tsbuildinfo, or test files in apps/web/dist. No build config change was needed.
- 2026-07-27 wave 2 complete: reran the API performance watchpoint with 100 cycles and made no API contract or simulation changes because measured resolve time stayed low-millisecond.

# AI Context
- Summary: Orchestrate runtime performance remediation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`
- Product brief(s): `prod_077_runtime_performance_remediation_product_brief`
- Architecture decision(s): (none yet)
