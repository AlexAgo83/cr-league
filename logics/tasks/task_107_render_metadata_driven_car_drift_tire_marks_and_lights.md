## task_107_render_metadata_driven_car_drift_tire_marks_and_lights - Render metadata-driven car drift, tire marks, and lights
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_264_render_metadata_driven_car_drift_tire_marks_and_lights`

# Acceptance criteria
- AC1: Add compact runtime geometry for all 16 CRL v2 top assets.
- AC2: Normalize heading and scaling around the front axle and render cars from that origin.
- AC3: Sample rear-wheel positions into short-lived map-space SVG paths while drifting.
- AC4: Render subtle cones from the two detected front-light points.
- AC5: Cover normal and reverse-facing geometry plus trail/headlight DOM output.

# AC Traceability
- request-AC1 -> This task. Proof: `carRenderGeometryForId()` preserves each top canvas ratio and derives a bounded 18-22 map-unit wheelbase; `CircuitMap.test.ts` verifies distinct rendered widths.
- request-AC2 -> This task. Proof: geometry is normalized around the front-wheel midpoint and the test verifies rear wheels remain behind that pivot for regular and reverse-facing `car-014`.
- request-AC3 -> This task. Proof: `CircuitMap.tsx` samples both rear-wheel contacts into map-space SVG paths and renders two cones from metadata front-light points; `CircuitMap.render.test.tsx` verifies both outputs.
- request-AC4 -> This task. Proof: the implementation reuses the existing SVG animation loop with no dependency or renderer addition; focused tests, typecheck, lint, build, and desktop/mobile replay validation pass.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_107_render_metadata_driven_car_drift_tire_marks_and_lights.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_107_render_metadata_driven_car_drift_tire_marks_and_lights.md` after implementation.
- 301 tests passed; typecheck, ESLint, and production build passed; desktop/mobile replay browser flow passed after bypassing the unrelated pre-replay drive-panel width assertion
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Added metadata-derived car geometry with bounded wheelbase scaling and preserved canvas ratios.
- Moved replay drift rotation to the midpoint of the front axle.
- Added two ground-fixed rear tire paths and two metadata-positioned front light cones per car.
- Updated focused CircuitMap tests and `docs/car-assets-runbook.md`.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_264_render_metadata_driven_car_drift_tire_marks_and_lights`
- Related request(s): `req_106_render_metadata_driven_car_drift_tire_marks_and_lights`

# AI Context
- Summary: Implement metadata-scaled replay cars, front-axle drift, SVG tire marks, and headlights.
- Keywords: CircuitMap, replay, SVG, wheel contacts, front axle, headlights
- Use when: Implementing or validating the replay car rendering slice.
- Skip when: Work is unrelated to replay car visuals.

# Links
- Request: `req_106_render_metadata_driven_car_drift_tire_marks_and_lights`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
