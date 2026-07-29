## task_134_orchestrate_solo_save_slots - Orchestrate solo save slots
> From version: 0.8.0
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
- [ ] 1. Measure the current save before changing anything: build a solo fixture, resolve several Grand Prix, and record the size split between traces, history and state.
- [ ] 2. Bound the save size first, because the slot count depends on it; verify a trace-less history entry still replays.
- [ ] 3. Move storage to per-slot keys plus a light index, with the legacy save migrated into a slot, and cover it with unit tests before any UI.
- [ ] 4. Add the picker to the entry flow, reusing the choice-step panel treatment and the existing destructive confirmation.
- [ ] 5. Keep the no-save path direct: verify a first-time player still reaches a race without an extra screen.
- [ ] 6. Verify on a rendered screen, not only through unit tests: a populated slot, an empty slot, and the skip path.
- [ ] 7. Run lint, typecheck, build, unit tests and the e2e suite, and record the results.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_353_bound_what_a_solo_save_costs_in_storage`
- `item_354_store_solo_games_in_three_slots_with_a_light_index`
- `item_355_pick_a_solo_slot_from_the_entry_screen`

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
- Summary: Orchestrate solo save slots
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_133_offer_three_solo_save_slots_with_readable_state`
- Product brief(s): `prod_085_solo_save_slots_product_brief`
- Architecture decision(s): (none yet)
