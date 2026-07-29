## task_134_orchestrate_solo_save_slots - Orchestrate solo save slots
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Measure the current save before changing anything: build a solo fixture, resolve several Grand Prix, and record the size split between traces, history and state.
- [x] 2. Bound the save size first, because the slot count depends on it; verify a trace-less history entry still replays.
- [x] 3. Move storage to per-slot keys plus a light index, with the legacy save migrated into a slot, and cover it with unit tests before any UI.
- [x] 4. Add the picker to the entry flow, reusing the choice-step panel treatment and the existing destructive confirmation.
- [x] 5. Keep the no-save path direct: verify a first-time player still reaches a race without an extra screen.
- [x] 6. Verify on a rendered screen, not only through unit tests: a populated slot, an empty slot, and the skip path.
- [x] 7. Run lint, typecheck, build, unit tests and the e2e suite, and record the results.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_353_bound_what_a_solo_save_costs_in_storage`
- `item_354_store_solo_games_in_three_slots_with_a_light_index`
- `item_355_pick_a_solo_slot_from_the_entry_screen`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `soloStorage.ts` keys each slot separately; `soloStorage.test.ts` "keeps three slots independent" asserts writing slot 1 leaves slot 0 byte-identical.
- request-AC2 -> This task. Proof: `SoloSlotsView` renders team name, season/round, resolved count, points and last played date; a rendered capture of the picker showed "Volt Union / Season 1 - round 4/6 / 4 GP raced - 93 pts / Last played 1/1/2026" next to two slots reading "Empty".
- request-AC3 -> This task. Proof: `listSoloSlots` reads the `cr-league-solo-slots-v1` index; the test "lists slots without reading their state" deletes the slot state first and still gets a full summary.
- request-AC4 -> This task. Proof: `startSolo` skips the picker when `hasAnySoloSave()` is false; a rendered run with empty storage went straight to "SOLO LEAGUE", and the App test "picks a solo slot once one holds a game" shows the picker appearing on the second visit.
- request-AC5 -> This task. Proof: `migrateLegacySoloSave` moves `cr-league-solo-save-v1` into the first free slot; a rendered run seeded with only the legacy key showed the game in slot 1. It keeps the legacy key when no slot is free rather than destroying the game.
- request-AC6 -> This task. Proof: `trimSoloState` keeps traces for the last 2 resolved races; "leaves room for three full slots inside a 5 MB budget" asserts three 24-Grand-Prix slots stay under 2.5 MB, and "stops growing once the trace budget is reached" bounds the growth.
- request-AC7 -> This task. Proof: the delete button opens the shared `ConfirmActionModal` with `danger`; the App test "asks for confirmation before deleting a solo slot and keeps the others" checks the slot survives until confirm, then that slot 2 is intact.
- request-AC8 -> This task. Proof: lint, typecheck and build pass; 492 unit tests pass (9 skipped) and 7 chromium e2e scenarios pass.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete. Solo now offers three slots with a light index, a legacy migration and a bounded save size.
- The blocking constraint was size, not navigation: a 4 Grand Prix save measured 557 KB, of which 344 KB were replay traces of already-resolved races. Capping traces to the last 2 races is what makes three slots fit.
- The picker is skipped entirely for a first-time player, so the shortened entry flow is unchanged for them.

# AI Context
- Summary: Orchestrate solo save slots
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_133_offer_three_solo_save_slots_with_readable_state`
- Product brief(s): `prod_085_solo_save_slots_product_brief`
- Architecture decision(s): (none yet)
