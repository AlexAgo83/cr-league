## item_300_single_source_of_truth_for_the_leaguestate_raceresult_response_contract - Single source of truth for the LeagueState/RaceResult response contract
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 50%
> Complexity: Medium
> Theme: Architecture remediation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- LeagueState is hand-duplicated in apps/web/src/app/types.ts and apps/api/src/features/leagues/types.ts, absent from shared, and has drifted.
- The authoritative api types currentGrandPrix.result/history result as unknown (types.ts:67,75) while web types them RaceResult|null — the producer types its own result more weakly than the consumer.
- api decisions carry rivalTeamId and string approach/preparation; web omits rivalTeamId and uses the RaceDecision unions.

# Scope
- In:
  - Define the response DTO (LeagueState + nested result as RaceResult|null + decisions with RaceDecision unions and rivalTeamId) once in packages/shared.
  - Have both api and web import it and reconcile the drifted fields; model opponent-reveal 'possibly hidden' fields honestly in the DTO.
  - Remove the two local copies.
- Out:
  - Changing what the reveal shaping decides (visibility rules stay).
  - Simulation helper consolidation (next item).

# Acceptance criteria
- AC1: One shared DTO consumed by api and web; local copies gone.
- AC2: api no longer uses unknown for result; drifted fields reconciled.
- AC3: typecheck passes and API responses are unchanged.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: One shared DTO consumed by api and web; local copies gone.
- request-AC6 -> This backlog slice. Proof: AC2: api no longer uses unknown for result; drifted fields reconciled.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Primary task(s): `task_123_orchestrate_the_source_of_truth_remediation`

# AI Context
- Summary: Single source of truth for the LeagueState/RaceResult response contract
- Keywords: scaffolded-backlog, single source of truth for the leaguestate/raceresult response contract, implementation-ready
- Use when: Implementing the scaffolded slice for Single source of truth for the LeagueState/RaceResult response contract.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
