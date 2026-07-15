## item_072_add_timed_replay_moment_notifications - Add timed replay moment notifications
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Replay event presentation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Removing the side list would hide key event text unless the replay surfaces it another way.
- Key moments make more sense when they appear at the lap/time where they happen.
- Notifications must not overlap essential replay controls or make the map unreadable.

# Scope
- In:
  - Reuse existing `keyMoments`, `momentCard`, `raceTimeAtProgress`, and `clock` data to derive the currently active notification.
  - Show a compact overlay notification with lap, context, team/text, and impact.
  - Display a notification when playback reaches a moment and when seeking directly to a marker.
  - Keep notification timing deterministic and local to `ReplayView`.
  - Add CSS for desktop and mobile notification placement that avoids map status, tower, controls, and progress bar.
- Out:
  - Global toast service.
  - Notification queue for unrelated app events.
  - Voice/audio effects.
  - New animation package.

# Acceptance criteria
- AC1: At least one key moment notification appears during replay playback.
- AC2: Notification content uses the same event text semantics as the previous key moment list.
- AC3: Seeking to a marker shows or updates the corresponding notification.
- AC4: Notifications do not cover the playback controls or progress bar on desktop or mobile.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: At least one key moment notification appears during replay playback.
- request-AC4 -> This backlog slice. Proof: AC2: Notification content uses the same event text semantics as the previous key moment list.
- request-AC8 -> This backlog slice. Proof: AC3: Seeking to a marker shows or updates the corresponding notification.
- request-AC9 -> This backlog slice. Proof: AC4: Notifications do not cover the playback controls or progress bar on desktop or mobile.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_039_turn_replay_key_moments_into_timed_notifications`
- Primary task(s): `task_040_orchestrate_full_width_replay_moment_notifications`

# AI Context
- Summary: Add timed replay moment notifications
- Keywords: scaffolded-backlog, add timed replay moment notifications, implementation-ready
- Use when: Implementing the scaffolded slice for Add timed replay moment notifications.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
