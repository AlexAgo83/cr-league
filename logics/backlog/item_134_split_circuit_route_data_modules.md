## item_134_split_circuit_route_data_modules - Split circuit route data modules
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
`apps/web/src/app/circuits.ts` mixed the public circuit API, season helpers, metadata composition, and thousands of route coordinate lines. This made circuit maintenance noisy and made generated route updates harder to review.

# Scope
- In:
  - Move each existing route coordinate array into `apps/web/src/app/circuitRoutes/<layoutKey>.ts`.
  - Keep `apps/web/src/app/circuits.ts` as the stable facade for `CityCircuit`, `CITY_CIRCUITS`, `circuitsForSeason`, and `circuitForRound`.
  - Update route generation so a selected `layoutKey` writes to its route module.
  - Update route auditing so it reads the new module layout.
  - Validate the refactor with circuit audit, typecheck, lint, and tests.
- Out:
  - Changing route geometry.
  - Changing season ordering rules.
  - Changing circuit/championship UI behavior.

# Acceptance criteria
- AC1: `apps/web/src/app/circuits.ts` is a compact facade under 100 lines and keeps the existing exported API.
- AC2: All existing route arrays live in one module per `layoutKey` under `apps/web/src/app/circuitRoutes/`.
- AC3: `scripts/generate-circuit.mjs --write-index --layout-key <key>` writes the matching route module.
- AC4: `scripts/audit-circuits.mjs` reads `CITY_CIRCUIT_IDENTITIES` plus route modules and validates all circuits.
- AC5: `npm run audit:circuits`, `npm run typecheck`, `npm run lint`, and `npm test` pass.

# AC Traceability
- request-AC1 -> backlog-AC1. Proof: `apps/web/src/app/circuits.ts` is 39 lines and exports the same facade API.
- request-AC2 -> backlog-AC2. Proof: `apps/web/src/app/circuitRoutes/` contains one route module per current `CITY_CIRCUIT_IDENTITIES.layoutKey`.
- request-AC3 -> backlog-AC3. Proof: `scripts/generate-circuit.mjs` writes `${layoutKey}.ts` when a layout key is provided.
- request-AC4 -> backlog-AC4. Proof: `npm run audit:circuits` passes against the route module layout.
- request-AC5 -> backlog-AC5. Proof: `npm run audit:circuits`, `npm run typecheck`, `npm run lint`, and `npm test` passed locally.

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
- Request: `logics/request/req_057_split_circuit_route_data_modules.md`
- Primary task(s): `logics/tasks/task_058_split_circuit_route_data_modules.md`

# AI Context
- Summary: Move circuit route coordinates into per-layout modules while keeping the app facade and generator/audit workflows stable.
- Keywords: circuits, circuitRoutes, generator, audit-circuits, facade
- Use when: Implementing or reviewing circuit route storage and validation changes.
- Skip when: The change is unrelated to circuit data layout.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_057_split_circuit_route_data_modules` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_057_split_circuit_route_data_modules.md`.
- Generated locally by logics-manager.
- Task `task_058_split_circuit_route_data_modules` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_058_split_circuit_route_data_modules`
