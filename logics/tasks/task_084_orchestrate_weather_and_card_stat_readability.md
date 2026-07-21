## task_084_orchestrate_weather_and_card_stat_readability - Orchestrate weather and card stat readability
> From version: 0.3.26
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 25%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Trace the resolved-weather UI path from ReplayProgress and DriveView before editing.
- [ ] 2. Move resolved-weather detail into a compact circuit info modal using existing modal patterns.
- [ ] 3. Adjust shared card badge CSS to wrap to at least two rows in card cells.
- [ ] 4. Add native localized hover/focus explanations to CardStatBadges using existing stat hint copy.
- [ ] 5. Run typecheck, focused tests, lint, full tests, build, e2e, and Logics validation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_181_move_resolved_weather_details_to_a_circuit_info_modal`
- `item_182_wrap_card_stat_badges_and_add_stat_explanations`

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
- 2026-07-21 wave: moved pre-race opponent configurations out of Drive and into Plan > Chrono after session history, so comparison lives with chrono learning instead of cluttering the circuit view.
- 2026-07-21 wave: moved the selected-card consumption warning into the plan risk panel, keeping the warning visible with the risk read instead of burying it inside the card picker.
- 2026-07-21 wave: moved the Plan primary command below the active configuration choices, so the user reviews the setup list before sending or launching.
- Remaining: resolved-weather info modal, card badge wrapping, and badge stat explanations.

# AI Context
- Summary: Orchestrate weather and card stat readability
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`
- Product brief(s): `prod_047_race_weather_and_card_stat_readability_product_brief`
- Architecture decision(s): (none yet)
