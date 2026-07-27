## task_125_orchestrate_the_review_follow_up - Orchestrate the review follow-up
> From version: 0.5.0
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
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_308_lazy_load_the_admin_console_out_of_the_eager_chunk`. Proof: build emits `AdminConsoleView-BVLfYFkL.js` as a separate chunk after React.lazy.
- request-AC2 -> `item_308_lazy_load_the_admin_console_out_of_the_eager_chunk`. Proof: admin profile-menu test passes with the lazy-loaded admin heading; full unit tests pass.
- request-AC3 -> `item_309_measure_cold_start_and_decide_the_gameapp_split_on_the_numbers`. Proof: cold-start funnel PASS on mobile 390x900 with measured step timings, and the GameApp split was declined in writing based on those numbers.
- request-AC4 -> `item_310_document_the_release_gate_and_diagnostic_script_split`. Proof: CONTRIBUTING.md Scripts section covers all 43 package.json scripts and distinguishes merge gate, release/pre-release checks, local maintenance, and diagnostics.
- request-AC5 -> `item_311_record_the_app_tsx_and_speed_profile_skips_with_reopen_triggers`. Proof: code-site ponytail comments record the App.tsx and speed-profile skips with observable reopen triggers.
- request-AC6 -> This task. Proof: typecheck, lint, unit tests, build, and Logics validation evidence is recorded; index chunk reduced from 243.86 kB raw / 70.92 kB gzip to 237.97 kB raw / 69.91 kB gzip after admin lazy-load.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-27 wave 1 validation: package.json script coverage check reported 43 scripts and all scripts covered; package.json unchanged; npm run logics:validate OK with existing warnings.
- 2026-07-27 wave 3 validation: index chunk 243.86 kB raw / 70.92 kB gzip -> 237.97 kB raw / 69.91 kB gzip; AdminConsoleView chunk emitted at 6.19 kB raw / 1.56 kB gzip. typecheck, lint, targeted admin test, full unit tests, and build OK.
- 2026-07-27 wave 4 validation: playtest:ux:cold-start PASS on mobile 390x900 with total measured step time 2382 ms; steps were 292/515/292/979/304 ms. typecheck, lint, full unit tests, and build OK.
- Finish workflow executed on 2026-07-27.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- 2026-07-27 wave 1 complete: added CONTRIBUTING.md Scripts section to distinguish merge gate, release/pre-release checks, local maintenance commands, and on-demand diagnostics/generators without modifying package.json scripts.
- 2026-07-27 wave 2 complete: recorded the App.tsx and speed-profile data skips directly at the implementing code sites with explicit reopen triggers.
- 2026-07-27 wave 3 complete: lazy-loaded AdminConsoleView behind React.lazy/Suspense, leaving useAdminPanel static. The admin profile-menu test now awaits the lazy-loaded heading and still exercises the normal admin entry.
- 2026-07-27 wave 4 complete: measured cold-start funnel and declined the GameApp split on the numbers. Also updated the cold-start playtest seed to use sessionCredential so it matches the current credential-storage contract.
- Finished on 2026-07-27.
- Linked backlog item(s): `item_308_lazy_load_the_admin_console_out_of_the_eager_chunk`, `item_309_measure_cold_start_and_decide_the_gameapp_split_on_the_numbers`, `item_310_document_the_release_gate_and_diagnostic_script_split`, `item_311_record_the_app_tsx_and_speed_profile_skips_with_reopen_triggers`
- Related request(s): `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`

# AI Context
- Summary: Orchestrate the review follow-up
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)
