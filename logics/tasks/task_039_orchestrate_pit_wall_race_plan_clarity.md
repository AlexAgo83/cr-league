## task_039_orchestrate_pit_wall_race_plan_clarity - Orchestrate pit wall race plan clarity
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 96
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- The updated product direction is to make the beginning of a GP day legible as `Circuit briefing -> Directive tuning -> Qualifying chrono -> Plan locked -> Grand Prix`.
- The implementation should reduce visible cognitive load by replacing scattered explanatory copy with one compact current objective; do not add another permanent tutorial panel.

# Plan
- [x] 1. Inspect the current directive flow in `DirectivePanel.tsx`, `App.tsx`, `helpers.ts`, `CircuitMap.tsx`, `MapTraitsPanel`, i18n catalogs, and the existing tests before changing UI.
- [x] 2. Implement the smallest component-level redesign that replaces dropdown-first controls with visible decision cards while preserving existing form values and API payloads.
- [x] 3. Add compact race-day phase framing so the player sees the current objective: read the circuit, test a chrono, adjust the directive, lock the plan, or launch the GP.
- [x] 4. Add actionable circuit-trait briefing so Grip, Overtaking, and Energy values get qualitative levels, concrete meaning, and directive tradeoff hints without changing map telemetry.
- [x] 5. Add EN/FR copy for the renamed pit wall plan, current objective, chrono purpose, choice labels, consequences, card selection states, trait briefing, lock CTA, and dynamic plan summary.
- [x] 6. Update CSS in `layout.css` for directive cards, trait briefing, selected state, locked state, current objective, summary, mobile stacking, and readable compact layout.
- [x] 7. Update unit and Playwright tests for the new accessible controls, trait briefing, chrono-purpose framing, phase transitions, and plan summary.
- [x] 8. Run focused validation first, then the full local gate required by the request.
- [x] 9. Refresh Logics indicators/status through `logics-manager` only if workflow docs are edited during implementation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_065_map_directive_choices_to_player_facing_race_plan_language`
- `item_066_replace_directive_dropdowns_with_decision_cards`
- `item_067_make_garage_card_selection_readable_inside_the_race_plan`
- `item_068_add_a_dynamic_pit_wall_plan_summary`
- `item_069_validate_directive_clarity_with_tests_and_screenshots`
- `item_070_explain_circuit_traits_as_actionable_race_briefing`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `DirectivePanel.tsx` now frames the surface as a pit wall plan with `directive_kicker` and `directive_title` EN/FR copy.
- request-AC2 -> This task. Proof: `DirectivePanel.tsx` renders approach choices as accessible visible choice cards preserving `prudent | balanced | aggressive`.
- request-AC3 -> This task. Proof: `DirectivePanel.tsx` renders preparation choices as accessible visible choice cards preserving `speed | reliability | weather`.
- request-AC4 -> This task. Proof: `DirectivePanel.tsx` renders no-card and owned-card choices visibly with fit text and `CardStatBadges`.
- request-AC5 -> This task. Proof: `DirectivePanel.tsx` renders `directive_plan_summary` from selected approach, preparation, and card.
- request-AC6 -> This task. Proof: `App.tsx` shows compact race-day phase framing and locked-plan state; existing submit and launch commands remain covered by tests.
- request-AC7 -> This task. Proof: all new visible copy is in `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`.
- request-AC8 -> This task. Proof: `npm test -- apps/web` and `npm run test:e2e -- --project=chromium` pass.
- request-AC9 -> This task. Proof: `tests/e2e/private-league.spec.ts` checks desktop and mobile drive layout, including no directive horizontal overflow.
- request-AC10 -> This task. Proof: `DirectivePanel.tsx` keeps map telemetry visible and adds qualitative trait levels plus actionable trait briefing copy.
- request-AC11 -> This task. Proof: `App.tsx` adds compact race-day phase titles/body and step chips for circuit, chrono, plan, lock, and GP.
- request-AC12 -> This task. Proof: the old permanent race-prep explainer is replaced by compact current-phase framing; no new permanent tutorial panel was added.

# Validation
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test -- apps/web` passed.
- `npm run test:e2e -- --project=chromium` passed.
- `npm run build` passed.
- `npm run logics:validate` passed with only expected deferred-traceability warnings before closeout.
- Implemented compact GP-day phase framing, visible directive decision cards, actionable trait briefing, plan summary, localized EN/FR copy, unit coverage, and desktop/mobile Playwright layout checks. Validation passed: npm run typecheck; npm run lint; npm test -- apps/web; npm run test:e2e -- --project=chromium; npm run build; npm run logics:validate.
- Finish workflow executed on 2026-07-16.
- Linked backlog/request close verification passed.

# Report
- Implemented compact GP-day phase framing, visible directive decision cards, actionable trait briefing, plan summary, localized EN/FR copy, unit coverage, and desktop/mobile Playwright layout checks.
- Finished on 2026-07-16.
- Linked backlog item(s): `item_065_map_directive_choices_to_player_facing_race_plan_language`, `item_066_replace_directive_dropdowns_with_decision_cards`, `item_067_make_garage_card_selection_readable_inside_the_race_plan`, `item_068_add_a_dynamic_pit_wall_plan_summary`, `item_069_validate_directive_clarity_with_tests_and_screenshots`, `item_070_explain_circuit_traits_as_actionable_race_briefing`
- Related request(s): `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`

# AI Context
- Summary: Orchestrate pit wall race plan clarity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
