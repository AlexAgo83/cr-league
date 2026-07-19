## task_056_align_circuit_detail_close_action - Align circuit detail close action
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_132_align_circuit_detail_close_action`

# Acceptance criteria
- AC1: The circuit detail screen shows the circuit city/name in a header.
- AC2: The close button is aligned to the top-right of that header.
- AC3: The map does not duplicate the title below the custom header.
- AC4: Focused validation passes.

# Validation
- Passed:
  - `npm run lint`
  - `npm test -- apps/web/src/app/App.test.tsx`
  - `logics-manager lint --require-status`
- Pending:
  - `logics-manager audit --group-by-doc`
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# Report
- Added `.circuit-detail-header` above the map with city/name on the left and close action on the right.
- Renamed the button class to `.circuit-detail-close` and kept the same close behavior.
- Rendered `CircuitMap` with `showHeading={false}` in detail mode to avoid duplicating the title.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_132_align_circuit_detail_close_action`
- Related request(s): `req_055_align_circuit_detail_close_action`

# AI Context
- Summary: Implement the top-right close action in the circuit detail header.
- Keywords: championship, circuit detail, close button, header layout
- Use when: You need context for this layout fix.
- Skip when: The work is unrelated to circuit detail header layout.

# Links
- Request: `req_055_align_circuit_detail_close_action`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `ChampionshipView` renders `.circuit-detail-header` with city and circuit name.
- request-AC2 -> This task. Proof: `.circuit-detail-header` uses flex space-between and `.circuit-detail-close` is flexed to the right.
- request-AC3 -> This task. Proof: detail mode renders `CircuitMap` with `showHeading={false}`.
- request-AC4 -> This task. Proof: `npm run lint`, `npm test -- apps/web/src/app/App.test.tsx`, and `logics-manager lint --require-status` passed.
