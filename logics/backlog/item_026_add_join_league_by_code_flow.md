## item_026_add_join_league_by_code_flow - Add join league by code flow
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 88%
> Progress: 100%
> Complexity: High
> Theme: Multiplayer onboarding
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A creator can see a league code, but another player cannot yet use it. That blocks the first concrete multiplayer loop.
- The prototype must support joining without accounts or a costly always-on orchestration layer.

# Scope
- In:
  - `POST /leagues/join` endpoint.
  - code normalization and not-found/conflict responses.
  - duplicate team-name guard within a league.
  - current-GP closed-state guard after resolution.
  - web form control for invite code and join action.
  - API/web tests and PostgreSQL smoke script updates.
- Out:
  - authentication, ownership, and permissions.
  - lobby ready states, chat, or participant caps.
  - invitation expiry and invite management.
  - multi-round scheduling or creating the next GP.
  - distinct mobile UX for join onboarding.

# Acceptance criteria
- AC1: Join by code succeeds for an active league.
- AC2: Lowercase or mixed-case invite code input works.
- AC3: Unknown codes return 404.
- AC4: Duplicate team names return 409.
- AC5: Resolved current GP blocks late joins with 409.
- AC6: The race simulation accepts the joined roster.
- AC7: Web exposes create and join actions in the existing race desk.
- AC8: Tests, build, lint, i18n, Logics validation, and real DB smoke pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: endpoint is in scope.
- request-AC2 -> This backlog slice. Proof: code normalization is in scope.
- request-AC3 -> This backlog slice. Proof: unknown-code 404 is in scope.
- request-AC4 -> This backlog slice. Proof: duplicate-name 409 is in scope.
- request-AC5 -> This backlog slice. Proof: closed-GP 409 is in scope.
- request-AC6 -> This backlog slice. Proof: simulation after join is in scope.
- request-AC7 -> This backlog slice. Proof: web join control is in scope.
- request-AC8 -> This backlog slice. Proof: API/web/smoke validation is in scope.
- request-AC9 -> This backlog slice. Proof: i18n and validation are in scope.

# Decision framing
- Product framing: Not needed
- Product signals: This implements an already-discussed product primitive: simple colleague invite by short code.
- Product follow-up: Future UX can split create/join into separate mobile-first screens after the prototype needs it.
- Architecture framing: Not needed
- Architecture signals: This keeps the existing Fastify/Prisma/React architecture and does not introduce auth or realtime infrastructure.
- Architecture follow-up: Auth/ownership and lobby lifecycle should get ADR coverage before production multiplayer.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_020_add_join_league_by_code_flow`
- Primary task(s): `task_021_add_join_league_by_code_flow`

# AI Context
- Summary: Implement the minimal league join-by-code slice.
- Keywords: backlog-groom, league-code, join-flow, multiplayer-onboarding, persisted-league
- Use when: Implementing or reviewing invite-code joining.
- Skip when: The work is about auth, lobby management, season cadence, or race rules unrelated to joining.

# Priority
- Priority: High
- Rationale: This is the smallest visible multiplayer step and validates the invite-code product promise.

# Notes
- Hybrid rationale: Derived from request `req_020_add_join_league_by_code_flow` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_020_add_join_league_by_code_flow.md`.
- Task `task_021_add_join_league_by_code_flow` completed implementation and validation on 2026-07-14.

# Tasks
- `task_021_add_join_league_by_code_flow`
