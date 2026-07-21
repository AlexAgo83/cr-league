## task_079_orchestrate_card_effect_legibility - Orchestrate card effect legibility
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
- [ ] 1. Catalogue each card's real trigger condition and magnitude from simulateRace.ts applyDecision and maybeAddCardEvent, and map magnitudes to weak/medium/strong bands.
- [ ] 2. Add a shared per-card descriptor (condition, strength band, downside) colocated with card effects in packages/shared, with a unit test asserting consistency with the coded effects.
- [ ] 3. Surface the descriptor in CardStatBadges and the garage/plan card surfaces, legible without color alone, with EN/FR copy.
- [ ] 4. Verify no simulation, magnitude, price, or economy value changed and no copy reads as a recommendation.
- [ ] 5. Run typecheck, test, build, lint, and logics:validate; record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_176_add_a_shared_card_descriptor_condition_strength_band_and_surface_it_in_card_ui`

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
- Summary: Orchestrate card effect legibility
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage`
- Product brief(s): `prod_042_race_legibility_product_brief`
- Architecture decision(s): (none yet)
