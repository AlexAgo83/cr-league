## item_133_darken_circuit_detail_panel_background - Darken circuit detail panel background
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The circuit detail view needs a darker panel surface behind the map, should not show a light frame/liseret around the detail map, and should use the usual X close button.

# Scope
- In:
  - Add a dark background to `.circuit-detail-screen`.
  - Override the nested `.circuit-map` frame only inside the detail screen.
  - Render the close action as an X button with an accessible label.
  - Keep the change scoped to the detail screen.
  - Add minimal spacing around the detail screen.
- Out:
  - Redesigning the map component.
  - Changing all circuit maps globally.
  - Changing the Circuits grid cards.

# Acceptance criteria
- AC1: The circuit detail screen has a dark background behind the map.
- AC2: The change is scoped to the circuit detail screen, not all circuit maps.
- AC3: The circuit detail map no longer shows a light frame/liseret around the map.
- AC4: The close action is rendered as the usual X button while keeping an accessible label.
- AC5: Focused validation passes.

# AC Traceability
- request-AC1 -> AC1.
- request-AC2 -> AC2.
- request-AC3 -> AC3.
- request-AC4 -> AC4.
- request-AC5 -> AC5.
- request-AC1 -> This backlog slice. Proof: `.circuit-detail-screen` now sets `background: #100e12`.
- request-AC2 -> This backlog slice. Proof: map overrides are scoped to `.circuit-detail-screen .circuit-map`.
- request-AC3 -> This backlog slice. Proof: the detail map override removes border, radius, light background, and padding from the nested `.circuit-map`.
- request-AC4 -> This backlog slice. Proof: `.circuit-detail-close` renders `×` with `aria-label={tt("action_close")}`.
- request-AC5 -> This backlog slice. Proof: `npm run lint`, `npm test -- apps/web/src/app/App.test.tsx`, and `logics-manager lint --require-status` passed.

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
- Request: `logics/request/req_056_darken_circuit_detail_panel_background.md`
- Primary task(s): `task_057_darken_circuit_detail_panel_background`

# AI Context
- Summary: Darken circuit detail panel background
- Keywords: backlog-groom, request, darken circuit detail panel background, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Darken circuit detail panel background.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Small visible polish issue in a recently changed detail screen.

# Notes
- Hybrid rationale: Derived from request `req_056_darken_circuit_detail_panel_background` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_056_darken_circuit_detail_panel_background.md`.
- Generated locally by logics-manager.
- Task `task_057_darken_circuit_detail_panel_background` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_057_darken_circuit_detail_panel_background`
