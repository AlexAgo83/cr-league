## item_277_extract_shared_body_guard_preamble_in_leagues_routes_into_asrecord - Extract shared body-guard preamble in leagues routes into asRecord
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Backend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The `isXxxBody` type guards in apps/api/src/features/leagues/routes.ts repeat the same two-line preamble (`if (!value || typeof value !== "object") return false;` then `const candidate = value as Record<string, unknown>;`) in 14 places.
- Each copy is identical; the only per-guard variation is which fields are then checked on `candidate`.
- The duplication adds noise and means any change to the object-shape check is a 14-site edit.

# Scope
- In:
  - Add one small helper (e.g. `asRecord(value): Record<string, unknown> | null`) that returns the narrowed record or null for non-objects.
  - Rewrite each `isXxxBody` guard to start from `const candidate = asRecord(value); if (!candidate) return false;` and keep its existing field checks verbatim.
  - Keep every guard's return type predicate and accepted/rejected inputs identical.
- Out:
  - Changing which fields any guard validates or the messages routes return on failure.
  - Touching admin, health, or simulation route guards.
  - Adding a validation library or any dependency.

# Acceptance criteria
- AC1: A single shared helper replaces the duplicated object-preamble in all 14 leagues route guards, which each keep their exact field checks and type predicates.
- AC2: No behavior change — the same request bodies are accepted and rejected as today, proven by the existing app.test.ts suite.
- AC3: Typecheck, lint, and the full unit suite pass with no weakened assertions.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: A single shared helper replaces the duplicated object-preamble in all 14 leagues route guards.
- request-AC5 -> This backlog slice. Proof: AC3: Typecheck, lint, and the full unit suite pass with no weakened assertions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_115_repo_review_maintainability_follow_up`
- Primary task(s): `task_116_orchestrate_repo_review_maintainability_follow_up`

# AI Context
- Summary: Extract shared body-guard preamble in leagues routes into asRecord
- Keywords: scaffolded-backlog, deduplicate route guards, asRecord helper, implementation-ready
- Use when: Implementing the shared body-guard helper for the leagues routes.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Small, safe dedup; complements item_273.
