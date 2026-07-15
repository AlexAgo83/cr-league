## task_039_orchestrate_pit_wall_race_plan_clarity - Orchestrate pit wall race plan clarity
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 92
> Confidence: 86
> Progress: 0
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Inspect the current directive flow in `DirectivePanel.tsx`, `App.tsx`, `helpers.ts`, `CircuitMap.tsx`, `MapTraitsPanel`, i18n catalogs, and the existing tests before changing UI.
- [ ] 2. Implement the smallest component-level redesign that replaces dropdown-first controls with visible decision cards while preserving existing form values and API payloads.
- [ ] 3. Add actionable circuit-trait briefing so Grip, Overtaking, and Energy values get qualitative levels, concrete meaning, and directive tradeoff hints without changing map telemetry.
- [ ] 4. Add EN/FR copy for the renamed pit wall plan, choice labels, consequences, card selection states, trait briefing, lock CTA, and dynamic plan summary.
- [ ] 5. Update CSS in `layout.css` for directive cards, trait briefing, selected state, locked state, summary, mobile stacking, and readable compact layout.
- [ ] 6. Update unit and Playwright tests for the new accessible controls, trait briefing, and plan summary.
- [ ] 7. Run focused validation first, then the full local gate required by the request.
- [ ] 8. Refresh Logics indicators/status through `logics-manager` only if workflow docs are edited during implementation.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_065_map_directive_choices_to_player_facing_race_plan_language`
- `item_066_replace_directive_dropdowns_with_decision_cards`
- `item_067_make_garage_card_selection_readable_inside_the_race_plan`
- `item_068_add_a_dynamic_pit_wall_plan_summary`
- `item_069_validate_directive_clarity_with_tests_and_screenshots`
- `item_070_explain_circuit_traits_as_actionable_race_briefing`

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
- Summary: Orchestrate pit wall race plan clarity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
