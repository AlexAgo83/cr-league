## task_052_improve_circuit_catalog_and_maps - Improve circuit catalog and maps
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Circuits
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Improve the championship circuit screen so the catalog is easier to scan and each listed circuit can be inspected on the existing map surface.
- Add five European city circuits not already present in the catalog.
- Replace the rough Monaco routes with road-following traces, and keep all routes inside the circuit audit constraints.

# Plan
- [x] 1. Confirm scope, dependencies, and linked acceptance criteria.
- [x] 2. Sort the circuit catalog by localized circuit name.
- [x] 3. Add a read-only map inspection surface from the circuit list.
- [x] 4. Add five new European city circuits with localized names, flags, and audited routes.
- [x] 5. Replace Monaco routes with road-following audited traces.
- [x] GATE: do not close a wave or step until the relevant automated tests and quality checks have been run successfully.

# Backlog
- `item_128_improve_circuit_catalog_and_maps`

# Definition of Done (DoD)
- [x] Code is implemented and reviewed.
- [x] Validation passes.
- [x] Linked docs are synchronized.
- [x] Commit created for the completed user-requested slice.

# AC Traceability
- AC1 -> Circuit catalog is sorted by circuit display name. Proof: implementation and UI test.
- AC2 -> A circuit list entry opens a map-only circuit preview. Proof: implementation and UI test.
- AC3 -> Five new European city circuits are present, excluding cities already in the catalog. Proof: shared circuit test.
- AC4 -> Monaco and new routes pass the circuit audit. Proof: `npm run audit:circuits`.
- AC5 -> EN/FR visible text and country flags are complete. Proof: typecheck/lint and file review.

# Validation
- Run `npm run audit:circuits`.
- Run `npm test -- packages/shared/src/domain/circuits.test.ts`.
- Run the focused web test for the championship circuit screen.
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `logics-manager lint --require-status` and `logics-manager audit --group-by-doc`.
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# Report
- Implemented circuit catalog sorting, clickable read-only map previews, five additional European city circuits, route replacements for Monaco, localized labels, and required flag assets.
- Validation run so far: `npm run audit:circuits`, `npm test -- packages/shared/src/domain/circuits.test.ts apps/web/src/app/App.test.tsx`, `npm run typecheck`, `npm run lint`.
- Final validation: `npm test`, `npm run typecheck`, `npm run lint`, `npm run audit:circuits`, `logics-manager lint --require-status`, `logics-manager audit --group-by-doc`.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_128_improve_circuit_catalog_and_maps`
- Related request(s): `req_051_improve_circuit_catalog_and_maps`

# AI Context
- Summary: Implement improve circuit catalog and maps.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_051_improve_circuit_catalog_and_maps`
- Backlog: `item_128_improve_circuit_catalog_and_maps`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
