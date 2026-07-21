## req_074_audit_circuit_data_impact_before_optimizing_route_loading - Audit circuit data impact before optimizing route loading
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Frontend data loading performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Measure how much detailed circuit route data contributes to the initial web bundle before optimizing it.
- Avoid premature route-data architecture changes if the byte impact is small.
- If route data is material, load detailed circuit geometry only when the map needs that circuit.
- Keep shared circuit identity, laps, weather traits, and web display routes aligned.

# Context
- Circuit identity data exists in the shared package while detailed SVG/display route geometry exists under apps/web/src/app/circuitRoutes.
- CircuitMap renders route geometry and car positions from the web route data.
- Earlier replay work already depends on circuit lap counts and route geometry staying coherent.
- The simplest acceptable result may be an audit that proves no optimization is currently needed.

# Acceptance criteria
- AC1: A repeatable measurement reports the current byte contribution of detailed circuit route modules to the web build or source bundle.
- AC2: The task documents whether route-data lazy loading is worth doing now, with a threshold and measured evidence.
- AC3: If implemented, detailed route modules are dynamically loaded by circuit id without breaking CircuitMap, replay, chrono, or GP views.
- AC4: If deferred, the corpus closeout records why the measured cost does not justify the added loading complexity.
- AC5: Typecheck, lint, unit tests, build, and private-league e2e pass.

# AC Traceability
- AC1 -> `item_172_measure_and_decide_on_circuit_route_lazy_loading`. Proof: `docs/audits/circuit-route-loading-audit-2026-07-21.md` records repeatable source, esbuild metafile, gzip, and Vite sourcemap measurements.
- AC2 -> `item_172_measure_and_decide_on_circuit_route_lazy_loading`. Proof: lazy loading is deferred until route geometry exceeds 75 KB gzip, 30% Vite sourcemap source share, or 40 detailed route modules.
- AC3 -> `item_172_measure_and_decide_on_circuit_route_lazy_loading`. Proof: not implemented because the measured cost is below threshold; existing synchronous route behavior remains unchanged.
- AC4 -> `item_172_measure_and_decide_on_circuit_route_lazy_loading`. Proof: the report documents that the current 51,084-byte gzip route chunk estimate does not justify async loading/error states across Drive, chrono, replay, and qualifying trace generation yet.
- AC5 -> `item_172_measure_and_decide_on_circuit_route_lazy_loading`. Proof: typecheck, lint, full unit tests, build, Playwright e2e, and Logics validation passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_038_circuit_route_loading_audit_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/app/circuits.ts
- apps/web/src/app/circuitRoutes
- apps/web/src/features/CircuitMap.tsx
- docs/audits/circuit-route-loading-audit-2026-07-21.md
- packages/shared/src/domain/circuits.ts
- Current diagnostic: several circuit route files are 300 to 580 lines each, and all detailed route data may contribute to the initial bundle if imported eagerly.
- Current diagnostic: this is not yet proven to be a major byte problem compared with images and the main app chunk, so the first task should measure before changing architecture.

# AI Context
- Summary: Audit circuit data impact before optimizing route loading
- Keywords: request-chain-scaffold, audit circuit data impact before optimizing route loading, development-ready
- Use when: You need to implement or review the scaffolded workflow for Audit circuit data impact before optimizing route loading.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_172_measure_and_decide_on_circuit_route_lazy_loading`
