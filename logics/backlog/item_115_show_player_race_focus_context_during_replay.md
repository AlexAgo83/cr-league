## item_115_show_player_race_focus_context_during_replay - Show player race focus context during replay
> From version: 0.3.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: Player replay comprehension
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- When the player team is near the back, the tower shows the position but the replay does not explain whether the player is gaining, losing, pressuring, or isolated.
- Players need their own race story visible without opening the report or manually comparing tower changes.
- The existing focus-driver control can center the map, but it does not provide enough race context.

# Scope
- In:
  - Add a compact player focus panel or integrate equivalent context into the existing replay UI.
  - Show current player position, gain/loss from start, gap ahead, gap behind, and latest player-relevant beat/event.
  - Derive gaps and positions from replay trace/tower state, not from new simulation behavior.
  - Respect existing focus-driver preference and do not force player focus if the user turns it off.
  - Keep desktop and mobile layouts compact and non-overlapping.
  - Add tests for player context calculation, including leader, midfield, and last-place cases.
- Out:
  - Adding per-driver telemetry charts.
  - Changing the classification table.
  - Adding persistent player replay analytics.
  - Changing player scoring or reward display.

# Acceptance criteria
- AC1: When a player team exists, replay exposes current position and start-to-current gain/loss.
- AC2: Gap ahead and gap behind are shown when they can be derived; leader/last edge cases degrade cleanly.
- AC3: Latest player-relevant director beat or event appears when available.
- AC4: Turning off focus-driver behavior does not remove all player context unless explicitly scoped and documented.
- AC5: Tests cover context calculations for player leader, player midfield, and player last.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: When a player team exists, replay exposes current position and start-to-current gain/loss.
- request-AC6 -> This backlog slice. Proof: AC2: Gap ahead and gap behind are shown when they can be derived; leader/last edge cases degrade cleanly.
- request-AC7 -> This backlog slice. Proof: AC3: Latest player-relevant director beat or event appears when available.
- request-AC8 -> This backlog slice. Proof: AC4: Turning off focus-driver behavior does not remove all player context unless explicitly scoped and documented.
- request-AC9 -> This backlog slice. Proof: AC5: Tests cover context calculations for player leader, player midfield, and player last.
- request-AC10 -> This backlog slice. Proof: AC5: Tests cover context calculations for player leader, player midfield, and player last.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Primary task(s): `task_049_orchestrate_replay_spectacle_fun_pass`

# AI Context
- Summary: Show player race focus context during replay
- Keywords: scaffolded-backlog, show player race focus context during replay, implementation-ready
- Use when: Implementing the scaffolded slice for Show player race focus context during replay.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
