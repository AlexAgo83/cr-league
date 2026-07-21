## item_185_lock_the_json_column_read_modify_write_paths - Lock the JSON-column read-modify-write paths
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: API integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- buyCard (store.ts:401-413) and sellCard (store.ts:436-448) read team.cards via an unlocked findUnique and write it back as a static JS array; the updateMany credits guard is atomic but the cards write is not, so two concurrent buys both charge and both overwrite the array, losing one card and its credits.
- submitDecision (store.ts:518-560) checks GP status outside the transaction and upserts with no GP lock or status re-check, so a decision can land after resolveCurrentGrandPrix snapshots, marking a team ready on a resolved GP.
- joinLeagueByCode (store.ts:265-286) checks teams.length >= maxPlayers then creates a team with no lock, a TOCTOU letting concurrent joins exceed the cap.

# Scope
- In:
  - Add a lockTeamRow(tx, teamId) helper in persistence.ts mirroring lockGrandPrixRow (SELECT id FROM "teams" WHERE id = ... FOR UPDATE, no-op when $queryRaw is absent).
  - In buyCard and sellCard, take lockTeamRow before the findUnique so the whole cards read-modify-write is serial; keep the existing credits guard as belt-and-braces.
  - In submitDecision, move the raceDecision.upsert inside runWrite, lockGrandPrixRow the current GP, re-read status, and reject with 409 when already resolved.
  - In joinLeagueByCode, enforce the maxPlayers cap inside a runWrite that locks the league row and recounts human teams, preserving the retryUnique code-allocation behavior.
  - Add Postgres integration tests (pass-5 lane) for concurrent buys, decision-vs-resolve, and concurrent joins.
- Out:
  - Replacing the in-memory unit DB or changing its no-op $transaction/$queryRaw.
  - Moving cards or decisions to dedicated tables.
  - Any change to card pricing or join UX.

# Acceptance criteria
- AC1: Concurrent buyCard/sellCard on one team never lose a card or miscount credits.
- AC2: A decision cannot be written onto a Grand Prix that is already resolved.
- AC3: Concurrent joins cannot push a league above maxPlayers.
- AC4: The new guarantees are proven by Postgres integration tests, not only the memory DB.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Concurrent buyCard/sellCard on one team never lose a card or miscount credits.
- request-AC6 -> This backlog slice. Proof: AC2: A decision cannot be written onto a Grand Prix that is already resolved.
- request-AC3 -> This backlog slice. Evidence needed: deleteAdminUser refuses to delete a non-test profile without an explicit matching confirmation, and requireAdminClaim rejects with 403 when there is no valid recorded owner instead of transferring ownership; tests cover both.
- request-AC4 -> This backlog slice. Evidence needed: Approach, preparation, and pit badges in DirectivePanel are derived from a single shared stat-delta descriptor that applyDecision also consumes, include pace, and match the real deltas, pinned by a snapshot test.
- request-AC5 -> This backlog slice. Evidence needed: The duplicated lap helper, dead DriveView ternary, FNV-1a qualifying timestamp, unused ensureProfileExists export, and doubly-computed replay order are removed, and tt is memoized; behavior is unchanged and all existing tests pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_049_repo_review_remediation_pass_6_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`
- Primary task(s): `task_086_orchestrate_repo_review_remediation_pass_6`

# AI Context
- Summary: Lock the JSON-column read-modify-write paths
- Keywords: scaffolded-backlog, lock the json-column read-modify-write paths, implementation-ready
- Use when: Implementing the scaffolded slice for Lock the JSON-column read-modify-write paths.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_086_orchestrate_repo_review_remediation_pass_6` was finished via `logics-manager flow finish task` on 2026-07-22.
