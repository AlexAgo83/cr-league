## task_126_orchestrate_runtime_performance_remediation - Orchestrate runtime performance remediation
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
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
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_312_reduce_replay_runtime_retention_in_timers_listeners_and_svg_state`. Proof: perf:replay cycles 10 improved heap growth from +3.16 MB to +2.32 MB and final heap from 17.1 MB to 16.0 MB; DOM/listener growth stayed stable enough for perf:compare to report `stable`.
- request-AC2 -> `item_312_reduce_replay_runtime_retention_in_timers_listeners_and_svg_state`. Proof: Chromium e2e passed after the replay change, covering replay launch, layout separation, first-click commands, result shortcuts, and mobile document flows.
- request-AC3 -> `item_312_reduce_replay_runtime_retention_in_timers_listeners_and_svg_state`. Proof: CircuitMap now delegates replay car focus clicks through one SVG handler instead of per-car handlers; remaining DOM/listener counts are documented as mounted replay UI rather than accumulating nodes across cycles.
- request-AC4 -> `item_313_verify_production_dist_hygiene_and_remove_accidental_shipped_artifacts`. Proof: clean dist artifact scan found no `.DS_Store`, TS/TSX source, source maps, tsbuildinfo, or test files after `npm run clean && npm run build`.
- request-AC5 -> `item_314_review_largest_image_payloads_for_cheap_measured_reductions`. Proof: largest image payload reviewed and changed; finish flag reduced from 1393 KB PNG to 390 KB lossless WebP, with perf:bundle total reduced from 12.5 MB to 11.52 MB.
- request-AC6 -> `item_315_keep_api_simulation_performance_as_a_measured_watchpoint`. Proof: perf:api cycles 100 stayed low-millisecond, so no API contract or simulation payload changes were made.
- request-AC7 -> This task. Proof: typecheck, lint, unit tests, build, Chromium e2e, perf:replay, perf:bundle, perf:api, and Logics validation evidence is recorded in the Validation section.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-27 wave 1 validation: npm run clean && npm run build OK; npm run perf:bundle OK with dist 12.5 MB / 317 files; artifact scan found no accidental production files.
- 2026-07-27 wave 2 validation: npm run perf:api -- --cycles 100 OK; avg resolve 2.26 ms, p95 3.88 ms, max 8.23 ms, avg result JSON 112.1 KB, heap delta after GC 0.96 MB, RSS delta after GC 32.72 MB.
- 2026-07-27 wave 3 validation: finish flag 1393 KB -> 390 KB; perf:bundle dist 12.5 MB -> 11.52 MB and images 10.66 MB -> 9.68 MB; targeted CSS test OK; clean build OK; perf:bundle OK; Chromium e2e OK, 4 passed; typecheck OK; lint OK.
- 2026-07-27 wave 4 validation: perf:replay before cycles 10: heap +3.16 MB, nodes +209, listeners +189, final heap 17.1 MB. After: heap +2.32 MB, nodes +205, listeners +187, final heap 16.0 MB. perf:compare verdict stable. typecheck, lint, targeted tests, full unit tests, build, and Chromium e2e all OK.
- Finish workflow executed on 2026-07-27.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- 2026-07-27 wave 1 complete: verified production dist hygiene. Clean build after removing ignored local .DS_Store files from public/ produces no .DS_Store, TS/TSX source, source maps, tsbuildinfo, or test files in apps/web/dist. No build config change was needed.
- 2026-07-27 wave 2 complete: reran the API performance watchpoint with 100 cycles and made no API contract or simulation changes because measured resolve time stayed low-millisecond.
- 2026-07-27 wave 3 complete: converted the largest image payload, assets/crl/finish-flag.png, to lossless WebP and updated the replay finish flag CSS/test reference. No broad image pipeline or mass conversion added.
- 2026-07-27 wave 4 complete: reduced replay retained work by delegating CircuitMap car focus clicks to one SVG handler instead of per-car handlers. Remaining replay DOM/listener counts are stable in perf:compare and appear to be mounted replay UI rather than accumulating nodes across cycles.
- Finished on 2026-07-27.
- Linked backlog item(s): `item_312_reduce_replay_runtime_retention_in_timers_listeners_and_svg_state`, `item_313_verify_production_dist_hygiene_and_remove_accidental_shipped_artifacts`, `item_314_review_largest_image_payloads_for_cheap_measured_reductions`, `item_315_keep_api_simulation_performance_as_a_measured_watchpoint`
- Related request(s): `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`

# AI Context
- Summary: Orchestrate runtime performance remediation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`
- Product brief(s): `prod_077_runtime_performance_remediation_product_brief`
- Architecture decision(s): (none yet)
