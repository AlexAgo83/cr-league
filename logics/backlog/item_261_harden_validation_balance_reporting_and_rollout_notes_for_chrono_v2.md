## item_261_harden_validation_balance_reporting_and_rollout_notes_for_chrono_v2 - Harden validation, balance reporting, and rollout notes for chrono v2
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Validation and rollout
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A captured time-distance trace changes simulation behavior and can silently alter balance or replay assumptions.
- The work needs clear validation gates and closeout evidence before another agent treats it as complete.

# Scope
- In:
  - Strengthen validateReplayTrace for sampled chrono-state failures: final-time coherence, gap coherence, acceleration/deceleration bounds, pit phase ordering, overtake phase proximity, and no backwards progress.
  - Keep or extend balance-simulations chrono metrics: duration, gap spread, favorite win rate, upset rate, card impact, pit strategy summary, and circuit differences.
  - Document changed behavior, accepted review bands, and follow-up tuning risks in the task closeout.
  - Run typecheck, tests, build, lint, e2e, bounded balance simulation, and Logics validation before finish.
  - Confirm git diff stays limited to shared simulation, tests, directly necessary replay helpers, balance script, and Logics docs.
- Out:
  - Production release creation.
  - Analytics infrastructure or long-running statistical jobs.
  - Unrelated UI/API/storage/circuit catalogue refactors.

# Acceptance criteria
- AC1: validateReplayTrace catches chrono v2 coherence failures with targeted tests.
- AC2: Balance output includes the chrono metrics needed to review card, pit, weather, circuit, favorite, and upset distributions.
- AC3: Full validation passes and the closeout records behavior changes plus known tuning risks.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: validateReplayTrace catches chrono v2 coherence failures with targeted tests.
- request-AC5 -> This backlog slice. Proof: AC2: Balance output includes the chrono metrics needed to review card, pit, weather, circuit, favorite, and upset distributions.
- request-AC6 -> This backlog slice. Proof: AC3: Full validation passes and the closeout records behavior changes plus known tuning risks.
- request-AC7 -> This backlog slice. Proof: AC3: Full validation passes and the closeout records behavior changes plus known tuning risks.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_066_chrono_engine_v2_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_103_chrono_engine_v2_extract_the_race_engine_module_and_make_replay_trace_a_minimal_time_distance_simulation`
- Primary task(s): `task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture`

# AI Context
- Summary: Harden validation, balance reporting, and rollout notes for chrono v2
- Keywords: scaffolded-backlog, harden validation, balance reporting, and rollout notes for chrono v2, implementation-ready
- Use when: Implementing the scaffolded slice for Harden validation, balance reporting, and rollout notes for chrono v2.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_104_orchestrate_chrono_engine_v2_module_extraction_and_trace_capture` was finished via `logics-manager flow finish task` on 2026-07-23.
