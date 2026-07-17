## item_083_use_crypto_backed_league_and_claim_codes_with_collision_retry - Use crypto-backed league and claim codes with collision retry
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Identifier generation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- createLeagueCode and createClaimCode use Math.random for join/rejoin secrets.
- League.code and Team.claimCode are unique in the schema, but creation does not deliberately retry on rare collisions.

# Scope
- In:
  - Replace Math.random code generation with randomBytes-based base36/hex or another compact uppercase alphabet.
  - Retry league creation on unique League.code collisions a small fixed number of times.
  - Retry team claim-code generation on unique Team.claimCode collisions a small fixed number of times where codes are created.
  - Keep recoveryCode generation as-is unless the implementation can share a tiny helper without adding complexity.
  - Add tests by stubbing or injecting the code generator only if it stays small; otherwise test the pure generator format and document that Prisma unique constraints cover collisions.
- Out:
  - Human-friendly word codes.
  - Long-lived token rotation or claim revocation.
  - Adding dependencies for nanoid/uuid.

# Acceptance criteria
- AC1: No join or claim secret uses Math.random.
- AC2: Generated code formats stay uppercase and compatible with existing UI expectations.
- AC3: Unique-constraint collisions are retried or intentionally surfaced as a 409 after bounded attempts.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: No join or claim secret uses Math.random.
- request-AC8 -> This backlog slice. Proof: AC2: Generated code formats stay uppercase and compatible with existing UI expectations.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Primary task(s): `task_042_orchestrate_api_integrity_hardening`

# AI Context
- Summary: Use crypto-backed league and claim codes with collision retry
- Keywords: scaffolded-backlog, use crypto-backed league and claim codes with collision retry, implementation-ready
- Use when: Implementing the scaffolded slice for Use crypto-backed league and claim codes with collision retry.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
