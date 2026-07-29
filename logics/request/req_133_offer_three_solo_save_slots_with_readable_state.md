## req_133_offer_three_solo_save_slots_with_readable_state - Offer three solo save slots with readable state
> From version: 0.8.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Solo persistence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let a player keep several solo runs instead of one, so a new attempt does not overwrite an existing season.
- Show, for each slot that holds a game, the team name, how far the season has gone, and when it was last played.
- Keep the first-run experience direct: a player with no saved game should not have to pick an empty slot before playing.
- Keep solo entirely local, with no profile and no network call.

# Context
- Solo currently launches straight into the single save when the player picks Solo from the entry screen.
- The save format already carries every field a slot needs to display, so this is a storage and navigation change rather than a data model change.
- The blocking constraint is size: the save is 99% replay traces and grows with every resolved Grand Prix, so three slots of it would run into the browser storage quota.
- Historical replay of a past Grand Prix reads the stored trace, so trimming traces trades storage against how far back a replay stays precise.
- The entry flow was recently shortened, and adding a mandatory slot picker in front of a first-time player would give that back.

# Acceptance criteria
- AC1: Solo offers three independent save slots; starting a game in one never overwrites another.
- AC2: A slot holding a game shows the team name, the season and round progress, and the last played date; an empty slot reads as empty and offers to start there.
- AC3: The slot picker reads slot metadata without parsing every stored game state.
- AC4: A player with no saved game goes straight into a new game rather than through the picker; the picker appears once at least one slot holds a game.
- AC5: The existing single-slot save is migrated into a slot rather than orphaned or deleted.
- AC6: Stored size per slot is bounded so that three full slots stay well inside the browser storage quota, and the bound is asserted by a test.
- AC7: A slot can be deleted from the picker with a confirmation, and deleting one leaves the others intact.
- AC8: Lint, typecheck, build, unit tests and the e2e suite pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_085_solo_save_slots_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/app/soloStorage.ts
- apps/web/src/app/soloLeague.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/SetupViews.tsx
- apps/web/src/app/appStorage.ts
- apps/web/src/features/ReplayView.tsx
- Current diagnostic: solo persistence is a single slot under `cr-league-solo-save-v1`, holding schemaVersion, createdAt, updatedAt and the whole LeagueState.
- Current diagnostic: a measured 4 Grand Prix solo save weighs 557 KB. Replay traces of already-resolved Grand Prix account for 344 KB of it, the current Grand Prix trace for another 86 KB, and teams plus league metadata for 1 KB.
- Current diagnostic: each resolved Grand Prix adds roughly 86 KB of trace and a season is six Grand Prix, so a save grows without bound. Three slots at five seasons each would be about 7.8 MB, past the usual 5 MB localStorage quota.
- Current diagnostic: `safeStorage.set` swallows quota errors by design (appStorage.ts), so an over-quota save fails silently while React state stays correct. The player only discovers the loss on reload.
- Current diagnostic: `RaceResult.replayTrace` is already optional and `ReplayView` reads `result.replayTrace ?? []`. A result stripped of its trace drops from 100 KB to 14 KB and keeps classification, events and replayFacts.
- Current diagnostic: everything a slot needs to display already exists in the save — team name in `state.teams`, season/round/status in `state.currentGrandPrix`, resolved count in `state.grandPrixHistory`, and both timestamps on the save envelope.

# AI Context
- Summary: Offer three solo save slots with readable state
- Keywords: request-chain-scaffold, offer three solo save slots with readable state, development-ready
- Use when: You need to implement or review the scaffolded workflow for Offer three solo save slots with readable state.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_353_bound_what_a_solo_save_costs_in_storage`
- `item_354_store_solo_games_in_three_slots_with_a_light_index`
- `item_355_pick_a_solo_slot_from_the_entry_screen`
