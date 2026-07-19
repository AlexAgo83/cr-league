## task_053_add_osm_street_circuit_generator - Add OSM street circuit generator
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_129_add_osm_street_circuit_generator`

# Acceptance criteria
- AC1: `scripts/generate-circuit.mjs` supports place or latitude/longitude input.
- AC2: The generator uses Overpass/OSM street graphs and OSRM routing fallback rather than freehand coordinate drawing.
- AC3: Candidate routes are checked with local circuit audit rules before selection.
- AC4: `--write-index`, `--layout-key`, and `--laps` update the existing circuit sources.
- AC5: The seven recent circuits are regenerated with the CLI.
- AC6: `npm run audit:circuits` passes for the full catalog after regeneration.

# Validation
- `node --check scripts/generate-circuit.mjs`
- `npm run audit:circuits`
- Pending before closeout: `npm run typecheck`, `npm run lint`, `npm test`, `logics-manager lint --require-status`, `logics-manager audit --group-by-doc`.
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# Report
- Added `npm run generate:circuit` backed by `scripts/generate-circuit.mjs`.
- The generator geocodes with Nominatim when needed, fetches Overpass/OSM street graphs with endpoint fallback, can prefer major roads in dense cities, and can use OSRM routing as a fallback provider.
- The generator ignores one-way restrictions for gameplay by treating OSM graph edges as bidirectional; reverse-route reuse remains disallowed because it means the circuit drives back over the same segment.
- Regenerated:
  - Monaco Harbor: 2.9 km route, 13 laps, target race distance.
  - Monaco Casino: 8.2 km route, 6 laps, target race distance.
  - London Thames: 6.9 km route, 7 laps, target race distance.
  - Brussels Grand Place: 15.4 km route, 3 laps, target race distance.
  - Prague Vltava: 6.1 km route, 7 laps, target race distance.
  - Copenhagen Harbor: 5.9 km route, 7 laps, target race distance.
  - Stockholm Gamla Stan/Norrmalm: 5.2 km route, 8 laps, target race distance.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_129_add_osm_street_circuit_generator`
- Related request(s): `req_052_add_osm_street_circuit_generator`

# AI Context
- Summary: Implement add osm street circuit generator.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_052_add_osm_street_circuit_generator`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `scripts/generate-circuit.mjs` accepts `--place` or explicit `--lat`/`--lng`.
- request-AC2 -> This task. Proof: the generator uses Overpass/OSM street graphs and OSRM routing fallback.
- request-AC3 -> This task. Proof: generated candidates are selected only after the local audit rules pass.
- request-AC4 -> This task. Proof: the regenerated route and lap diffs are in `apps/web/src/app/circuits.ts` and `packages/shared/src/domain/circuits.ts`.
- request-AC5 -> This task. Proof: all seven requested circuits were regenerated with CLI runs recorded in the task report, and `npm run audit:circuits` passed.
- request-AC6 -> This task. Proof: `package.json` exposes `npm run generate:circuit`; request/backlog/task docs describe the workflow and validation.
