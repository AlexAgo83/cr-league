## item_239_rate_limit_unauthenticated_writes_and_bound_admin_reads - Rate-limit unauthenticated writes and bound admin reads
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: API scale and abuse
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- No rate limiting on unauthenticated write routes: POST /leagues creates a league + team + GP + N bots, plus joins/decisions; only recovery has a limiter, so a script can exhaust the DB.
- Admin list endpoints (admin/store.ts:15 profiles, :106 leagues) findMany whole tables then filter/paginate in JS; q/page/limit do no DB-level narrowing.

# Scope
- In:
  - Register @fastify/rate-limit (in-memory) and apply an IP-based limit to the unauthenticated write routes.
  - Push the q filter into a Prisma where and page/limit into skip/take on both admin findMany calls, keeping the response shape identical.
- Out:
  - A distributed/Redis rate-limit store.
  - Rate-limiting read routes or double-limiting recovery.
  - Changing the admin response schema.

# Acceptance criteria
- AC1: Unauthenticated write routes are IP rate-limited.
- AC2: Admin profile/league lists filter and paginate at the database level.
- AC3: Admin responses are unchanged in shape and existing admin tests pass.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Unauthenticated write routes are IP rate-limited.
- request-AC8 -> This backlog slice. Proof: AC2: Admin profile/league lists filter and paginate at the database level.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Primary task(s): `task_100_orchestrate_review_findings_remediation`

# AI Context
- Summary: Rate-limit unauthenticated writes and bound admin reads
- Keywords: scaffolded-backlog, rate-limit unauthenticated writes and bound admin reads, implementation-ready
- Use when: Implementing the scaffolded slice for Rate-limit unauthenticated writes and bound admin reads.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Abuse and scale guardrails are needed for invited beta use, but they are bounded infrastructure changes.
