## item_049_consolidate_duplicated_helpers_and_degenerate_constants - Consolidate duplicated helpers and degenerate constants
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90
> Confidence: 85
> Progress: 0%
> Complexity: Low
> Theme: Deduplication
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- CARD_PRICES maps 15 card ids to the identical value 115, hiding the fact that there is one price.
- clampTrait is defined verbatim in both the API store and the shared simulation.
- traitLabel and weatherLabel have identical bodies.
- The shared barrel exports createPrng, Prng, and InternalScores which no consumer outside the package imports.

# Scope
- In:
  - Replace CARD_PRICES with a single exported CARD_PRICE constant and update all consumers.
  - Export clampTrait once from the shared package and import it in the API store.
  - Collapse traitLabel/weatherLabel into one label helper.
  - Remove createPrng, Prng, and InternalScores from the public surface; move InternalScores local to simulateRace.ts.
  - Merge the two type-only prisma imports in store.ts into one.
- Out:
  - Introducing per-card pricing logic or economy changes.
  - Renaming anything consumers already import for other reasons.

# Acceptance criteria
- AC1: One price constant exists and purchase behavior is unchanged (existing tests prove it).
- AC2: clampTrait has exactly one definition in the repo.
- AC3: The shared barrel exports only symbols imported by at least one consumer.
- AC4: Typecheck, unit tests, and build pass.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: One price constant exists and purchase behavior is unchanged (existing tests prove it).
- request-AC4 -> This backlog slice. Proof: AC2: clampTrait has exactly one definition in the repo.
- request-AC5 -> This backlog slice. Proof: AC3: The shared barrel exports only symbols imported by at least one consumer.
- request-AC9 -> This backlog slice. Proof: AC4: Typecheck, unit tests, and build pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_033_over_engineering_cleanup_pass_1`
- Primary task(s): `task_034_orchestrate_over_engineering_cleanup_pass_1`

# AI Context
- Summary: Consolidate duplicated helpers and degenerate constants
- Keywords: scaffolded-backlog, consolidate duplicated helpers and degenerate constants, implementation-ready
- Use when: Implementing the scaffolded slice for Consolidate duplicated helpers and degenerate constants.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_034_orchestrate_over_engineering_cleanup_pass_1`
