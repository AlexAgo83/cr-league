## item_122_render_replay_event_callouts_near_cars - Render replay event callouts near cars
> From version: 0.3.7
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Replay spectacle
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Replay events are listed in copy, but the map itself does not show what is happening around cars, making the race feel less alive.

# Scope
- In:
  - Render short-lived event callouts near affected cars during replay playback using existing event lap/order timing and car positions.
  - Support a small event label set: attack, defense, card, weather, error, gain/loss.
  - Cap simultaneous callouts and duration so labels do not clutter the map.
  - Respect replay pause/scrub behavior; callouts should follow current replay time, not real time only.
  - Add tests for callout selection, timing window, and cap behavior.
- Out:
  - New replay physics.
  - Complex collision avoidance.
  - Animated cutscenes or full event icons asset pack.

# Acceptance criteria
- AC1: During replay, a qualifying event with a teamId produces a visible callout near that team's car during its timing window.
- AC2: Pausing or scrubbing updates callout visibility based on replay time.
- AC3: No more than the configured cap of callouts appears at once.
- AC4: Tests cover timing and cap logic.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: During replay, a qualifying event with a teamId produces a visible callout near that team's car during its timing window.
- request-AC9 -> This backlog slice. Proof: AC2: Pausing or scrubbing updates callout visibility based on replay time.
- request-AC10 -> This backlog slice. Proof: AC3: No more than the configured cap of callouts appears at once.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_049_race_learning_and_feedback_systems`
- Primary task(s): `task_050_orchestrate_race_learning_and_feedback_systems`

# AI Context
- Summary: Render replay event callouts near cars
- Keywords: scaffolded-backlog, render replay event callouts near cars, implementation-ready
- Use when: Implementing the scaffolded slice for Render replay event callouts near cars.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
