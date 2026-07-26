## item_290_author_identity_rows_with_generated_geometry_speed_profiles_and_balanced_dials - Author identity rows with generated geometry, speed profiles, and balanced dials
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 58%
> Complexity: Medium
> Theme: Circuit catalogue
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Each new circuit needs a CITY_CIRCUIT_IDENTITIES row (city, country, layoutKey, laps, trackLengthMeters, routeLengthMeters, geometry markers, traits, likelyWeather) matching its generated route.
- Canonical geometry (mainStraight/startProgress/pitLaneProgress) and CIRCUIT_SPEED_PROFILES are generated from the route, not authored; hand-typed numbers would drift and fail audit:circuits.
- Laps, traits, and weather must be chosen with intent so the 20 differentiate as archetypes and none are balance outliers.

# Scope
- In:
  - Add one identity row per new circuit to CITY_CIRCUIT_IDENTITIES with route-matching lengths and intentional laps/traits/likelyWeather.
  - Regenerate canonical geometry markers and CIRCUIT_SPEED_PROFILES from the routes via scripts/generate-circuit-speed-profiles.mjs (and the geometry heuristic), never by hand.
  - Tune laps so total race distance lands in the audit pacing band and run npm run balance:gate to confirm no new outliers.
- Out:
  - Editing generated geometry/speed-profile numbers manually.
  - Changing the CityCircuit type or the balance/audit scripts.
  - Localization (next item).

# Acceptance criteria
- AC1: 20 complete identity rows exist with route-matching trackLengthMeters/routeLengthMeters.
- AC2: Geometry markers and speed profiles are regenerated from the routes, not hand-authored.
- AC3: npm run balance:gate passes with no new outliers and laps land in the pacing band.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: 20 complete identity rows exist with route-matching trackLengthMeters/routeLengthMeters.
- request-AC4 -> This backlog slice. Proof: AC2: Geometry markers and speed profiles are regenerated from the routes, not hand-authored.
- request-AC5 -> This backlog slice. Proof: AC3: npm run balance:gate passes with no new outliers and laps land in the pacing band.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_070_city_circuit_catalogue_expansion_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline`
- Primary task(s): `task_119_orchestrate_the_twenty_new_circuits_expansion`

# AI Context
- Summary: Author identity rows with generated geometry, speed profiles, and balanced dials
- Keywords: scaffolded-backlog, author identity rows with generated geometry, speed profiles, and balanced dials, implementation-ready
- Use when: Implementing the scaffolded slice for Author identity rows with generated geometry, speed profiles, and balanced dials.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
