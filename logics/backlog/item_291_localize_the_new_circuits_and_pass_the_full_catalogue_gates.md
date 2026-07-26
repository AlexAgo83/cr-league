## item_291_localize_the_new_circuits_and_pass_the_full_catalogue_gates - Localize the new circuits and pass the full catalogue gates
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Circuit catalogue
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Every layoutKey needs a circuit_<key> display name in en.json and fr.json; a missing key renders the raw key in the UI.
- The whole 46-circuit catalogue must still pass geometry + pacing audit and the standard build/test gates after the additions.

# Scope
- In:
  - Add a themed circuit_<key> name for all 20 keys to apps/web/src/i18n/en.json and apps/web/src/i18n/fr.json, matching the existing naming style.
  - Run npm run audit:circuits and confirm all 46 circuits report ok and in the pacing target band.
  - Run npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate and fix any fallout from the additions.
- Out:
  - Adding new locale files beyond en/fr.
  - UI/artwork changes; season-rotation changes.

# Acceptance criteria
- AC1: All 20 new layoutKeys have circuit_<key> names in en.json and fr.json.
- AC2: npm run audit:circuits reports all 46 circuits ok and in the pacing band.
- AC3: typecheck, test, build, lint, and logics:validate all pass.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: All 20 new layoutKeys have circuit_<key> names in en.json and fr.json.
- request-AC4 -> This backlog slice. Proof: AC2: npm run audit:circuits reports all 46 circuits ok and in the pacing band.
- request-AC5 -> This backlog slice. Proof: AC3: typecheck, test, build, lint, and logics:validate all pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_070_city_circuit_catalogue_expansion_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline`
- Primary task(s): `task_119_orchestrate_the_twenty_new_circuits_expansion`

# AI Context
- Summary: Localize the new circuits and pass the full catalogue gates
- Keywords: scaffolded-backlog, localize the new circuits and pass the full catalogue gates, implementation-ready
- Use when: Implementing the scaffolded slice for Localize the new circuits and pass the full catalogue gates.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_119_orchestrate_the_twenty_new_circuits_expansion` was finished via `logics-manager flow finish task` on 2026-07-26.
