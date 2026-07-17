## item_079_require_claim_codes_for_team_mutations - Require claim codes for team mutations
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Team ownership
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The server trusts teamId for player-controlled mutations after initial rejoin.
- Anyone who can observe or guess a team id in a league can update another team's livery/name, buy cards for it, submit qualifying runs, or lock directives.

# Scope
- In:
  - Add claimCode to the route body guards and store inputs for card buying, team livery, team name, directive submission, and qualifying submission.
  - Implement one small shared store-level ownership check that verifies the team belongs to the league and the submitted claimCode matches its stored claimCode.
  - Update App.tsx mutation payloads to send leagueState.player.claimCode for the current player team.
  - Preserve bot/internal code paths by keeping bot actions server-side and not requiring a claimCode for server-generated bot decisions.
  - Add API tests for missing claimCode, wrong claimCode, and a correct claimCode on at least one representative mutation, then cover the remaining routes with minimal assertions.
- Out:
  - Adding login sessions or Authorization headers.
  - Changing /leagues/rejoin response shape except as needed to keep the current player claim attached.
  - Protecting league-level owner/admin settings; this pass only covers team-scoped player mutations.

# Acceptance criteria
- AC1: Every listed mutation rejects missing or wrong claimCode before changing data.
- AC2: Correct claimCode keeps existing successful flows green.
- AC3: The web sends claimCode from stored player state and does not render it outside the existing recovery/profile affordances.
- AC4: Existing API and web tests are updated only where the endpoint contract changed.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every listed mutation rejects missing or wrong claimCode before changing data.
- request-AC2 -> This backlog slice. Proof: AC2: Correct claimCode keeps existing successful flows green.
- request-AC8 -> This backlog slice. Proof: AC3: The web sends claimCode from stored player state and does not render it outside the existing recovery/profile affordances.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Primary task(s): `task_042_orchestrate_api_integrity_hardening`

# AI Context
- Summary: Require claim codes for team mutations
- Keywords: scaffolded-backlog, require claim codes for team mutations, implementation-ready
- Use when: Implementing the scaffolded slice for Require claim codes for team mutations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
