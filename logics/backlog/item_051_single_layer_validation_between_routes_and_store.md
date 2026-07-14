## item_051_single_layer_validation_between_routes_and_store - Single-layer validation between routes and store
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Validation consolidation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Ten isXBody route guards check field presence and types, then the store re-validates the same inputs and throws LeagueRuleError, so the same input is validated twice with the guards mostly deciding 400 vs 409.
- Redundant validation drifts: a rule updated in one layer but not the other becomes a latent inconsistency.

# Scope
- In:
  - Keep route guards as the single shape/type trust boundary (presence, primitive types).
  - Keep the store as the single business-rule layer (normalization, bounds, uniqueness, domain invariants).
  - Remove shape re-checks from the store and business rules from guards, route by route, running the API test suite after each route.
  - Preserve the 400 vs 409 status mapping exactly as the tests specify it.
- Out:
  - Adding a validation library or schema framework.
  - Changing any endpoint contract, status code, or error message the tests assert.

# Acceptance criteria
- AC1: No input field is shape-validated in both layers.
- AC2: The full API test suite passes without modifying any test expectation.
- AC3: Trust-boundary validation still rejects malformed bodies with 400 before reaching the store.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: No input field is shape-validated in both layers.
- request-AC9 -> This backlog slice. Proof: AC2: The full API test suite passes without modifying any test expectation.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_004_over_engineering_cleanup_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_033_over_engineering_cleanup_pass_1`
- Primary task(s): `task_034_orchestrate_over_engineering_cleanup_pass_1`

# AI Context
- Summary: Single-layer validation between routes and store
- Keywords: scaffolded-backlog, single-layer validation between routes and store, implementation-ready
- Use when: Implementing the scaffolded slice for Single-layer validation between routes and store.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
