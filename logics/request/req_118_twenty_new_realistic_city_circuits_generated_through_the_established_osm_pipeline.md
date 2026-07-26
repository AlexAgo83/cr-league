## req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline - Twenty new realistic city circuits generated through the established OSM pipeline
> From version: 0.4.6
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Circuit catalogue
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add 20 new realistic city circuits to the catalogue using ONLY the established OSM-driven pipeline (scripts/generate-circuit.mjs), never hand-drawn or invented route geometry, so every new loop is a real, clean, drivable street layout that passes the existing geometry audit.
- Give each new circuit a complete, canonical identity row in CITY_CIRCUIT_IDENTITIES with generated geometry markers and speed profile (not authored), plus balanced laps, traits, and likely weather.
- Localize every new circuit with circuit_<key> display names in all locale files (en.json and fr.json).
- Prove the additions are clean and fair by passing npm run audit:circuits (geometry + pacing) and npm run balance:gate (competitive balance), alongside the standard typecheck/test/build/lint gates.

# Context
- This is a data/content request, not an engine change: it consumes the pipeline built by the canonical-race-track-geometry and canonical-corner-speed-profile work. Do NOT reinvent generation, auditing, or the geometry heuristic; run the existing scripts. If a script needs a small fix to batch-run 20 cities, that is in scope, but changing thresholds, the scoring heuristic, or the audit rules is out of scope.
- Route generation is per-city and network-dependent: generate-circuit.mjs --place "<City center>" --layout-key circuit_<key> [--laps N] --write-index fetches OSM via Overpass and writes circuitRoutes/<layoutKey>.ts. Some cities will need --lat/--lng, a tuned --target-km, --highways major, or --provider osrm to find a clean loop; iterate per city until auditPoints returns zero failures. Waterfront cities (Sydney, Dubai, Hong Kong) must keep the loop on real roads — do not route across water.
- Identity rows carry canonical geometry: after each route exists, the mainStraight span, startProgress, and pitLaneProgress come from the shared geometry heuristic and the per-corner speed profile from scripts/generate-circuit-speed-profiles.mjs — regenerate, do not type these numbers by hand. trackLengthMeters/routeLengthMeters must match the generated route (audit:circuits will flag drift).
- Balance the gameplay dials with intent, matching the spread already in the catalogue: laps sized so total race distance lands in the audit target band, traits {grip, overtaking, energy} chosen to differentiate archetypes (fast avenue vs tight old-town vs long waterfront), and likelyWeather fitting the city. Use npm run balance:gate to confirm none of the 20 are outliers.
- Localization is required for all locales: add a circuit_<key> name to en.json AND fr.json for each of the 20 keys; a themed circuit name (like existing "Quayside Rush" / "Rafale des Quais"), not the raw city string. A missing key renders the layoutKey verbatim in the UI.
- Out of scope: changing the circuit data model or CityCircuit type; altering the generation/audit/balance scripts' rules or thresholds; season-rotation logic (new circuits are picked up automatically by CITY_CIRCUITS / seasonCircuitIdentities); circuit artwork or thumbnails beyond what the map already renders from the route; and adding circuits beyond the specified 20.

