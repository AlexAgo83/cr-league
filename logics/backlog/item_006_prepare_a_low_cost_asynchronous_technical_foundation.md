## item_006_prepare_a_low_cost_asynchronous_technical_foundation - Prepare a low-cost asynchronous technical foundation
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Technical architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The game should not require an expensive always-on backend for the first playable version.
- The architecture must still support persistent leagues, scheduled races, invite codes, bot participants, and reproducible race results.

# Scope
- In:
  - Define a web app architecture with persistent storage and a minimal backend.
  - Use lazy race resolution for scheduled multiplayer races.
  - Allow solo races to bypass waiting and resolve immediately.
  - Persist race inputs, seed, event timeline, final result, replay data, rewards, and standings.
  - Keep future deployment compatible with low-cost hosts where services may sleep.
- Out:
  - Always-on job worker requirement for V1.
  - Hard real-time multiplayer infrastructure.
  - Complex microservice architecture.
  - Premature scaling for public launch traffic.

# Acceptance criteria
- AC1: A due race can be resolved idempotently on first league access after its scheduled time.
- AC2: Race resolution stores enough data to replay and explain the result later.
- AC3: Solo and multiplayer use the same simulation engine.
- AC4: The architecture does not require a constantly running scheduler for MVP correctness.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: A due race can be resolved idempotently on first league access after its scheduled time.
- request-AC6 -> This backlog slice. Proof: AC2: Race resolution stores enough data to replay and explain the result later.
- request-AC7 -> This backlog slice. Proof: AC3: Solo and multiplayer use the same simulation engine.
- request-AC4 -> This backlog slice. Evidence needed: The brief defines cards as simple, mostly consumable special moves with clear race-story impact and a one-card-per-Grand-Prix V1 assumption.
- request-AC5 -> This backlog slice. Evidence needed: The brief captures the balancing philosophy: trailing players receive comeback options and additional goals without being granted automatic victories.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_define_the_asynchronous_racing_league_game_product_brief`
- Primary task(s): `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery`

# AI Context
- Summary: Prepare a low-cost asynchronous technical foundation
- Keywords: scaffolded-backlog, prepare a low-cost asynchronous technical foundation, implementation-ready
- Use when: Implementing the scaffolded slice for Prepare a low-cost asynchronous technical foundation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_001_orchestrate_cr_league_product_brief_and_mvp_discovery` was finished via `logics-manager flow finish task` on 2026-07-13.
