## item_020_add_cr_league_simulation_preview_api_and_screen - Add CR League simulation preview API and screen
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Implementation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The simulation core is not yet usable from the running app.
- A lightweight API/web preview lets us test the feel of race output before adding DB-backed league execution.

# Scope
- In:
  - API preview endpoint.
  - shared demo race fixture.
  - web preview screen.
  - focused API and web tests.
- Out:
  - database persistence.
  - authentication.
  - league scheduling.
  - multiplayer state.
  - replay animation.

# Acceptance criteria
- AC1: API preview endpoint is available from the running Fastify app.
- AC2: Web preview renders the demo result and can rerun it.
- AC3: Invalid API input is handled as a client error.
- AC4: Validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: API endpoint is in scope.
- request-AC2 -> This backlog slice. Proof: shared demo race fixture is in scope.
- request-AC3 -> This backlog slice. Proof: invalid input handling is in scope.
- request-AC4 -> This backlog slice. Proof: web preview screen is in scope.
- request-AC5 -> This backlog slice. Proof: API and web tests are in scope.
- request-AC6 -> This backlog slice. Proof: validation is in scope.
- request-AC7 -> This backlog slice. Proof: DB/auth/scheduling/multiplayer persistence are out of scope.

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
- Request: `req_014_add_cr_league_simulation_preview_api_and_screen`
- Primary task(s): `task_015_add_cr_league_simulation_preview_api_and_screen`

# AI Context
- Summary: Add CR League simulation preview API and screen
- Keywords: backlog-groom, request, add cr league simulation preview api and screen, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Add CR League simulation preview API and screen.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: This is the first app-level proof that the simulation can be consumed by players.

# Notes
- Hybrid rationale: Derived from request `req_014_add_cr_league_simulation_preview_api_and_screen` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_014_add_cr_league_simulation_preview_api_and_screen.md`.
- Generated locally by logics-manager.
- Task `task_015_add_cr_league_simulation_preview_api_and_screen` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_015_add_cr_league_simulation_preview_api_and_screen`
