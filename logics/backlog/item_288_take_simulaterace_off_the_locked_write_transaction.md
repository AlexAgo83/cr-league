## item_288_take_simulaterace_off_the_locked_write_transaction - Take simulateRace off the locked write transaction
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
- resolveCurrentGrandPrix runs the synchronous simulateRace inside runWrite while holding lockGrandPrixRow.
- It blocks the single-node event loop for the simulation duration and holds the row lock plus a pooled connection.
- The current design re-reads state under the lock for consistency, which is why moving the sim out needs care.

# Scope
- In:
  - Compute participants/circuit and run simulateRace before opening runWrite (or on a worker thread), from a consistent snapshot.
  - Inside the transaction, keep only the optimistic status claim (updateMany where status:"briefing") and the result/point/credit/card writes.
  - Extend the resolution tests to prove a concurrent/duplicate resolve is still rejected and results are byte-identical.
- Out:
  - Changing simulation numerics, seed, or classification.
  - Weakening the double-resolve protection or lock semantics.

# Acceptance criteria
- AC1: simulateRace no longer runs while holding the grand-prix row lock.
- AC2: Race-integrity guarantees and simulation outputs are preserved verbatim.
- AC3: Resolution tests, balance:gate, typecheck, and lint stay green.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: simulateRace no longer runs while holding the grand-prix row lock.
- request-AC3 -> This backlog slice. Proof: AC2: Race-integrity guarantees and simulation outputs are preserved verbatim.
- request-AC4 -> This backlog slice. Proof: AC3: Resolution tests, balance:gate, typecheck, and lint stay green.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_069_performance_pass_deferred_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_117_performance_pass_deferred_follow_up`
- Primary task(s): `task_118_orchestrate_the_deferred_performance_follow_up`

# AI Context
- Summary: Take simulateRace off the locked write transaction
- Keywords: scaffolded-backlog, take simulaterace off the locked write transaction, implementation-ready
- Use when: Implementing the scaffolded slice for Take simulateRace off the locked write transaction.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
