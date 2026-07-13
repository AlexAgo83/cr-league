## item_021_add_minimal_league_persistence_api - Add minimal league persistence API
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
- CR League needs persisted league state before the web UI can support a real gameplay loop.
- This slice introduces the smallest DB/API surface needed to create a demo league, submit a decision, and resolve a Grand Prix.

# Scope
- In:
  - Prisma models for league state.
  - API Prisma client wiring.
  - demo league creation endpoint.
  - league state read endpoint.
  - race decision upsert endpoint.
  - current Grand Prix resolve endpoint.
  - focused API tests with a fake DB.
- Out:
  - frontend gameplay flow.
  - auth/session identity.
  - invite code join flow.
  - inventory persistence.
  - scheduling.
  - production migration execution.

# Acceptance criteria
- AC1: Minimal Prisma schema exists.
- AC2: League API endpoints are registered when a DB dependency is provided.
- AC3: API tests cover create/read/decision/resolve flow.
- AC4: Validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Prisma schema is in scope.
- request-AC2 -> This backlog slice. Proof: API DB wiring is in scope.
- request-AC3 -> This backlog slice. Proof: demo league creation is in scope.
- request-AC4 -> This backlog slice. Proof: league state read is in scope.
- request-AC5 -> This backlog slice. Proof: race decision upsert is in scope.
- request-AC6 -> This backlog slice. Proof: Grand Prix resolve is in scope.
- request-AC7 -> This backlog slice. Proof: API tests are in scope.
- request-AC8 -> This backlog slice. Proof: validation is in scope.
- request-AC9 -> This backlog slice. Proof: frontend/auth/invite/inventory/scheduling are out of scope.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required.
- Architecture signals: Persistence boundary and backend route registration.
- Architecture follow-up: Existing ADRs already choose PostgreSQL/Prisma and feature-oriented API organization.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_015_add_minimal_league_persistence_api`
- Primary task(s): `task_016_add_minimal_league_persistence_api`

# AI Context
- Summary: Add minimal league persistence API
- Keywords: backlog-groom, request, add minimal league persistence api, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Add minimal league persistence API.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: Persistent league state is required before the first playable frontend loop.

# Notes
- Hybrid rationale: Derived from request `req_015_add_minimal_league_persistence_api` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_015_add_minimal_league_persistence_api.md`.
- Generated locally by logics-manager.
- Task `task_016_add_minimal_league_persistence_api` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_016_add_minimal_league_persistence_api`
