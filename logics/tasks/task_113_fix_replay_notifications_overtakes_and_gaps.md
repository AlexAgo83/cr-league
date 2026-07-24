## task_113_fix_replay_notifications_overtakes_and_gaps - Fix replay notifications overtakes and gaps
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_270_fix_replay_notifications_overtakes_and_gaps`

# Acceptance criteria
- AC1: Info and error notifications automatically disappear after two seconds.
- AC2: Replay overtakes from facts or legacy canonical traces appear in race follow and as timeline markers.
- AC3: Ahead and behind values are calculated from cumulative trace gaps using the visible classification order.
- AC4: Focused tests, full tests, typecheck, lint, build, and Logics validation pass.

# AC Traceability
- request-AC1 -> This task. Proof: useNotifications schedules every tone for 2,000 ms; its focused test covers info and error.
- request-AC2 -> This task. Proof: buildReplayPlan reconstructs canonical trace overtakes and buildRaceDirectorBeats merges every planned overtake into the director stream consumed by race follow and timeline markers.
- request-AC3 -> This task. Proof: playerReplayContext receives snapshot.tower order and uses absolute cumulative-gap differences; its focused test verifies 3.0 s ahead and 1.0 s behind across an order transition.
- request-AC4 -> This task. Proof: focused and full validation results are recorded below.

# Validation
- Focused notification, ReplayView, and App tests passed.
- `npm test`: 304 passed, 7 skipped.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Removed persistent error notifications and halved the shared timeout to two seconds.
- Completed race director overtakes from stored facts and canonical traces, which feeds both race follow and timeline markers.
- Aligned ahead/behind gap neighbors with the visible replay tower while retaining cumulative-gap subtraction.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_270_fix_replay_notifications_overtakes_and_gaps`
- Related request(s): `req_112_fix_replay_notifications_overtakes_and_gaps`

# AI Context
- Summary: Implement fix replay notifications overtakes and gaps.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_112_fix_replay_notifications_overtakes_and_gaps`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
