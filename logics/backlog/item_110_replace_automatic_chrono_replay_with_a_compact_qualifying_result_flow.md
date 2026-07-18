## item_110_replace_automatic_chrono_replay_with_a_compact_qualifying_result_flow - Replace automatic chrono replay with a compact qualifying result flow
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Qualifying flow
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- After each qualifying lap, the full lap replay opens automatically, which interrupts users who want to run two or three attempts quickly.
- The full replay is useful, but it should be an explicit review action rather than the default result state after every chrono.
- The first-session flow needs a clear next action: run another attempt if attempts remain, replay if desired, or lock the plan when ready.

# Scope
- In:
  - Change `startQualifyingRun` and the `qualifyingResult` UI so successful runs land on a compact result summary instead of immediately opening inline `ReplayView`.
  - Show the latest attempt time, best time context, approximate grid rank, attempts used/left, and whether it is a new best.
  - Make the primary action `New lap time` while attempts remain; offer `Replay run` as a secondary action; offer `Lock plan` when appropriate.
  - Keep `Review lap time` for reopening the latest or best qualifying replay.
  - Preserve support for the existing `qualifyingReplayTower` and lap replay view when explicitly opened.
  - Update English and French copy for the compact result labels and actions.
- Out:
  - Changing qualifying simulation math.
  - Changing max attempt rules or bot qualifying behavior.
  - Removing qualifying replay entirely.
  - Adding a new page or route for qualifying history.

# Acceptance criteria
- AC1: Completing a qualifying run shows a compact result panel by default and does not open the full replay automatically.
- AC2: The compact panel shows latest attempt time, best/standing context, and attempts remaining.
- AC3: Users can run another attempt directly from the compact panel while attempts remain.
- AC4: Users can explicitly open the lap replay and close it back to the Race screen.
- AC5: Tests cover the default compact result path and explicit replay path.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Completing a qualifying run shows a compact result panel by default and does not open the full replay automatically.
- request-AC7 -> This backlog slice. Proof: AC2: The compact panel shows latest attempt time, best/standing context, and attempts remaining.
- request-AC8 -> This backlog slice. Proof: AC3: Users can run another attempt directly from the compact panel while attempts remain.
- request-AC9 -> This backlog slice. Proof: AC4: Users can explicitly open the lap replay and close it back to the Race screen.
- request-AC10 -> This backlog slice. Proof: AC5: Tests cover the default compact result path and explicit replay path.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_047_polish_first_session_ux_after_playtest_findings`
- Primary task(s): `task_048_orchestrate_first_session_ux_polish_from_playtest_findings`

# AI Context
- Summary: Replace automatic chrono replay with a compact qualifying result flow
- Keywords: scaffolded-backlog, replace automatic chrono replay with a compact qualifying result flow, implementation-ready
- Use when: Implementing the scaffolded slice for Replace automatic chrono replay with a compact qualifying result flow.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
