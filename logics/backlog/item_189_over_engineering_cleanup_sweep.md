## item_189_over_engineering_cleanup_sweep - Over-engineering cleanup sweep
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Over-engineering cleanup
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- lapDisplay.ts:5-7 is a verbatim copy of the unexported lapForProgress (simulateRace.ts:1064-1066).
- DriveView.tsx:468-476 has a dead ternary whose two branches render an identical button.
- qualifying.ts:22-30 hand-rolls an FNV-1a hash to fabricate a createdAt nothing depends on temporally.
- utils.ts:98-102 ensureProfileExists is exported but never called.
- App.tsx tt is a fresh closure every render (App.tsx:61,111), threaded through the tree and defeating downstream memoization.
- createDistanceReplayTracePoint computes order via orderFromCars for interior points (simulateRace.ts:300) that stabilizeReplayTraceOrders immediately overwrites.

# Scope
- In:
  - Export lapForProgress from simulateRace and delete the lapDisplay.ts copy, updating imports.
  - Collapse the identical-branch ternary in DriveView.tsx:468-476 to a single button.
  - Delete deterministicCreatedAt and use a fixed epoch constant, or drop createdAt from qualifying runs if nothing orders by it.
  - Delete the unused ensureProfileExists export.
  - Wrap tt in useMemo/useCallback keyed on locale in App.tsx.
  - Skip the orderFromCars call for interior trace points since stabilizeReplayTraceOrders overwrites them.
- Out:
  - Any behavioral change to lap display, qualifying results, or replay ordering.
  - Broader App.tsx decomposition (covered by pass 5).
  - Performance work beyond the tt memoization.

# Acceptance criteria
- AC1: The duplicated lap helper, dead ternary, FNV-1a timestamp, and unused export are gone and the tree still typechecks.
- AC2: tt is memoized and replay order is computed once per interior point.
- AC3: All existing unit, integration, and e2e tests pass with no behavioral change.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: The duplicated lap helper, dead ternary, FNV-1a timestamp, and unused export are gone and the tree still typechecks.
- request-AC6 -> This backlog slice. Proof: AC2: tt is memoized and replay order is computed once per interior point.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_049_repo_review_remediation_pass_6_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`
- Primary task(s): `task_086_orchestrate_repo_review_remediation_pass_6`

# AI Context
- Summary: Over-engineering cleanup sweep
- Keywords: scaffolded-backlog, over-engineering cleanup sweep, implementation-ready
- Use when: Implementing the scaffolded slice for Over-engineering cleanup sweep.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
