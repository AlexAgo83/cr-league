## task_079_orchestrate_card_effect_legibility - Orchestrate card effect legibility
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
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
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `CARD_DESCRIPTORS` adds per-card condition keys and `CardStatBadges` renders them in plan and garage card surfaces.
- request-AC2 -> This task. Proof: `CARD_DESCRIPTORS` adds weak/medium/strong bands plus downside keys, and UI renders translated labels without raw magnitudes.
- request-AC3 -> This task. Proof: descriptors live in `packages/shared/src/cards/definitions.ts`; `packages/shared/src/cards/definitions.test.ts` covers descriptor presence and event-delta band alignment.
- request-AC4 -> This task. Proof: EN/FR copy uses rule-descriptive labels; existing card-fit copy changed from "Recommended" to "High fit".
- request-AC5 -> This task. Proof: condition, impact, and downside are rendered as text badges, with EN/FR catalog entries.
- request-AC6 -> This task. Proof: only card metadata, UI labels, translations, and tests changed; no simulation/economy files were modified.
- request-AC7 -> This task. Proof: `npm run typecheck`, `npm test`, `npm run build`, and `npm run lint` passed on 2026-07-21; `logics:validate` re-run after traceability repair.

# Validation
- `npm run typecheck` passed on 2026-07-21.
- `npm test` passed on 2026-07-21 (215 passed, 4 skipped).
- `npm run build` passed on 2026-07-21.
- `npm run lint` passed on 2026-07-21.
- `npm run logics:validate` re-run after traceability repair.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_176_add_a_shared_card_descriptor_condition_strength_band_and_surface_it_in_card_ui`
- Related request(s): `req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage`

# AI Context
- Summary: Orchestrate card effect legibility
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage`
- Product brief(s): `prod_042_race_legibility_product_brief`
- Architecture decision(s): (none yet)
