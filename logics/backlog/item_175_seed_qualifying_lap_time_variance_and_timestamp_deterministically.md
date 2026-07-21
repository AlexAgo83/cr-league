## item_175_seed_qualifying_lap_time_variance_and_timestamp_deterministically - Seed qualifying lap-time variance and timestamp deterministically
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Simulation determinism and beta-readiness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- createQualifyingRuns uses Math.random() for per-lap variance (qualifying.ts:62) so identical setups yield different chrono times each call.
- createdAt is stamped with new Date() (qualifying.ts:66), making run records non-reproducible.
- The available input.seed is never used to drive variance even though the race simulation is fully seeded, breaking the chrono learning loop and the ADR-004 determinism contract.

# Scope
- In:
  - Replace the Math.random() variance in createQualifyingRuns with a seeded PRNG draw using createPrng, keyed on seed plus teamId plus lap index.
  - Replace the new Date() createdAt with a deterministic value derived from state.
  - Preserve the current variance magnitude band so grid spread stays comparable.
  - Add a unit test proving determinism for identical inputs and difference across teams/attempts.
- Out:
  - Any change to qualifying scoring, tyre/warmup deltas, or grid ordering rules.
  - Any change to gameplay balance, cards, rewards, or the race simulation.
  - Any API contract, request shape, or persisted QualifyingRun shape change.

# Acceptance criteria
- AC1: No Math.random() or new Date()/Date.now() remains on the qualifying path; variance and timestamp are both derived deterministically.
- AC2: Identical inputs to createQualifyingRuns produce byte-identical output across repeated calls.
- AC3: Different teams and attempts still produce different lap times; variance magnitude stays comparable to the previous band.
- AC4: A unit test covers both the determinism and the difference-across-teams cases and passes.
- AC5: Typecheck, test, build, lint, and logics:validate pass with no weakened assertions.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: No Math.random() or new Date()/Date.now() remains on the qualifying path; variance and timestamp are both derived deterministically.
- request-AC2 -> This backlog slice. Proof: AC2: Identical inputs to createQualifyingRuns produce byte-identical output across repeated calls.
- request-AC3 -> This backlog slice. Proof: AC3: Different teams and attempts still produce different lap times; variance magnitude stays comparable to the previous band.
- request-AC4 -> This backlog slice. Proof: AC4: A unit test covers both the determinism and the difference-across-teams cases and passes.
- request-AC5 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass with no weakened assertions.
- request-AC6 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass with no weakened assertions.
- request-AC7 -> This backlog slice. Proof: AC5: Typecheck, test, build, lint, and logics:validate pass with no weakened assertions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_041_simulation_determinism_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_077_make_qualifying_lap_times_deterministic_from_seed`
- Primary task(s): `task_078_orchestrate_deterministic_qualifying`

# AI Context
- Summary: Seed qualifying lap-time variance and timestamp deterministically
- Keywords: scaffolded-backlog, seed qualifying lap-time variance and timestamp deterministically, implementation-ready
- Use when: Implementing the scaffolded slice for Seed qualifying lap-time variance and timestamp deterministically.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_078_orchestrate_deterministic_qualifying` was finished via `logics-manager flow finish task` on 2026-07-21.
