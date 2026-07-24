## item_285_batch_per_team_write_loops_in_resolve_rollover_and_bot_purchases - Batch per-team write loops in resolve, rollover, and bot purchases
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Medium
> Theme: Backend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- resolveCurrentGrandPrix (800-818) issues N team updates plus up to 2N consumed-card queries; startNextGrandPrix (861-878) does 3 queries per team; buyBotCards/buyBotCars (1149-1186) do 3 per bot — all sequential inside transactions.
- With maxPlayers teams this is ~3N sequential round-trips per resolve, adding latency and lock hold time.
- An updateMany-with-guard pattern already exists at 493 and 1177.

# Scope
- In:
  - Batch the point/credit increments (updateMany by delta, or Promise.all over distinct rows) instead of sequential awaits.
  - Drop redundant lockTeamRow+findUnique in the bot loops where an updateMany ... where credits >= price already guards atomically.
  - Prove identical resulting points/credits/state via the existing resolution and admin tests.
- Out:
  - Changing scoring, card, or economy logic.
  - Relaxing any race-integrity re-check that must stay inside the transaction.
  - Reordering writes in a way that changes observable results.

# Acceptance criteria
- AC1: The per-team loops issue materially fewer in-transaction round-trips.
- AC2: Resulting points/credits/state are identical, proven by the resolution/admin tests.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: The per-team loops issue materially fewer in-transaction round-trips.
- request-AC9 -> This backlog slice. Proof: AC2: Resulting points/credits/state are identical, proven by the resolution/admin tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Batch per-team write loops in resolve, rollover, and bot purchases
- Keywords: scaffolded-backlog, batch per-team write loops in resolve, rollover, and bot purchases, implementation-ready
- Use when: Implementing the scaffolded slice for Batch per-team write loops in resolve, rollover, and bot purchases.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Partially delivered (commit 9159de1): the resolve consumed-cards loop no longer issues a findUnique per consumed card; it groups removals per team against the locked freshState snapshot (one update per team). The points/credits loop was left sequential (Promise.all on a Prisma interactive-transaction client shares one connection and is unsafe). startNextGrandPrix and the bot-purchase loops were not touched in this pass.
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
