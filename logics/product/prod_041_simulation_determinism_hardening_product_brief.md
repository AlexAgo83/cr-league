## prod_041_simulation_determinism_hardening_product_brief - Simulation Determinism Hardening Product Brief
> Date: 2026-07-21
> Status: Settled
> Related request: `req_077_make_qualifying_lap_times_deterministic_from_seed`
> Related backlog: `item_175_seed_qualifying_lap_time_variance_and_timestamp_deterministically`
> Related task: `task_078_orchestrate_deterministic_qualifying`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.
> Non-semantic edit: 2026-07-21 added overview diagram for audit hygiene.

# Overview
Bring the qualifying/chrono path in line with the deterministic, seeded race simulation so the whole competitive loop is reproducible from stored state, honoring ADR-004 and restoring the chrono-driven learning loop.

```mermaid
flowchart LR
  StoredState[Stored state] --> SeededQualifying[Seeded qualifying]
  SeededQualifying --> ReproducibleGrid[Reproducible grid]
  ReproducibleGrid --> SeededRace[Seeded race]
```

# Goals
- Guarantee reproducible qualifying results from a seed, matching the race engine's determinism.
- Restore a reliable cause-and-effect learning loop where a chrono isolates the effect of a setup change.
- Honor the ADR-004 determinism contract across the full plan/chrono/race path.
- Ship the smallest safe fix without altering balance, API, or persistence.

# Non-goals
- Do not redesign qualifying scoring, tyre or warmup modeling, or grid derivation.
- Do not change gameplay balance, card effects, or reward/points values.
- Do not change any API contract, request shape, or persisted result shape.
- Do not add a random-number, date, or other dependency; reuse the existing shared PRNG.

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `req_077_make_qualifying_lap_times_deterministic_from_seed`
- Task back-reference: `task_078_orchestrate_deterministic_qualifying`
