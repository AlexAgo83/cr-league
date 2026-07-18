## item_088_add_minimal_admin_proof_to_league_level_mutations - Add minimal admin proof to league-level mutations
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: League authority
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- League-level mutations currently require only a leagueId.
- Any caller with a league id can change settings, resolve the race, advance to the next GP, or restart the league.

# Scope
- In:
  - Choose the smallest admin proof compatible with existing data: prefer the creating human team's claimCode or a profile-linked owner if already available after inspecting schema and creation flow.
  - Add body guards and store checks for /settings, /resolve, /next-grand-prix, and /restart.
  - Update the web client to include the current player's admin proof for these actions.
  - Make non-owner/non-admin human teams unable to perform league-level actions if the chosen model distinguishes owner from participant.
  - Add API tests for missing proof, wrong proof, non-admin proof, and valid proof for representative admin endpoints.
- Out:
  - JWT, cookies, OAuth, server sessions, invite roles, permissions tables, or admin UI redesign.
  - Changing GET /leagues/:leagueId visibility.
  - Changing team-scoped claimCode work already covered by req_041 except where shared helpers reduce code.

# Acceptance criteria
- AC1: Each listed endpoint rejects unauthorized requests before mutation.
- AC2: A valid current-player proof keeps existing league flows working from the web app.
- AC3: The implementation uses one shared helper or clearly tiny route-local checks; no new auth framework exists.
- AC4: Tests name the chosen owner/admin rule so future agents know the contract.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Each listed endpoint rejects unauthorized requests before mutation.
- request-AC2 -> This backlog slice. Proof: AC2: A valid current-player proof keeps existing league flows working from the web app.
- request-AC7 -> This backlog slice. Proof: AC3: The implementation uses one shared helper or clearly tiny route-local checks; no new auth framework exists.
- request-AC8 -> This backlog slice. Proof: AC4: Tests name the chosen owner/admin rule so future agents know the contract.
- request-AC5 -> This backlog slice. Evidence needed: Valid demo preview and valid custom preview payloads still return RaceResult unchanged.
- request-AC6 -> This backlog slice. Evidence needed: A short docs note or Logics closeout note states that claimCode/recoveryCode in localStorage are prototype secrets, with the upgrade path to server sessions when the game needs real account security.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_014_api_surface_follow_up_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_043_api_surface_follow_up_hardening`
- Primary task(s): `task_044_orchestrate_api_surface_follow_up_hardening`

# AI Context
- Summary: Add minimal admin proof to league-level mutations
- Keywords: scaffolded-backlog, add minimal admin proof to league-level mutations, implementation-ready
- Use when: Implementing the scaffolded slice for Add minimal admin proof to league-level mutations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_044_orchestrate_api_surface_follow_up_hardening`

# Notes
- Task `task_044_orchestrate_api_surface_follow_up_hardening` was finished via `logics-manager flow finish task` on 2026-07-18.
