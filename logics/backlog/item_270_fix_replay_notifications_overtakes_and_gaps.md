## item_270_fix_replay_notifications_overtakes_and_gaps - Fix replay notifications overtakes and gaps
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Auto-dismiss error notifications like every other notification.
Halve notification display time.
Surface every replay overtake in race follow and on the timeline.
Ensure displayed replay gaps use the cars immediately ahead and behind in the visible order.

# Scope
- In:
  - Use one two-second timeout for info and error notifications.
  - Complete race-director overtakes from replay order-change facts or canonical traces.
  - Calculate player gaps from cumulative trace gaps and the visible tower order.
- Out:
  - Replay simulation balance, timing, camera, or layout changes.

# Acceptance criteria
- AC1: Info and error notifications automatically disappear after two seconds.
- AC2: Replay overtakes from facts or legacy canonical traces appear in race follow and as timeline markers.
- AC3: Ahead and behind values are calculated from cumulative trace gaps using the visible classification order.
- AC4: Focused tests, full tests, typecheck, lint, build, and Logics validation pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Info and error notifications automatically disappear after two seconds.
- request-AC2 -> This backlog slice. Proof: AC2: Replay overtakes from facts or legacy canonical traces appear in race follow and as timeline markers.
- request-AC3 -> This backlog slice. Proof: AC3: Ahead and behind values are calculated from cumulative trace gaps using the visible classification order.
- request-AC4 -> This backlog slice. Proof: AC4: Focused tests, full tests, typecheck, lint, build, and Logics validation pass.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_112_fix_replay_notifications_overtakes_and_gaps.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Fix replay notifications overtakes and gaps
- Keywords: backlog-groom, request, fix replay notifications overtakes and gaps, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Fix replay notifications overtakes and gaps.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_112_fix_replay_notifications_overtakes_and_gaps` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_112_fix_replay_notifications_overtakes_and_gaps.md`.
- Generated locally by logics-manager.
- Task `task_113_fix_replay_notifications_overtakes_and_gaps` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_113_fix_replay_notifications_overtakes_and_gaps`
