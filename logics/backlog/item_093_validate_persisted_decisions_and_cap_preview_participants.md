## item_093_validate_persisted_decisions_and_cap_preview_participants - Validate persisted decisions and cap preview participants
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Input validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- submitDecision stores approach and preparation as arbitrary strings that are later blind-cast into simulateRace, corrupting league scoring on invalid values.
- cardId and rivalTeamId are not checked against card definitions or league membership.
- /simulation/preview requires at least 2 participants but has no upper bound, allowing expensive CPU work from a public route.

# Scope
- In:
  - Reuse or extract the APPROACHES/PREPARATIONS validation already used by /simulation/preview into a shared helper and apply it in submitDecision.
  - Validate cardId against card definitions and team inventory, and rivalTeamId against the league's teams.
  - Cap /simulation/preview participants at the maximum allowed league size and return 400 above it.
  - Add API tests for invalid approach, preparation, cardId, rivalTeamId, and an oversized preview participants array.
- Out:
  - Schema validation libraries.
  - Rate limiting or authentication on the preview route.
  - Changing valid-input behavior.

# Acceptance criteria
- AC1: Invalid enum, card, or rival values on submitDecision return 400 and persist nothing.
- AC2: Oversized preview participant arrays return 400.
- AC3: Valid decision submissions and valid previews behave unchanged.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Invalid enum, card, or rival values on submitDecision return 400 and persist nothing.
- request-AC7 -> This backlog slice. Proof: AC2: Oversized preview participant arrays return 400.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Primary task(s): `task_045_orchestrate_repo_review_remediation_pass_3`

# AI Context
- Summary: Validate persisted decisions and cap preview participants
- Keywords: scaffolded-backlog, validate persisted decisions and cap preview participants, implementation-ready
- Use when: Implementing the scaffolded slice for Validate persisted decisions and cap preview participants.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
