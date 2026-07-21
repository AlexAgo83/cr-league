## task_080_orchestrate_weather_forecast_legibility - Orchestrate weather forecast legibility
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Confirm the pre-race forecast pill (DriveView.tsx:133-147) and replay timeline (ReplayProgress.tsx:70-79) render only weather names, and confirm resolveWeather's per-segment behavior in simulateRace.ts.
- [x] 2. Reframe the pre-race pill as a non-final forecast with a qualitative tendency and EN/FR copy.
- [x] 3. Label the replay timeline as actual resolved weather per phase and add a compact legend for the pace marker and phase mapping, legible without color alone.
- [x] 4. Verify no framing implies a per-phase probability the model does not apply and no simulation behavior changed.
- [x] 5. Run typecheck, test, build, lint, and logics:validate; record validation evidence in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_177_label_forecast_vs_resolved_weather_and_add_a_replay_legend`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `DriveView` labels the pre-race readout as "forecast, not final" and shows qualitative tendency copy.
- request-AC2 -> `ReplayProgress` labels weather icons as actual resolved weather by phase.
- request-AC3 -> `ReplayProgress` adds a compact legend for pace/race markers and five-phase cloud mapping.
- request-AC4 -> Copy stays qualitative; no per-phase probabilities are displayed.
- request-AC5 -> Text labels accompany icons and EN/FR translations were added.
- request-AC6 -> No shared simulation files changed.
- request-AC7 -> Proof: typecheck, targeted i18n/app tests, full unit tests, lint, build, and Logics validation pass.

# Validation
- `npm run typecheck` passed.
- `npx vitest run apps/web/src/i18n/index.test.ts apps/web/src/app/App.test.tsx` passed: 30 tests.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 216 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run logics:validate` passed before closeout; warnings are deferred/open-doc warnings only.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Pre-race weather now reads as a non-final forecast with qualitative tendency copy.
- Replay timeline now identifies actual resolved weather per phase and explains marker/cloud semantics in text.
- Simulation and weather model code were not changed.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_177_label_forecast_vs_resolved_weather_and_add_a_replay_legend`
- Related request(s): `req_079_clarify_weather_semantics_forecast_vs_resolved_and_pace_marker_legend`
- Finished on 2026-07-21.
- Linked backlog item(s): `item_177_label_forecast_vs_resolved_weather_and_add_a_replay_legend`
- Related request(s): `req_079_clarify_weather_semantics_forecast_vs_resolved_and_pace_marker_legend`

# AI Context
- Summary: Orchestrate weather forecast legibility
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_079_clarify_weather_semantics_forecast_vs_resolved_and_pace_marker_legend`
- Product brief(s): `prod_043_weather_legibility_product_brief`
- Architecture decision(s): (none yet)
