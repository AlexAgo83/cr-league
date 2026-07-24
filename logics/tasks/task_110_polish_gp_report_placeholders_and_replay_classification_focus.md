## task_110_polish_gp_report_placeholders_and_replay_classification_focus - Polish GP report placeholders and replay classification focus
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
- `item_267_polish_gp_report_placeholders_and_replay_classification_focus`

# Acceptance criteria
- AC1: Delete the Rewards placeholder from the pending GP report.
- AC2: Make classification badges focus buttons only while replay focus mode is enabled.
- AC3: Render subtle secondary-livery connector lines beneath replay controls.
- AC4: Cover badge focus with a focused component test and browser verification.

# AC Traceability
- request-AC1 -> This task. Proof: The pending-report Rewards section and its obsolete App expectation were removed.
- request-AC2 -> This task. Proof: `ReplayView` passes `setFocusedCarId` to classification badges only when driver focus is active.
- request-AC3 -> This task. Proof: `ReplayDriverConnectors` follows badge and car rectangles in an SVG layer below replay controls.
- request-AC4 -> This task. Proof: `ReplayTower.test.tsx`, full tests, typecheck, lint, build, and desktop/mobile browser checks passed.

# Validation
- Focused ReplayTower and App tests passed: 33 tests.
- `npm run typecheck` passed.
- Browser check on `/replay/cmry51iq`: 8 focus badges, 8 live connectors, badge click switched `aria-pressed` to true.
- Desktop and mobile viewport checks kept all 8 connectors within the existing replay stage.
- `npm test` passed: 300 tests, 7 skipped.
- `npm run lint` passed.
- `npm run build` passed.
- `logics-manager lint --require-status` passed.
- `logics-manager audit --group-by-doc` passed with 0 findings.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Removed the stale pre-GP Rewards placeholder.
- Reused ReplayView's existing focused-car state for classification badge clicks.
- Added low-opacity, non-interactive SVG connectors between badges and moving cars.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_267_polish_gp_report_placeholders_and_replay_classification_focus`
- Related request(s): `req_109_polish_gp_report_placeholders_and_replay_classification_focus`

# AI Context
- Summary: Implement polish gp report placeholders and replay classification focus.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_109_polish_gp_report_placeholders_and_replay_classification_focus`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
