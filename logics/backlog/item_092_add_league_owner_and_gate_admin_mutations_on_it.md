## item_092_add_league_owner_and_gate_admin_mutations_on_it - Add league owner and gate admin mutations on it
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: League authority
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- requireAdminClaim delegates to requireTeamClaim, so any human team claim in a league passes the admin check.
- Any league member can restart a league (wiping Grand Prix history), resolve races, advance the season, or change settings.

# Scope
- In:
  - Add League.ownerTeamId to the Prisma schema with a migration; set it when the creating human team is created.
  - Backfill ownerTeamId for existing leagues to the earliest-created human team in the migration.
  - Change requireAdminClaim to verify the claimed team is the league owner and return 403 otherwise.
  - Keep the web client working: the creator's stored claim already identifies the owner, so no new UI is required beyond surfacing the 403 error message.
  - Add API tests: non-owner member claim rejected on settings, resolve, next-grand-prix, and restart; owner claim accepted.
- Out:
  - Roles, permissions tables, ownership transfer flows, or multi-admin support.
  - Changing team-scoped endpoints already gated by requireTeamClaim.

# Acceptance criteria
- AC1: A member team's valid claim is rejected with 403 on all four admin endpoints.
- AC2: The owner's claim succeeds and existing owner flows in the web app work unchanged.
- AC3: Existing leagues get a backfilled owner via the migration.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A member team's valid claim is rejected with 403 on all four admin endpoints.
- request-AC7 -> This backlog slice. Proof: AC2: The owner's claim succeeds and existing owner flows in the web app work unchanged.
- request-AC3 -> This backlog slice. Evidence needed: Concurrent qualifying submissions cannot lose runs (transactional append), duplicate bot fill cannot 500 (first writer wins, second is a no-op), and startNextGrandPrix claims the transition with a guarded conditional write inside one transaction so double calls and mid-way failures leave consistent state.
- request-AC4 -> This backlog slice. Evidence needed: scripts/balance-simulations.ts compiles and runs against the real shared exports, and npm run typecheck covers scripts/.
- request-AC5 -> This backlog slice. Evidence needed: Modals focus their dialog on open, close on Escape, restore focus on close via one small shared component with no new dependency; the replay scrubber is a native range input that is keyboard and screen-reader operable; league-config numeric fields clamp to their min/max before submit.
- request-AC6 -> This backlog slice. Evidence needed: Unit tests cover PRNG determinism and weighted-pick edge cases, and assert exact credits/points for the sponsorship and economy-mode reward branches.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Primary task(s): `task_045_orchestrate_repo_review_remediation_pass_3`

# AI Context
- Summary: Add league owner and gate admin mutations on it
- Keywords: scaffolded-backlog, add league owner and gate admin mutations on it, implementation-ready
- Use when: Implementing the scaffolded slice for Add league owner and gate admin mutations on it.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_045_orchestrate_repo_review_remediation_pass_3`

# Notes
- Task `task_045_orchestrate_repo_review_remediation_pass_3` was finished via `logics-manager flow finish task` on 2026-07-18.
