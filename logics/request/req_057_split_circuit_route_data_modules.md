## req_057_split_circuit_route_data_modules - Split circuit route data modules
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Split the large circuit data source so the application facade stays small and the route coordinates live in focused, per-circuit modules.
- Keep the public circuit API stable for screens that already import `CITY_CIRCUITS`, `circuitsForSeason`, or `circuitForRound`.
- Keep the circuit generator and circuit audit workflow aligned with the new storage layout.

# Context
- `apps/web/src/app/circuits.ts` had grown into a multi-thousand-line file because every route coordinate was embedded inline.
- Circuit work now includes generated street-following routes, so reviewing and regenerating a single route should not require editing the facade.
- Existing season selection, championship, and circuit screens should not need behavioral rewrites for this refactor.

# Acceptance criteria
- AC1: `apps/web/src/app/circuits.ts` remains a compact facade under 100 lines and keeps the existing exported API.
- AC2: Every existing city circuit route is stored in a dedicated module keyed by its `layoutKey`.
- AC3: `scripts/generate-circuit.mjs` can update the dedicated route module when `--write-index` and `--layout-key` are used.
- AC4: `scripts/audit-circuits.mjs` validates the new module layout and still checks every route for closure, segment length, crossings, U-turns, and reused streets.
- AC5: Typecheck, lint, tests, and circuit audit pass after the refactor.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Split circuit route coordinate data out of the app facade while preserving public imports and validation workflows.
- Keywords: circuits, circuit routes, route modules, generator, audit, facade
- Use when: Working on circuit route storage, generation, or validation.
- Skip when: The change is unrelated to circuit data layout.

# Backlog
- none
- `item_134_split_circuit_route_data_modules`
