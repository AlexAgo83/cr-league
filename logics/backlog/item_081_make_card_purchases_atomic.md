## item_081_make_card_purchases_atomic - Make card purchases atomic
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Economy integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- buyCard performs read-check-write on credits and cards outside a transaction.
- Concurrent purchases can spend the same credits twice or overwrite one JSON card append with a stale cards array.

# Scope
- In:
  - Move buyCard into a transaction or conditional update that verifies credits are sufficient at write time.
  - Ensure card append uses the latest persisted card list inside the same consistency boundary.
  - Return the existing not-enough-credits LeagueRuleError when the conditional update loses due to insufficient balance.
  - Add a regression test for two concurrent purchases when only one purchase should be affordable.
  - Keep CARD_PRICE and existing inventory JSON unless a minimal table change is strictly required for correctness.
- Out:
  - Per-card pricing changes.
  - Inventory normalization for reporting or history.
  - Purchase receipts or audit logs.

# Acceptance criteria
- AC1: The balance can never go below zero through buyCard.
- AC2: Two affordable concurrent purchases both persist their cards or one fails cleanly if only one is affordable; no stale overwrite loses a card.
- AC3: Existing buy-card behavior and error messages remain stable for normal requests.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The balance can never go below zero through buyCard.
- request-AC8 -> This backlog slice. Proof: AC2: Two affordable concurrent purchases both persist their cards or one fails cleanly if only one is affordable; no stale overwrite loses a card.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Primary task(s): `task_042_orchestrate_api_integrity_hardening`

# AI Context
- Summary: Make card purchases atomic
- Keywords: scaffolded-backlog, make card purchases atomic, implementation-ready
- Use when: Implementing the scaffolded slice for Make card purchases atomic.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
