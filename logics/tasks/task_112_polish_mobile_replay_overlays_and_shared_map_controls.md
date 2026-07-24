## task_112_polish_mobile_replay_overlays_and_shared_map_controls - Polish mobile replay overlays and shared map controls
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
- `item_269_polish_mobile_replay_overlays_and_shared_map_controls`

# Acceptance criteria
- AC1: Keep the mobile Info button inside a readable status panel.
- AC2: Merge driver gap chips into race-follow copy and remove the standalone panel.
- AC3: Share the stats expanded preference across standard and replay maps.
- AC4: Commit each completed wave separately.

# AC Traceability
- request-AC1 -> This task. Proof: responsive status panel uses its own positioning context and a 162 px mobile width.
- request-AC2 -> This task. Proof: ReplayStageOverlay renders gap chips in the race-director panel and no longer imports or renders PositionBadge there.
- request-AC3 -> This task. Proof: DriveView and ReplayStageOverlay use the same persisted hook and shared MapStatsToggle; the App flow test collapses replay stats and observes them collapsed after returning to DriveView.
- request-AC4 -> This task. Proof: commits `33494ef` and `3fbe62a` contain waves 1 and 2; wave 3 is staged only after its own focused and full validation.

# Validation
- Wave 1 browser check at 390x844: panel `x=8..170`, Info button `x=133.8..166`, fully contained.
- Wave 2 App flow test passed: race-follow panel contains gaps, no position badge, and no standalone player-focus panel.
- Wave 3 App flow test passed: replay collapse persists and the DriveView stats remain collapsed.
- `npm test`: 300 passed, 7 skipped.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Wave 1: widened the mobile status panel and made it the Info button positioning context.
- Wave 2: moved ahead/behind gaps into the race-follow panel and deleted the standalone gaps panel.
- Wave 3: reused one stats toggle and one persisted preference across standard and replay maps.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_269_polish_mobile_replay_overlays_and_shared_map_controls`
- Related request(s): `req_111_polish_mobile_replay_overlays_and_shared_map_controls`

# AI Context
- Summary: Implement polish mobile replay overlays and shared map controls.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_111_polish_mobile_replay_overlays_and_shared_map_controls`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
