## item_027_build_private_league_prototype_foundation - Build private league prototype foundation
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 86%
> Progress: 100%
> Complexity: High
> Theme: Private league prototype
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The prototype proves one GP and invite-code joining, but it cannot yet behave like a private async league.
- Players need to come back to their team, absent players need defaults, and a resolved GP needs to advance to another GP.

# Scope
- In:
  - team claim token persistence;
  - rejoin API;
  - next Grand Prix API;
  - optional defaulted GP resolution;
  - action state for submitted/missing teams;
  - web local claim storage and automatic rejoin;
  - basic ready/missing and next-GP UI;
  - Prisma migration and seed updates;
  - tests and smoke coverage.
- Out:
  - full account/authentication system;
  - permissions, league ownership, or admin roles;
  - scheduled background workers;
  - notifications;
  - rich lobby UX;
  - card inventory/economy progression;
  - production deployment hardening.

# Acceptance criteria
- AC1: Created/joined teams receive claim codes.
- AC2: Valid claims can rejoin league state.
- AC3: Invalid claims are rejected.
- AC4: Resolved GP can advance to next GP.
- AC5: Unresolved GP cannot advance.
- AC6: Resolve can run with defaults when explicitly allowed.
- AC7: League state exposes submitted/missing team counts.
- AC8: Web persists player claim and offers next-GP control.
- AC9: Migration/seed/tests/smoke/validation pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: claim token persistence is in scope.
- request-AC2 -> This backlog slice. Proof: rejoin API is in scope.
- request-AC3 -> This backlog slice. Proof: next-GP API is in scope.
- request-AC4 -> This backlog slice. Proof: unresolved-GP guard is in scope.
- request-AC5 -> This backlog slice. Proof: defaulted resolution is in scope.
- request-AC6 -> This backlog slice. Proof: action state is in scope.
- request-AC7 -> This backlog slice. Proof: web local claim and next-GP UI are in scope.
- request-AC8 -> This backlog slice. Proof: Prisma migration and seed are in scope.
- request-AC9 -> This backlog slice. Proof: validation is in scope.

# Decision framing
- Product framing: Needed
- Product signals: Roadmap `0.2` needs the smallest private-league prototype mechanics before deeper economy.
- Product follow-up: A later slice should add league schedule/deadline settings and better participant status.
- Architecture framing: Not needed
- Architecture signals: Existing Fastify/Prisma/React architecture remains sufficient.
- Architecture follow-up: Full auth and permissioning should get ADR coverage before public or shared production use.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_001_cr_league_v1_static_pwa_api_architecture`
- Request: `req_021_build_private_league_prototype_foundation`
- Primary task(s): `task_022_build_private_league_prototype_foundation`

# AI Context
- Summary: Minimal 0.2 private league mechanics: rejoin, defaults, next GP, and action state.
- Keywords: backlog-groom, private-league, rejoin, claim-code, next-grand-prix, defaults
- Use when: Implementing or reviewing the first private league prototype foundation.
- Skip when: The work is about full auth, notifications, production ops, or card economy depth.

# Priority
- Priority: High
- Rationale: This is the next milestone after the playable vertical slice and unlocks repeated async sessions.

# Notes
- Hybrid rationale: Derived from request `req_021_build_private_league_prototype_foundation` and kept bounded to the smallest useful `0.2` mechanics.
- Source file: `logics/request/req_021_build_private_league_prototype_foundation.md`.
- Task `task_022_build_private_league_prototype_foundation` completed implementation and validation on 2026-07-14.

# Tasks
- `task_022_build_private_league_prototype_foundation`
