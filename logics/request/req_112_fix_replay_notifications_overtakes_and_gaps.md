## req_112_fix_replay_notifications_overtakes_and_gaps - Fix replay notifications overtakes and gaps
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay feedback accuracy
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Auto-dismiss error notifications like every other notification.
- Halve notification display time.
- Surface every replay overtake in race follow and on the timeline.
- Ensure displayed replay gaps use the cars immediately ahead and behind in the visible order.

# Context
- Error notifications currently default to persistent while informational notifications expire after four seconds.
- Race director facts may omit overtakes in older results or cap them in generated director beats.
- Gap values are cumulative to the leader, but neighbor selection currently follows the raw trace order during visually staged position changes.

# Acceptance criteria
- AC1: Info and error notifications automatically disappear after two seconds.
- AC2: Replay overtakes from facts or legacy canonical traces appear in race follow and as timeline markers.
- AC3: Ahead and behind values are calculated from cumulative trace gaps using the visible classification order.
- AC4: Focused tests, full tests, typecheck, lint, build, and Logics validation pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/app/useNotifications.ts`
- `apps/web/src/features/ReplayView.tsx`
- `apps/web/src/features/replay/replayDirector.ts`
- `apps/web/src/features/replay/replayMath.ts`

# AI Context
- Summary: Draft a bounded request for fix replay notifications overtakes and gaps.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- none
- `item_270_fix_replay_notifications_overtakes_and_gaps`
