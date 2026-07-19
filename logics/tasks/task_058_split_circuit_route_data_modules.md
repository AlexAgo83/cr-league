## task_058_split_circuit_route_data_modules - Split circuit route data modules
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
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready before commit.

# Backlog
- `item_134_split_circuit_route_data_modules`

# Acceptance criteria
- AC1: `apps/web/src/app/circuits.ts` is a compact facade under 100 lines and keeps the existing exported API.
- AC2: All existing route arrays live in one module per `layoutKey` under `apps/web/src/app/circuitRoutes/`.
- AC3: `scripts/generate-circuit.mjs --write-index --layout-key <key>` writes the matching route module.
- AC4: `scripts/audit-circuits.mjs` reads `CITY_CIRCUIT_IDENTITIES` plus route modules and validates all circuits.
- AC5: `npm run audit:circuits`, `npm run typecheck`, `npm run lint`, and `npm test` pass.

# Validation
- `npm run audit:circuits` passed: 18 circuits audited, all `ok`.
- `npm run typecheck` passed.
- `node --check scripts/generate-circuit.mjs` passed.
- `node --check scripts/audit-circuits.mjs` passed.
- `npm run lint` passed.
- `npm test` passed: 13 files, 130 tests.
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# Report
- `apps/web/src/app/circuits.ts` now composes identities with imported route modules and keeps `circuitsForSeason` / `circuitForRound` unchanged for callers.
- `apps/web/src/app/circuitRoutes/` now contains one route module per current circuit layout key plus an index aggregator.
- `scripts/generate-circuit.mjs` writes a dedicated route module for the selected layout key instead of rewriting the facade.
- `scripts/audit-circuits.mjs` now validates route modules directly against shared circuit identities.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_134_split_circuit_route_data_modules`
- Related request(s): `req_057_split_circuit_route_data_modules`

# AI Context
- Summary: Implementation task for splitting circuit route data into per-layout modules and updating generator/audit tooling.
- Keywords: circuits, circuitRoutes, generate-circuit, audit-circuits, route modules
- Use when: Continuing or reviewing the circuit route module refactor.
- Skip when: Work is unrelated to circuit route data layout.

# Links
- Request: `req_057_split_circuit_route_data_modules`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `wc -l apps/web/src/app/circuits.ts` reports 39 lines, and the file still exports `CityCircuit`, `CITY_CIRCUITS`, `circuitsForSeason`, and `circuitForRound`.
- request-AC2 -> This task. Proof: `apps/web/src/app/circuitRoutes/` contains 18 per-layout route modules matching the 18 entries in `CITY_CIRCUIT_IDENTITIES`.
- request-AC3 -> This task. Proof: `scripts/generate-circuit.mjs` writes `${routesDir}/${args.layoutKey}.ts` when `--write-index` and `--layout-key` are provided.
- request-AC4 -> This task. Proof: `scripts/audit-circuits.mjs` now reads `apps/web/src/app/circuitRoutes/<layoutKey>.ts`; `npm run audit:circuits` passed with all 18 circuits `ok`.
- request-AC5 -> This task. Proof: `npm run audit:circuits`, `npm run typecheck`, `npm run lint`, and `npm test` passed locally.
