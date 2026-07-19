## item_129_add_osm_street_circuit_generator - Add OSM street circuit generator
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
City circuits need to be generated from real street/routing data instead of hand-drawn coordinates. The workflow should support "give a city or address, get a ready-to-use audited circuit" while preserving the game-specific validation rules.

# Scope
- In:
  - Add a reusable CLI under `scripts/` for route generation.
  - Support geocoding by place name and explicit latitude/longitude overrides.
  - Use Overpass/OSM street graphs for local cycle generation, with endpoint fallback and a reduced "major roads" profile for dense cities.
  - Use OSRM routing as a fallback provider when Overpass is unavailable for a city.
  - Reuse the existing circuit audit rules before accepting a generated route.
  - Write accepted routes and lap counts into the existing circuit source files.
  - Regenerate the 7 recent city circuits through the tool.
- Out:
  - Shipping a public in-app circuit editor UI.
  - Persisting generated circuit drafts in the database.
  - Guaranteeing one-way street legality; gameplay may ignore one-way restrictions.
  - Replacing the existing historical circuit data.

# Acceptance criteria
- AC1: `npm run generate:circuit -- --place ...` can produce an audited route from cartography/routing data.
- AC2: The generator can write to `apps/web/src/app/circuits.ts` via `--write-index`.
- AC3: The generator can update laps in `packages/shared/src/domain/circuits.ts` via `--layout-key` and `--laps`.
- AC4: Monaco Harbor, Monaco Casino, London, Brussels, Prague, Copenhagen, and Stockholm are regenerated with the CLI.
- AC5: `npm run audit:circuits` reports the regenerated circuits in the target distance band with no crossings, u-turns, reverse reuse, or repeated route above thresholds.
- AC6: Public API instability is handled with bounded fallbacks instead of manual drawing.

# AC Traceability
- request-AC1 -> AC1, AC2, AC3.
- request-AC2 -> AC1, AC4, AC6.
- request-AC3 -> AC5.
- request-AC4 -> AC2, AC3.
- request-AC5 -> AC4, AC5.
- request-AC6 -> AC1, AC6.
- request-AC1 -> This backlog slice. Proof: `scripts/generate-circuit.mjs` accepts `--place` or explicit `--lat`/`--lng`.
- request-AC2 -> This backlog slice. Proof: the generator uses Overpass/OSM street graphs and OSRM routing fallback.
- request-AC3 -> This backlog slice. Proof: candidates are checked with the same closure, segment, crossing, u-turn, reverse-reuse, and repeat-reuse thresholds as `scripts/audit-circuits.mjs`.
- request-AC4 -> This backlog slice. Proof: `--write-index`, `--layout-key`, and `--laps` update `apps/web/src/app/circuits.ts` and `packages/shared/src/domain/circuits.ts`.
- request-AC5 -> This backlog slice. Proof: Monaco Harbor, Monaco Casino, London, Brussels, Prague, Copenhagen, and Stockholm were regenerated and `npm run audit:circuits` passed.
- request-AC6 -> This backlog slice. Proof: `package.json` exposes `npm run generate:circuit` and this Logics chain documents the workflow.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_052_add_osm_street_circuit_generator.md`
- Primary task(s): `task_053_add_osm_street_circuit_generator`

# AI Context
- Summary: Add OSM street circuit generator
- Keywords: backlog-groom, request, add osm street circuit generator, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Add OSM street circuit generator.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Needed to correct circuit quality and avoid repeating manual route drawing for each new city.

# Notes
- Hybrid rationale: Derived from request `req_052_add_osm_street_circuit_generator` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_052_add_osm_street_circuit_generator.md`.
- Generated locally by logics-manager.
- Task `task_053_add_osm_street_circuit_generator` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_053_add_osm_street_circuit_generator`
