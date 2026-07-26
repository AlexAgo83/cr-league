## item_289_generate_and_audit_the_20_real_street_route_files_via_the_osm_pipeline - Generate and audit the 20 real-street route files via the OSM pipeline
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Circuit catalogue
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Route geometry must come from scripts/generate-circuit.mjs (OSM/Overpass), never hand-drawn, so the loops are real and drivable.
- auditPoints (generate-circuit.mjs:432) rejects closure gaps > 120m, segments > 250m, self-crossings, direct u-turns, and > 30m route reuse; some cities need per-city tuning (--lat/--lng, --target-km, --highways major, --provider osrm) to yield a clean loop.
- Waterfront cities (Sydney, Dubai, Hong Kong) risk routing across water and must stay on real roads.

# Scope
- In:
  - Run generate-circuit.mjs --place/--lat/--lng --layout-key circuit_<key> --write-index for each of the 20 target cities, iterating flags per city until the loop passes the audit with zero failures.
  - Write one apps/web/src/app/circuitRoutes/circuit_<key>.ts route file per city, wired through circuitRoutes/index.ts.
  - Sanity-check each loop visually stays on roads (no water crossings) and reads as the intended landmark.
- Out:
  - Changing the generation script's scoring heuristic, audit thresholds, or point-compaction.
  - Authoring or editing route points by hand after generation.
  - Identity rows, speed profiles, localization (later items).

# Acceptance criteria
- AC1: 20 circuit_<key>.ts route files exist, each generated from OSM via generate-circuit.mjs.
- AC2: Every new route passes auditPoints / npm run audit:circuits geometry checks with zero failures.
- AC3: No loop crosses water or leaves the road network.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: 20 circuit_<key>.ts route files exist, each generated from OSM via generate-circuit.mjs.
- request-AC5 -> This backlog slice. Proof: AC2: Every new route passes auditPoints / npm run audit:circuits geometry checks with zero failures.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_070_city_circuit_catalogue_expansion_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_118_twenty_new_realistic_city_circuits_generated_through_the_established_osm_pipeline`
- Primary task(s): `task_119_orchestrate_the_twenty_new_circuits_expansion`

# AI Context
- Summary: Generate and audit the 20 real-street route files via the OSM pipeline
- Keywords: scaffolded-backlog, generate and audit the 20 real-street route files via the osm pipeline, implementation-ready
- Use when: Implementing the scaffolded slice for Generate and audit the 20 real-street route files via the OSM pipeline.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
