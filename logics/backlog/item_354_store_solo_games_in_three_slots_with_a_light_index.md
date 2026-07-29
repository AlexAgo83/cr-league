## item_354_store_solo_games_in_three_slots_with_a_light_index - Store solo games in three slots with a light index
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Solo persistence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Solo storage is a single key, so a second run overwrites the first.
- Reading three full games to render a picker would parse hundreds of kilobytes to show a few words per slot.
- Players already have a game under the current single-slot key and must not lose it.

# Scope
- In:
  - Store each slot under its own key and keep a separate small index holding the per-slot display metadata.
  - Write the index in the same operation as the state so the two cannot drift.
  - Migrate an existing `cr-league-solo-save-v1` save into the first free slot on first read.
  - Support deleting one slot without touching the others.
  - Cover load, save, migration and delete with unit tests.
- Out:
  - No slot renaming, copying or export.
  - No change to multiplayer claim or profile storage.
  - No UI work in this item.

# Acceptance criteria
- AC1: Three slots persist independently; writing one leaves the others byte-identical.
- AC2: The index exposes team name, season, round, resolved count and timestamps without reading any slot state.
- AC3: A legacy single-slot save is migrated once and remains playable.
- AC4: Deleting a slot clears its state and its index entry only.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Three slots persist independently; writing one leaves the others byte-identical.
- request-AC3 -> This backlog slice. Proof: AC2: The index exposes team name, season, round, resolved count and timestamps without reading any slot state.
- request-AC5 -> This backlog slice. Proof: AC3: A legacy single-slot save is migrated once and remains playable.
- request-AC7 -> This backlog slice. Proof: AC4: Deleting a slot clears its state and its index entry only.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_085_solo_save_slots_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_133_offer_three_solo_save_slots_with_readable_state`
- Primary task(s): `task_134_orchestrate_solo_save_slots`

# AI Context
- Summary: Store solo games in three slots with a light index
- Keywords: scaffolded-backlog, store solo games in three slots with a light index, implementation-ready
- Use when: Implementing the scaffolded slice for Store solo games in three slots with a light index.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
