## item_207_split_leagues_store_into_lifecycle_modules_behind_a_barrel - Split leagues store into lifecycle modules behind a barrel
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Backend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- store.ts concentrates ~10 unrelated lifecycles and their private helpers in one 1197-line file.
- The shared transaction primitives are interleaved with unrelated read and profile logic, making the race-integrity code hard to locate.
- The size makes the file the first one that will become painful to extend or review.

# Scope
- In:
  - Group top-level functions by lifecycle and move each group into its own module under features/leagues/.
  - Extract the shared transaction helpers into a single module imported by the lifecycle modules.
  - Turn store.ts into a barrel that re-exports the existing public symbols.
  - Move each function's private helpers alongside the lifecycle that uses them.
  - Run typecheck, lint, and unit tests after the move to prove behavior is unchanged.
- Out:
  - Changing any function logic, signature, or error message.
  - Modifying routes.ts, admin/store.ts, or test import paths.
  - Adding dependencies or new abstractions.

# Acceptance criteria
- AC1: Each lifecycle group lives in its own module and store.ts only re-exports.
- AC2: Shared transaction helpers exist in exactly one module with no duplication.
- AC3: No consumer or test import path changes.
- AC4: Typecheck, lint, and the full unit suite pass with no weakened assertions.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Each lifecycle group lives in its own module and store.ts only re-exports.
- request-AC2 -> This backlog slice. Proof: AC2: Shared transaction helpers exist in exactly one module with no duplication.
- request-AC3 -> This backlog slice. Proof: AC3: No consumer or test import path changes.
- request-AC4 -> This backlog slice. Proof: AC4: Typecheck, lint, and the full unit suite pass with no weakened assertions.
- request-AC5 -> This backlog slice. Proof: AC4: Typecheck, lint, and the full unit suite pass with no weakened assertions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_055_leagues_store_modularization_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_091_modularize_the_oversized_leagues_store`
- Primary task(s): `task_092_orchestrate_leagues_store_modularization`

# AI Context
- Summary: Split leagues store into lifecycle modules behind a barrel
- Keywords: scaffolded-backlog, split leagues store into lifecycle modules behind a barrel, implementation-ready
- Use when: Implementing the scaffolded slice for Split leagues store into lifecycle modules behind a barrel.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Important maintainability work, but behavior-neutral and lower risk than active correctness/security remediation.