# Acceptance criteria
- AC1: 20 new route files exist under apps/web/src/app/circuitRoutes/ (one circuit_<key>.ts per target city), each generated via scripts/generate-circuit.mjs from real OSM data, and every one passes auditPoints with zero failures (no crossings, u-turns, oversized segments, closure gaps, or reuse).
- AC2: Each new circuit has a complete identity row in CITY_CIRCUIT_IDENTITIES with route-matching trackLengthMeters/routeLengthMeters, geometry markers and CIRCUIT_SPEED_PROFILES regenerated from the route (via generate-circuit-speed-profiles.mjs, not hand-authored), and intentional laps/traits/likelyWeather.
- AC3: Every new layoutKey has a themed circuit_<key> display name in apps/web/src/i18n/en.json and apps/web/src/i18n/fr.json.
- AC4: The new circuits are competitively balanced and correctly paced — npm run audit:circuits reports all 46 circuits ok and in the pacing target band, and npm run balance:gate passes with no new outliers.
- AC5: npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate all pass with the 20 circuits added.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_070_city_circuit_catalogue_expansion_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/scaffold/canonical-race-track-geometry.json
- packages/shared/src/domain/circuits.ts
- apps/web/src/app/circuits.ts
- apps/web/src/app/circuitRoutes
- apps/web/src/app/circuitRoutes/index.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- scripts/generate-circuit.mjs
- scripts/generate-circuit-speed-profiles.mjs
- scripts/audit-circuits.mjs
- scripts/balance-simulations.ts
- The catalogue currently ships 26 city circuits (CITY_CIRCUIT_IDENTITIES in packages/shared/src/domain/circuits.ts) and we want to add 20 more without inventing geometry by hand. The project already has a canonical, reproducible pipeline for realistic circuits and it MUST be followed rather than reinvented. (1) Routes are real street loops pulled from OpenStreetMap: scripts/generate-circuit.mjs --place "City" --layout-key circuit_x fetches the street graph via Overpass, builds ~160 candidate rings, routes cycles on the graph, compacts points to a 10m minimum gap, and scores toward a ~6.2km target. auditPoints (generate-circuit.mjs:432) rejects any loop with a closure gap > 120m, a segment > 250m, any self-crossing, any direct u-turn, > 30m reverse reuse, or > 30m same-direction repeat, so only clean, drivable loops survive. The winning loop is written to apps/web/src/app/circuitRoutes/<layoutKey>.ts as `export const route = [...]` and picked up lazily by circuitRoutes/index.ts and circuitRouteFor. (2) Each circuit needs one identity row in CITY_CIRCUIT_IDENTITIES: city, country, layoutKey, laps, trackLengthMeters, routeLengthMeters, the canonical geometry markers (mainStraightStartProgress/mainStraightEndProgress/startProgress/pitLaneProgress), traits {grip, overtaking, energy}, and likelyWeather. Canonical geometry and the per-corner CIRCUIT_SPEED_PROFILES are generated from the route, not authored: scripts/generate-circuit-speed-profiles.mjs re-derives the speed profile for every layoutKey from its route points and startProgress. (3) Display names are i18n keys: every layoutKey needs a circuit_<key> entry in apps/web/src/i18n/en.json and fr.json (e.g. circuit_tokyo_bay_loop -> "Tokyo Street Circuit"); a missing key would render the raw key. (4) Quality is gated: npm run audit:circuits validates geometry and race-distance pacing (recommended laps, target band) across the whole catalogue, and npm run balance:gate checks the new tracks are competitively balanced (gap %, pit-points spread). The 20 target cities (waterfront / old-town / avenue loops, geographically spread, no duplicates of the existing 26): Marseille (vieux_port), Naples (lungomare), Budapest (danube), Athens (plaka), Helsinki (esplanadi), Edinburgh (royal_mile), Valletta (grand_harbour), Amsterdam (jordaan), New York (battery), San Francisco (embarcadero), Miami (ocean_drive), Chicago (lakefront), Buenos Aires (madero), Mexico City (reforma), Singapore (marina), Hong Kong (victoria), Shanghai (bund), Osaka (dotonbori), Dubai (marina), Sydney (darling_harbour).

# AI Context
- Summary: Twenty new realistic city circuits generated through the established OSM pipeline
- Keywords: request-chain-scaffold, twenty new realistic city circuits generated through the established osm pipeline, development-ready
- Use when: You need to implement or review the scaffolded workflow for Twenty new realistic city circuits generated through the established OSM pipeline.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_289_generate_and_audit_the_20_real_street_route_files_via_the_osm_pipeline`
- `item_290_author_identity_rows_with_generated_geometry_speed_profiles_and_balanced_dials`
- `item_291_localize_the_new_circuits_and_pass_the_full_catalogue_gates`
