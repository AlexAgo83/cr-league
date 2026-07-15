## item_073_preserve_marker_seeking_as_the_compact_replay_index - Preserve marker seeking as the compact replay index
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Replay navigation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The side list currently doubles as a navigation surface for key moments.
- After removing it, progress-bar markers become the only persistent key moment index.
- Marker behavior must remain obvious and reliable enough for replay review.

# Scope
- In:
  - Keep `.replay-marker` dots visible on the progress bar.
  - Preserve click-to-seek behavior for markers.
  - Ensure marker titles remain informative for hover/screen-reader-adjacent inspection.
  - Consider a minimal visual distinction for player-involved moments if current styling is insufficient.
  - Update e2e tests to click a marker and assert map/notification state changes.
- Out:
  - Large timeline drawer.
  - Permanent event list replacement.
  - Scrubber redesign beyond marker reliability.
  - Keyboard shortcut system.

# Acceptance criteria
- AC1: Marker dots remain visible after the side panel is removed.
- AC2: Clicking a marker seeks the replay to that moment.
- AC3: Player-involved moments remain distinguishable if they were distinguishable before.
- AC4: Tests cover marker seeking after the layout change.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Marker dots remain visible after the side panel is removed.
- request-AC5 -> This backlog slice. Proof: AC2: Clicking a marker seeks the replay to that moment.
- request-AC6 -> This backlog slice. Proof: AC3: Player-involved moments remain distinguishable if they were distinguishable before.
- request-AC9 -> This backlog slice. Proof: AC4: Tests cover marker seeking after the layout change.
- request-AC7 -> This backlog slice. Evidence needed: The Report tab remains the durable place for post-race explanation and written recap; no report content is removed.
- request-AC8 -> This backlog slice. Evidence needed: Desktop and mobile layouts show no overlapping notification, tower, controls, map status, or progress bar text.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_039_turn_replay_key_moments_into_timed_notifications`
- Primary task(s): `task_040_orchestrate_full_width_replay_moment_notifications`

# AI Context
- Summary: Preserve marker seeking as the compact replay index
- Keywords: scaffolded-backlog, preserve marker seeking as the compact replay index, implementation-ready
- Use when: Implementing the scaffolded slice for Preserve marker seeking as the compact replay index.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_040_orchestrate_full_width_replay_moment_notifications`

# Notes
- Task `task_040_orchestrate_full_width_replay_moment_notifications` was finished via `logics-manager flow finish task` on 2026-07-16.
