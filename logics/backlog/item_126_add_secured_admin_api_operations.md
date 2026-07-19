## item_126_add_secured_admin_api_operations - Add secured admin API operations
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85
> Progress: 100
> Complexity: Medium
> Theme: Admin operations
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Operators currently need database-level access to inspect profiles and leagues.
- Global admin operations cannot reuse team claim codes because claim codes are scoped to one team and league.
- Recovery codes are hashed, so the requested recovery-code visibility must be reframed as reset-and-show-once.

# Scope
- In:
  - Extend API config to read an optional server-side admin token from `ADMIN_TOKEN` or the chosen project env name.
  - Register an admin route module only when a Prisma client is available.
  - Add a small shared admin-auth guard for `/admin/*` routes that validates `Authorization: Bearer <token>` and returns 403 for missing/wrong tokens.
  - Define behavior when admin token is missing: admin routes should return 404/403/503 consistently, and tests should pin the chosen response.
  - Add `GET /admin/users` with profile id/email/createdAt/team count/league count metadata, excluding recovery hashes.
  - Add `POST /admin/users/:profileId/recovery-code` that generates a new recovery code, stores its hash, and returns the plaintext code once.
  - Add `DELETE /admin/users/:profileId` with explicit single-profile deletion behavior; verify team relations become unlinked or document any intentional cascade policy.
  - Add `GET /admin/leagues` with league id/code/name/status/settings/current GP season-round/status/player count/createdAt metadata.
  - Add a read-only admin league inspection endpoint or reuse `GET /leagues/:leagueId` behind admin auth, without requiring a team claim code.
  - Add focused Fastify tests in `apps/api/src/app.test.ts` or a new admin route test file.
- Out:
  - Database schema changes for admin users or roles.
  - Plaintext recovery-code storage.
  - Bulk delete or bulk reset operations.
  - League mutation operations beyond read-only inspection.
  - Audit-log persistence unless a minimal test-visible log already exists.

# Acceptance criteria
- AC1: With no admin token configured, `/admin/users` and `/admin/leagues` do not expose data.
- AC2: With an admin token configured, missing or wrong `Authorization` headers are rejected.
- AC3: With a valid token, `GET /admin/users` returns profile summaries and never returns `recoveryCodeHash`.
- AC4: Resetting a profile recovery code returns a new eight-character recovery code once, and the normal profile recovery endpoint accepts that new code afterward.
- AC5: Deleting a profile removes the profile and leaves related teams in a deliberate, tested state.
- AC6: With a valid token, `GET /admin/leagues` returns league summaries with current GP and team-count metadata.
- AC7: A valid admin can fetch a selected league state for inspection without a player claim code.
- AC8: `npm run typecheck` and the focused API tests pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: With no admin token configured, `/admin/users` and `/admin/leagues` do not expose data.
- request-AC2 -> This backlog slice. Proof: AC2: With an admin token configured, missing or wrong `Authorization` headers are rejected.
- request-AC4 -> This backlog slice. Proof: AC3: With a valid token, `GET /admin/users` returns profile summaries and never returns `recoveryCodeHash`.
- request-AC5 -> This backlog slice. Proof: AC4: Resetting a profile recovery code returns a new eight-character recovery code once, and the normal profile recovery endpoint accepts that new code afterward.
- request-AC6 -> This backlog slice. Proof: AC5: Deleting a profile removes the profile and leaves related teams in a deliberate, tested state.
- request-AC7 -> This backlog slice. Proof: AC6: With a valid token, `GET /admin/leagues` returns league summaries with current GP and team-count metadata.
- request-AC8 -> This backlog slice. Proof: AC7: A valid admin can fetch a selected league state for inspection without a player claim code.
- request-AC10 -> This backlog slice. Proof: AC8: `npm run typecheck` and the focused API tests pass.
- request-AC9 -> This backlog slice. Proof: EN/FR i18n covers the admin API error copy surfaced by the UI.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_021_admin_operations_console_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_050_add_a_secured_admin_operations_console`
- Primary task(s): `task_051_orchestrate_secured_admin_operations_console`

# AI Context
- Summary: Add secured admin API operations
- Keywords: scaffolded-backlog, add secured admin api operations, implementation-ready
- Use when: Implementing the scaffolded slice for Add secured admin API operations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_051_orchestrate_secured_admin_operations_console`

# Notes
- Task `task_051_orchestrate_secured_admin_operations_console` was finished via `logics-manager flow finish task` on 2026-07-19.
