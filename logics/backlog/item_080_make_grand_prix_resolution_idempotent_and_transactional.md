## item_080_make_grand_prix_resolution_idempotent_and_transactional - Make Grand Prix resolution idempotent and transactional
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Race integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- resolveCurrentGrandPrix checks grandPrix.status before writing, then applies rewards and card consumption in separate updates.
- Two concurrent resolve requests can both observe briefing status and both apply the same race rewards.

# Scope
- In:
  - Wrap resolution in a Prisma transaction or equivalent DB-level consistency boundary.
  - Claim the Grand Prix with an updateMany or conditional update that only succeeds when status is not resolved.
  - Apply result persistence, points, credits, and consumed card removal exactly once after the claim succeeds.
  - Return a conflict or reload the resolved state for a losing concurrent resolver; choose the smaller behavior that fits current route semantics and tests.
  - Add a focused regression test that simulates two resolve calls and proves rewards are not duplicated.
- Out:
  - Changing simulation determinism or result classification.
  - Introducing queues, locks, or background jobs.
  - Reworking the season advancement flow unless a direct race with resolution is discovered.

# Acceptance criteria
- AC1: Two concurrent resolves for one Grand Prix produce one set of rewards and one consumed-card removal.
- AC2: Already resolved Grand Prix still returns a conflict in the normal single-request path unless the chosen idempotent behavior is deliberately documented in tests.
- AC3: The transaction does not leave a Grand Prix marked resolved without matching team reward updates.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Two concurrent resolves for one Grand Prix produce one set of rewards and one consumed-card removal.
- request-AC8 -> This backlog slice. Proof: AC2: Already resolved Grand Prix still returns a conflict in the normal single-request path unless the chosen idempotent behavior is deliberately documented in tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Primary task(s): `task_042_orchestrate_api_integrity_hardening`

# AI Context
- Summary: Make Grand Prix resolution idempotent and transactional
- Keywords: scaffolded-backlog, make grand prix resolution idempotent and transactional, implementation-ready
- Use when: Implementing the scaffolded slice for Make Grand Prix resolution idempotent and transactional.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
