## item_132_align_circuit_detail_close_action - Align circuit detail close action
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
The circuit detail close action is not placed where requested: it should sit in the top-right of the panel header, to the right of the circuit title.

# Scope
- In:
  - Add a circuit detail header with city/name on the left and close action on the right.
  - Hide the map component's own heading to avoid duplicate titles.
  - Update CSS alignment for the header.
  - Update the focused App test selector for the close action.
- Out:
  - Changing the circuit detail navigation model.
  - Adding a new modal.
  - Redesigning the whole Circuits grid.

# Acceptance criteria
- AC1: The circuit detail screen shows the circuit city/name in a header.
- AC2: The close button is aligned to the top-right of that header.
- AC3: The map does not duplicate the title below the custom header.
- AC4: Focused validation passes.

# AC Traceability
- request-AC1 -> AC1.
- request-AC2 -> AC2.
- request-AC3 -> AC3.
- request-AC4 -> AC4.
- request-AC1 -> This backlog slice. Proof: `ChampionshipView` renders `.circuit-detail-header` with city and circuit name.
- request-AC2 -> This backlog slice. Proof: `.circuit-detail-header` uses flex space-between and `.circuit-detail-close` is flexed to the right.
- request-AC3 -> This backlog slice. Proof: detail mode renders `CircuitMap` with `showHeading={false}`.
- request-AC4 -> This backlog slice. Proof: `npm run lint`, `npm test -- apps/web/src/app/App.test.tsx`, and `logics-manager lint --require-status` passed.

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
- Request: `logics/request/req_055_align_circuit_detail_close_action.md`
- Primary task(s): `task_056_align_circuit_detail_close_action`

# AI Context
- Summary: Align circuit detail close action
- Keywords: backlog-groom, request, align circuit detail close action, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Align circuit detail close action.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Small visible UX alignment fix in a recently changed screen.

# Notes
- Hybrid rationale: Derived from request `req_055_align_circuit_detail_close_action` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_055_align_circuit_detail_close_action.md`.
- Generated locally by logics-manager.
- Task `task_056_align_circuit_detail_close_action` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_056_align_circuit_detail_close_action`
