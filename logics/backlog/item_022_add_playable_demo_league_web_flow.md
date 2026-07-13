## item_022_add_playable_demo_league_web_flow - Add playable demo league web flow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Web gameplay
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The web app needs to consume the persisted league API so the player can feel a complete create/direct/resolve/read loop.
- This slice keeps the flow demo-scoped but makes it interactive and stateful.

# Scope
- In:
  - create demo league UI.
  - league state panel.
  - directive form.
  - submit directive action.
  - resolve Grand Prix action.
  - result rendering.
  - web test for the flow.
- Out:
  - auth.
  - invite/join flow.
  - inventory persistence.
  - scheduling.
  - multi-round season UI.
  - visual replay animation.

# Acceptance criteria
- AC1: Player can create a demo league.
- AC2: Player can submit a directive.
- AC3: Player can resolve the Grand Prix.
- AC4: Player can read standings and race result.
- AC5: Validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: create demo league UI is in scope.
- request-AC2 -> This backlog slice. Proof: league state rendering is in scope.
- request-AC3 -> This backlog slice. Proof: directive controls are in scope.
- request-AC4 -> This backlog slice. Proof: directive submission is in scope.
- request-AC5 -> This backlog slice. Proof: Grand Prix resolve is in scope.
- request-AC6 -> This backlog slice. Proof: result rendering is in scope.
- request-AC7 -> This backlog slice. Proof: loading/error states are in scope.
- request-AC8 -> This backlog slice. Proof: web flow test is in scope.
- request-AC9 -> This backlog slice. Proof: validation is in scope.
- request-AC10 -> This backlog slice. Proof: auth/invite/inventory/scheduling/multi-round UX are out of scope.

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
- Request: `req_016_add_playable_demo_league_web_flow`
- Primary task(s): `task_017_add_playable_demo_league_web_flow`

# AI Context
- Summary: Add playable demo league web flow
- Keywords: backlog-groom, request, add playable demo league web flow, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Add playable demo league web flow.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: This is the first user-facing proof of the core gameplay loop.

# Notes
- Hybrid rationale: Derived from request `req_016_add_playable_demo_league_web_flow` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_016_add_playable_demo_league_web_flow.md`.
- Generated locally by logics-manager.
- Task `task_017_add_playable_demo_league_web_flow` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_017_add_playable_demo_league_web_flow`
