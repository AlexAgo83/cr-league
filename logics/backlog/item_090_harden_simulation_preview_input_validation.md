## item_090_harden_simulation_preview_input_validation - Harden simulation preview input validation
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Route validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- /simulation/preview accepts shallow objects with arbitrary trait strings, forecast shape, and participant internals.
- Malformed payloads can reach simulateRace and produce misleading output or runtime errors.

# Scope
- In:
  - Validate primaryTrait and secondaryTrait against the RaceTrait values used by the shared domain.
  - Validate forecast has finite non-negative dry/light_rain/heavy_rain numeric weights with at least one positive weight.
  - Validate participants have required teamId, teamName, kind, standingsRank, and decision fields.
  - Validate decision approach/preparation/cardId/rivalTeamId values against existing domain/card definitions.
  - Keep the validation as small route-local helpers or shared domain type guards if an existing shared helper already fits.
  - Add tests for representative invalid payloads and one valid custom payload.
- Out:
  - Adding zod/yup/io-ts or schema generation.
  - Changing simulateRace internals or race balancing.
  - Supporting partial custom preview payloads.

# Acceptance criteria
- AC1: Invalid enum, forecast, participant, and decision values return 400.
- AC2: Demo preview with no body still works.
- AC3: A valid full RaceInput payload still returns a RaceResult.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Invalid enum, forecast, participant, and decision values return 400.
- request-AC5 -> This backlog slice. Proof: AC2: Demo preview with no body still works.
- request-AC7 -> This backlog slice. Proof: AC3: A valid full RaceInput payload still returns a RaceResult.
- request-AC8 -> This backlog slice. Proof: AC3: A valid full RaceInput payload still returns a RaceResult.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_014_api_surface_follow_up_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_043_api_surface_follow_up_hardening`
- Primary task(s): `task_044_orchestrate_api_surface_follow_up_hardening`

# AI Context
- Summary: Harden simulation preview input validation
- Keywords: scaffolded-backlog, harden simulation preview input validation, implementation-ready
- Use when: Implementing the scaffolded slice for Harden simulation preview input validation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
