## item_100_restore_the_positionchange_invariant - Restore the positionChange invariant
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Simulation correctness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- classify computes positionChange as standingsRank - position + positionDelta, mixing arbitrary narrative card fudges into the real grid-to-finish delta.
- ReplayView reconstructs the starting grid as position + positionChange, which stops being a valid permutation when the narrative delta is included.

# Scope
- In:
  - Set classification positionChange to exactly standingsRank - position.
  - If any consumer still needs the narrative accumulator, expose it as a separate field on the classification entry; otherwise drop it from the result.
  - Verify ReplayView's grid reconstruction and any recap copy that references positions gained still read correctly.
  - Add a shared test asserting that position + positionChange over a full classification is a permutation of 1..n and matches the input standingsRank order.
- Out:
  - Rebalancing card effects or event generation.
  - Changing the replay trace format.

# Acceptance criteria
- AC1: positionChange equals the pure grid-to-finish delta for every classification entry.
- AC2: ReplayView's reconstructed starting grid is always a valid permutation.
- AC3: A test locks the invariant against future narrative additions.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: positionChange equals the pure grid-to-finish delta for every classification entry.
- request-AC8 -> This backlog slice. Proof: AC2: ReplayView's reconstructed starting grid is always a valid permutation.
- request-AC3 -> This backlog slice. Evidence needed: resolveCurrentGrandPrix reads decisions and simulates inside the claiming transaction (or re-validates that no decision changed before committing), and startNextGrandPrix re-reads teams inside its transaction for bot purchases and the season points reset.
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
- Summary: Restore the positionChange invariant
- Keywords: scaffolded-backlog, restore the positionchange invariant, implementation-ready
- Use when: Implementing the scaffolded slice for Restore the positionChange invariant.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_046_orchestrate_repo_review_remediation_pass_4`

# Notes
- Task `task_046_orchestrate_repo_review_remediation_pass_4` was finished via `logics-manager flow finish task` on 2026-07-18.
