## item_028_add_private_league_cadence_and_dashboard - Add private league cadence and dashboard
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
- The private league mechanics exist, but the session state is too implicit for a colleague playtest.
- Players need to see cadence, readiness, next action, their claimed team, and past rounds without inferring from raw controls.

# Scope
- In:
  - league cadence and optional preparation deadline persistence;
  - settings update endpoint;
  - Grand Prix history in state;
  - per-team readiness and next action;
  - dashboard display for the above;
  - local claim reset;
  - tests, smoke, and docs.
- Out:
  - automatic scheduler;
  - notifications;
  - permission/admin roles;
  - advanced league settings;
  - replay visualization polish;
  - card economy.

# Acceptance criteria
- AC1: Cadence/deadline persist and roundtrip through API.
- AC2: Invalid cadence is rejected.
- AC3: History returns previous and current GP.
- AC4: Dashboard shows readiness and next action.
- AC5: Local claim can be forgotten.
- AC6: Tests and smoke cover the behavior.
- AC7: Validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: cadence/deadline persistence is in scope.
- request-AC2 -> This backlog slice. Proof: settings endpoint validation is in scope.
- request-AC3 -> This backlog slice. Proof: history state is in scope.
- request-AC4 -> This backlog slice. Proof: readiness and next action are in scope.
- request-AC5 -> This backlog slice. Proof: dashboard UI is in scope.
- request-AC6 -> This backlog slice. Proof: forget-claim UI is in scope.
- request-AC7 -> This backlog slice. Proof: PostgreSQL smoke update is in scope.
- request-AC8 -> This backlog slice. Proof: validation is in scope.

# Decision framing
- Product framing: Needed
- Product signals: This supports roadmap `0.2` playtest clarity before deeper game economy.
- Product follow-up: Later slices should add richer dashboard layout and real deadline automation if manual operation becomes painful.
- Architecture framing: Not needed
- Architecture signals: Existing Fastify/Prisma/React stack remains sufficient.
- Architecture follow-up: Scheduler/notification design should be separate if needed.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_001_cr_league_v1_static_pwa_api_architecture`
- Request: `req_022_add_private_league_cadence_and_dashboard`
- Primary task(s): `task_023_add_private_league_cadence_and_dashboard`

# AI Context
- Summary: Private league cadence and dashboard slice.
- Keywords: backlog-groom, cadence, deadline, dashboard, readiness, history
- Use when: Implementing or reviewing private league dashboard clarity.
- Skip when: Work is about scheduler workers, notifications, auth, or card economy.

# Priority
- Priority: High
- Rationale: This makes the private league prototype understandable enough for early playtests.

# Notes
- Task `task_023_add_private_league_cadence_and_dashboard` completed implementation and validation on 2026-07-14.

# Tasks
- `task_023_add_private_league_cadence_and_dashboard`
