## item_165_add_admin_filters_and_pagination - Add admin filters and pagination
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Admin support
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Admin users and leagues screens will become hard to use as hosted beta data grows.
- Support needs bounded server responses instead of unbounded admin lists.

# Scope
- In:
  - Add server-backed filters and 100-by-100 pagination for admin users and leagues endpoints.
  - Expose compact UI controls in AdminConsoleView.
  - Cover API authorization and web control behavior with tests.
- Out:
  - Full text search service.
  - Infinite scroll.
  - New admin auth model.

# Acceptance criteria
- AC1: Admin screens support filters and 100-by-100 pagination.
- AC3: API tests cover filter/pagination and admin authorization.
- AC4: Web tests cover admin controls.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Admin screens support filters and 100-by-100 pagination.
- request-AC3 -> This backlog slice. Proof: AC3: API tests cover filter/pagination and admin authorization.
- request-AC4 -> This backlog slice. Proof: AC4: Web tests cover admin controls.
- request-AC7 -> This backlog slice. Proof: AC4: Web tests cover admin controls.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_033_beta_support_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_069_beta_support_hardening`
- Primary task(s): `task_070_orchestrate_beta_support_hardening`

# AI Context
- Summary: Add admin filters and pagination
- Keywords: scaffolded-backlog, add admin filters and pagination, implementation-ready
- Use when: Implementing the scaffolded slice for Add admin filters and pagination.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
