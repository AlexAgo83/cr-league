## task_057_darken_circuit_detail_panel_background - Darken circuit detail panel background
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
- `item_133_darken_circuit_detail_panel_background`

# Acceptance criteria
- AC1: The circuit detail screen has a dark background behind the map.
- AC2: The change is scoped to the circuit detail screen, not all circuit maps.
- AC3: The circuit detail map no longer shows a light frame/liseret around the map.
- AC4: The close action is rendered as the usual X button while keeping an accessible label.
- AC5: Focused validation passes.

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
- Added a dark background and padding to `.circuit-detail-screen`.
- Removed the inset frame/liseret around the detail view.
- Overrode the nested `.circuit-map` background, border, radius, and padding inside `.circuit-detail-screen` so the map surface sits on the dark panel.
- Removed the forced min-height on the detail map wrapper so the map does not leave an empty dark band below the SVG.
- Changed the detail close action from text to the usual `×` button with an accessible close label.
- Scoped the styling to the Championship circuit detail screen so other maps are unchanged.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_133_darken_circuit_detail_panel_background`
- Related request(s): `req_056_darken_circuit_detail_panel_background`

# AI Context
- Summary: Darken the map detail background in Championship Circuits.
- Keywords: championship, circuit detail, CSS, dark background
- Use when: You need context for this detail panel background fix.
- Skip when: The work is unrelated to Championship Circuits styling.

# Links
- Request: `req_056_darken_circuit_detail_panel_background`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `.circuit-detail-screen` now sets `background: #100e12`.
- request-AC2 -> This task. Proof: map overrides are scoped to `.circuit-detail-screen .circuit-map`.
- request-AC3 -> This task. Proof: the detail map override removes border, radius, light background, and padding from the nested `.circuit-map`.
- request-AC4 -> This task. Proof: `.circuit-detail-close` renders `×` with `aria-label={tt("action_close")}`.
- request-AC5 -> This task. Proof: `npm run lint`, `npm test -- apps/web/src/app/App.test.tsx`, and `logics-manager lint --require-status` passed.
