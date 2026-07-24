## item_286_compute_simulaterace_before_the_write_transaction - Compute simulateRace before the write transaction
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Backend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- resolveCurrentGrandPrix (767-819) takes lockGrandPrixRow (SELECT ... FOR UPDATE), reads full state inside the tx (769), then runs the synchronous simulateRace (777).
- This blocks the single-node event loop for the simulation duration and holds the row lock and a pooled connection for the entire compute.
- It also serializes concurrent resolves on the locked row.

# Scope
- In:
  - Load participants/circuit and run simulateRace before opening runWrite.
  - Inside the transaction, keep only the optimistic status claim (the updateMany where status:"briefing" at 791) and the result/point/credit writes.
  - Preserve the race-integrity re-checks and outputs verbatim; add/extend tests proving a concurrent/duplicate resolve is still rejected and results are identical.
- Out:
  - Changing the simulation numerics, seed, or classification.
  - Removing the optimistic status guard or weakening double-resolve protection.
  - Moving simulateRace to a worker thread (separate follow-up if event-loop blocking remains material).

# Acceptance criteria
- AC1: simulateRace runs before runWrite; the transaction performs only validation and writes.
- AC2: Race-integrity guarantees (single resolve wins, lock semantics) and simulation outputs are preserved verbatim, proven by the resolution tests.
- AC3: Typecheck, lint, the unit suite, and balance:gate stay green.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: simulateRace runs before runWrite; the transaction performs only validation and writes.
- request-AC9 -> This backlog slice. Proof: AC2: Race-integrity guarantees (single resolve wins, lock semantics) and simulation outputs are preserved verbatim, proven by the resolution tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Compute simulateRace before the write transaction
- Keywords: scaffolded-backlog, compute simulaterace before the write transaction, implementation-ready
- Use when: Implementing the scaffolded slice for Compute simulateRace before the write transaction.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
