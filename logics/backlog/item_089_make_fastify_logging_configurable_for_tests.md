## item_089_make_fastify_logging_configurable_for_tests - Make Fastify logging configurable for tests
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Test ergonomics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- buildApp always sets Fastify logger to true.
- Injected API tests pass but fill stdout with request logs, hiding useful failures.

# Scope
- In:
  - Add a minimal logger option to ApiConfig or AppDependencies.
  - Keep production/dev logging enabled by default.
  - Set logger false in createTestApp or equivalent test helper.
  - Add or adjust a small test only if needed to lock the default/test behavior.
- Out:
  - Changing log format, log transport, pino config, or adding log dependencies.
  - Suppressing application errors.

# Acceptance criteria
- AC1: npm test no longer emits normal Fastify request logs from app.inject tests.
- AC2: Running the API server normally still enables logging unless explicitly disabled.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: npm test no longer emits normal Fastify request logs from app.inject tests.
- request-AC7 -> This backlog slice. Proof: AC2: Running the API server normally still enables logging unless explicitly disabled.
- request-AC8 -> This backlog slice. Proof: AC2: Running the API server normally still enables logging unless explicitly disabled.
- request-AC4 -> This backlog slice. Evidence needed: /simulation/preview rejects malformed RaceInput values for trait enums, forecast numbers, participant shape, and decision values with 400.
- request-AC5 -> This backlog slice. Evidence needed: Valid demo preview and valid custom preview payloads still return RaceResult unchanged.
- request-AC6 -> This backlog slice. Evidence needed: A short docs note or Logics closeout note states that claimCode/recoveryCode in localStorage are prototype secrets, with the upgrade path to server sessions when the game needs real account security.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_014_api_surface_follow_up_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_043_api_surface_follow_up_hardening`
- Primary task(s): `task_044_orchestrate_api_surface_follow_up_hardening`

# AI Context
- Summary: Make Fastify logging configurable for tests
- Keywords: scaffolded-backlog, make fastify logging configurable for tests, implementation-ready
- Use when: Implementing the scaffolded slice for Make Fastify logging configurable for tests.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_044_orchestrate_api_surface_follow_up_hardening`

# Notes
- Task `task_044_orchestrate_api_surface_follow_up_hardening` was finished via `logics-manager flow finish task` on 2026-07-18.
