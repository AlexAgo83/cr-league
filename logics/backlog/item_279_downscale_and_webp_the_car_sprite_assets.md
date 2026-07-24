## item_279_downscale_and_webp_the_car_sprite_assets - Downscale and WebP the car sprite assets
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- public/assets/cars totals ~18 MB; each car top.png is ~1200x480 (~0.6-1.1 MB).
- CircuitMap.tsx:695 and :718 reference each car's top.png twice, and a replay renders ~10-16 cars => ~10 MB fetched/decoded.
- Sprites are drawn at ~1/10 of their pixel size (markerScale, CircuitMap.tsx:352), so the masters are ~10x oversized.

# Scope
- In:
  - Downscale the car sprite masters to roughly their rendered footprint (~300 px wide) and encode as WebP via the existing asset pipeline (scripts/generate-car-assets.py / docs/car-assets-runbook.md).
  - Update carAssets.ts:74 (and any references) to point at the WebP variants.
  - Verify the replay renders visually unchanged across a representative set of cars.
- Out:
  - Changing the replay rendering code or the CircuitMap animation loop.
  - Adding an image-processing runtime dependency.
  - Re-authoring the sprite artwork.

# Acceptance criteria
- AC1: Per-replay car-image bytes drop by roughly an order of magnitude.
- AC2: The replay renders visually unchanged for a representative set of cars.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Per-replay car-image bytes drop by roughly an order of magnitude.
- request-AC9 -> This backlog slice. Proof: AC2: The replay renders visually unchanged for a representative set of cars.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Downscale and WebP the car sprite assets
- Keywords: scaffolded-backlog, downscale and webp the car sprite assets, implementation-ready
- Use when: Implementing the scaffolded slice for Downscale and WebP the car sprite assets.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
