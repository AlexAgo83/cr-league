## item_101_replay_scrubber_interaction_polish - Replay scrubber interaction polish
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Web accessibility
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The rAF loop rewrites the range input's value every frame, so grabbing the thumb during playback snaps back and scrubbing while playing is unusable.
- Weather icons and segment ticks overlay the transparent range input without pointer-events none, creating dead zones where clicks seek nowhere.
- The scrubber announces only raw seconds to assistive tech.

# Scope
- In:
  - Suppress the per-frame value write while the user is interacting (dragging ref set on pointerdown, cleared on pointerup) or pause playback on pointerdown.
  - Add pointer-events: none to .replay-weather and .replay-tick; keep seek-marker buttons interactive.
  - Set aria-valuetext on the range input with lap and time context, updated as the value changes.
  - Extend the existing web tests only where a behavior is cheaply assertable (aria-valuetext presence); manual verification notes for the drag behavior are acceptable.
- Out:
  - Restyling the replay bar.
  - Touch-gesture or pinch support.

# Acceptance criteria
- AC1: Dragging the scrubber during playback tracks the pointer without snapping back.
- AC2: Every horizontal position on the bar is clickable for seeking except the marker buttons.
- AC3: Assistive tech announces lap/time context, not just raw seconds.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Dragging the scrubber during playback tracks the pointer without snapping back.
- request-AC8 -> This backlog slice. Proof: AC2: Every horizontal position on the bar is clickable for seeking except the marker buttons.
- request-AC3 -> This backlog slice. Evidence needed: resolveCurrentGrandPrix reads decisions and simulates inside the claiming transaction (or re-validates that no decision changed before committing), and startNextGrandPrix re-reads teams inside its transaction for bot purchases and the season points reset.
- request-AC4 -> This backlog slice. Evidence needed: classification positionChange equals standingsRank minus final position exactly, narrative deltas move to a separate field if still needed, ReplayView's reconstructed starting grid is always a valid permutation, and a test locks the invariant.
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
- Summary: Replay scrubber interaction polish
- Keywords: scaffolded-backlog, replay scrubber interaction polish, implementation-ready
- Use when: Implementing the scaffolded slice for Replay scrubber interaction polish.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_046_orchestrate_repo_review_remediation_pass_4`

# Notes
- Task `task_046_orchestrate_repo_review_remediation_pass_4` was finished via `logics-manager flow finish task` on 2026-07-18.
