## task_080_orchestrate_weather_forecast_legibility - Orchestrate weather forecast legibility
> From version: 0.3.26
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
- [ ] 1. Confirm the pre-race forecast pill (DriveView.tsx:133-147) and replay timeline (ReplayProgress.tsx:70-79) render only weather names, and confirm resolveWeather's per-segment behavior in simulateRace.ts.
- [ ] 2. Reframe the pre-race pill as a non-final forecast with a qualitative tendency and EN/FR copy.
- [ ] 3. Label the replay timeline as actual resolved weather per phase and add a compact legend for the pace marker and phase mapping, legible without color alone.
- [ ] 4. Verify no framing implies a per-phase probability the model does not apply and no simulation behavior changed.
- [ ] 5. Run typecheck, test, build, lint, and logics:validate; record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_177_label_forecast_vs_resolved_weather_and_add_a_replay_legend`

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
- Summary: Orchestrate weather forecast legibility
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_079_clarify_weather_semantics_forecast_vs_resolved_and_pace_marker_legend`
- Product brief(s): `prod_043_weather_legibility_product_brief`
- Architecture decision(s): (none yet)
