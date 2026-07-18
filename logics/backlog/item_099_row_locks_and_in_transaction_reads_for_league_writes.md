## item_099_row_locks_and_in_transaction_reads_for_league_writes - Row locks and in-transaction reads for league writes
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Concurrency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Postgres Read Committed does not serialize the pass-3 read-then-update transactions on the qualifyingRuns JSON column, so concurrent submissions can still lose runs and exceed the attempt limit.
- resolveCurrentGrandPrix simulates from state read before the claiming transaction, so a decision landing in the window is persisted but not simulated.
- startNextGrandPrix buys bot cards and resets season points from a pre-transaction team snapshot, skipping teams created in the window.

# Scope
- In:
  - Add a raw SELECT ... FOR UPDATE on the GrandPrix row at the top of the submitQualifyingRun and ensureBotQualifyingRuns transactions, guarded so the memory-db test path (no $transaction/raw support) keeps working.
  - Move the decision read and participant build of resolveCurrentGrandPrix inside the claiming transaction, or re-check the decision set inside the transaction and abort with a retryable conflict when it changed.
  - Re-read teams inside the startNextGrandPrix transaction for buyBotCards and the season points reset.
  - Keep the existing unique-constraint claim and guarded updateMany patterns untouched.
  - Add or extend tests asserting the attempt limit and consistent outcomes on sequential repeat calls; document that true concurrent-write coverage requires Postgres.
- Out:
  - A dedicated QualifyingRun table (escalation path only if locking proves insufficient).
  - Advisory locks, queues, or serializable isolation globally.

# Acceptance criteria
- AC1: On Postgres, concurrent qualifying submissions serialize on the row lock; runs are never lost and the attempt limit holds.
- AC2: The resolved race result always reflects the decision set that was persisted at claim time.
- AC3: Teams present at transaction time all receive the season points reset and bot purchases.
- AC4: The in-memory test suite passes unchanged.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: On Postgres, concurrent qualifying submissions serialize on the row lock; runs are never lost and the attempt limit holds.
- request-AC3 -> This backlog slice. Proof: AC2: The resolved race result always reflects the decision set that was persisted at claim time.
- request-AC8 -> This backlog slice. Proof: AC3: Teams present at transaction time all receive the season points reset and bot purchases.
- request-AC4 -> This backlog slice. Evidence needed: classification positionChange equals standingsRank minus final position exactly, narrative deltas move to a separate field if still needed, ReplayView's reconstructed starting grid is always a valid permutation, and a test locks the invariant.
- request-AC5 -> This backlog slice. Evidence needed: dragging the replay scrubber during playback wins over the animation loop, weather icons and ticks have pointer-events none, the range input exposes aria-valuetext with lap/time context, and the seek markers keep working.
- request-AC6 -> This backlog slice. Evidence needed: pickWeighted never returns an entry whose effective weight is zero (with a test that forces cursor 0), livery colors are validated to a hex pattern at render, team name updates submit trimmed values, the modal only closes when the pointer press started on the overlay, focus restore falls back safely when the trigger is gone, and clearing a league-config numeric field no longer collapses to 0 while typing.
- request-AC7 -> This backlog slice. Evidence needed: deterministic tests cover a forced mechanical_scare and a forced mechanic_save; the balance script's card delta is a lookup table; shared package tests run under the node environment; scripts import shared through a single path; API_PORT falls back to the default on NaN; render.yaml applies migrations in preDeployCommand.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_repo_review_remediation_pass_4_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish`
- Primary task(s): `task_046_orchestrate_repo_review_remediation_pass_4`

# AI Context
- Summary: Row locks and in-transaction reads for league writes
- Keywords: scaffolded-backlog, row locks and in-transaction reads for league writes, implementation-ready
- Use when: Implementing the scaffolded slice for Row locks and in-transaction reads for league writes.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_046_orchestrate_repo_review_remediation_pass_4`

# Notes
- Task `task_046_orchestrate_repo_review_remediation_pass_4` was finished via `logics-manager flow finish task` on 2026-07-18.
