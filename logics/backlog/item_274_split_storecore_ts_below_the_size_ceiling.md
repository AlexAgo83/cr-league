## item_274_split_storecore_ts_below_the_size_ceiling - Split storeCore.ts below the size ceiling
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Backend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- storeCore.ts is 1312 lines and still bundles several lifecycles and their private helpers.
- It is the largest hand-written file in the repo and the first to become painful to review or extend.
- Shared transaction/claim helpers are interleaved with unrelated logic.

# Scope
- In:
  - Group top-level functions by lifecycle and move each group into its own module under features/leagues/.
  - Keep the barrel (store.ts/storeCore.ts) re-exporting the existing public symbols so no consumer or test import path changes.
  - Move each function's private helpers alongside the lifecycle that uses them.
  - Run typecheck, lint, and unit tests after the move to prove behavior is unchanged.
- Out:
  - Changing any function logic, signature, transaction boundary, lock, or error message.
  - Modifying consumer or test import paths.
  - Adding dependencies or new abstractions.

# Acceptance criteria
- AC1: No resulting hand-written source file exceeds ~800 lines.
- AC2: The public import surface is unchanged and behavior is preserved verbatim.
- AC3: Typecheck, lint, and the full unit suite pass with no weakened assertions.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: No resulting hand-written source file exceeds ~800 lines.
- request-AC5 -> This backlog slice. Proof: AC2: The public import surface is unchanged and behavior is preserved verbatim.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_115_repo_review_maintainability_follow_up`
- Primary task(s): `task_116_orchestrate_repo_review_maintainability_follow_up`

# AI Context
- Summary: Split storeCore.ts below the size ceiling
- Keywords: scaffolded-backlog, split storecore.ts below the size ceiling, implementation-ready
- Use when: Implementing the scaffolded slice for Split storeCore.ts below the size ceiling.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
