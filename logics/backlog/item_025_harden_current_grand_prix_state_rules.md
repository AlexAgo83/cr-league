## item_025_harden_current_grand_prix_state_rules - Harden current Grand Prix state rules
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Gameplay rules
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current GP happy path works, but invalid state transitions would allow duplicate rewards or resolving without player input.

# Scope
- In:
  - API guards.
  - 409 conflict responses.
  - web disabled states and API error display.
  - API/web tests.
  - real PostgreSQL smoke verification.
- Out:
  - league join.
  - inventory.
  - authentication.
  - multi-round season progression.

# Acceptance criteria
- AC1: Resolve requires a human directive.
- AC2: Resolved GP cannot accept more decisions.
- AC3: Resolved GP cannot resolve again.
- AC4: Web reflects invalid states.
- AC5: Validation and smoke pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: resolve guard is in scope.
- request-AC2 -> This backlog slice. Proof: submit-after-resolution guard is in scope.
- request-AC3 -> This backlog slice. Proof: double-resolve guard is in scope.
- request-AC4 -> This backlog slice. Proof: conflict responses are in scope.
- request-AC5 -> This backlog slice. Proof: web disabled/error state is in scope.
- request-AC6 -> This backlog slice. Proof: tests are in scope.
- request-AC7 -> This backlog slice. Proof: real DB smoke is in scope.
- request-AC8 -> This backlog slice. Proof: validation is in scope.
- request-AC9 -> This backlog slice. Proof: new product features are out of scope.

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
- Request: `req_019_harden_current_grand_prix_state_rules`
- Primary task(s): `task_020_harden_current_grand_prix_state_rules`

# AI Context
- Summary: Harden current Grand Prix state rules
- Keywords: backlog-groom, request, harden current grand prix state rules, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Harden current Grand Prix state rules.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: State guards prevent duplicate rewards and invalid race resolution.

# Notes
- Hybrid rationale: Derived from request `req_019_harden_current_grand_prix_state_rules` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_019_harden_current_grand_prix_state_rules.md`.
- Generated locally by logics-manager.
- Task `task_020_harden_current_grand_prix_state_rules` was finished via `logics-manager flow finish task` on 2026-07-14.

# Tasks
- `task_020_harden_current_grand_prix_state_rules`
