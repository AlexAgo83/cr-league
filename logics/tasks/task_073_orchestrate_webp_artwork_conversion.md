## task_073_orchestrate_webp_artwork_conversion - Orchestrate WebP artwork conversion
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the WebP artwork conversion request chain and keep sibling implementation slices linked.
- This pass uses local `cwebp` only; no image pipeline dependency or UI redesign is introduced.

# Plan
- [x] 1. Record current source and dist sizes for the targeted largest PNG assets.
- [x] 2. Generate WebP candidates using an available local or npx image tool without adding a permanent dependency.
- [x] 3. Keep only candidates that materially reduce size at acceptable visual quality.
- [x] 4. Update CSS and component references using the smallest code change.
- [x] 5. Run build, typecheck, lint, tests, and representative image-loading checks; record before/after sizes.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_170_convert_largest_artwork_assets_to_webp`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> Seven WebP variants were generated at the original `1672x941` dimensions and each is 74.3%-81.3% smaller than its PNG source.
- request-AC2 -> CSS and React references now point to the targeted `.webp` files; production build includes those WebP files.
- request-AC3 -> The seven targeted PNG files were removed from `public` because no runtime fallback is needed for the modern browser target.
- request-AC4 -> `apps/web/dist` decreased from 22720 KB to 19264 KB; `apps/web/public/assets/crl` decreased from 19220 KB to 14832 KB.
- request-AC5 -> Proof: typecheck, lint, tests, build, e2e, and Logics validation pass.

# Validation
- `npm run build` passed; target WebP files appear in `apps/web/dist/assets/crl`.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 222 passed, 4 skipped.
- `npm run test:e2e` passed: 4 Playwright tests.
- `sips` dimension check confirmed every converted target remains `1672x941`.
- `npm run logics:validate` passed after workflow closeout; remaining warnings are unrelated open-doc Mermaid/traceability warnings.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Size Evidence
- `report-victory`: 835982 B PNG -> 214882 B WebP, 74.3% smaller.
- `onboarding-chrono`: 721361 B PNG -> 155626 B WebP, 78.4% smaller.
- `onboarding-setup`: 633729 B PNG -> 122138 B WebP, 80.7% smaller.
- `onboarding-pit-wall`: 616132 B PNG -> 115392 B WebP, 81.3% smaller.
- `plan-header`: 612146 B PNG -> 146244 B WebP, 76.1% smaller.
- `onboarding-season`: 546335 B PNG -> 112168 B WebP, 79.5% smaller.
- `garage-empty`: 509514 B PNG -> 104736 B WebP, 79.4% smaller.

# Report
- Converted seven largest targeted CRL artwork PNGs to WebP and updated their CSS/React references.
- Removed the replaced PNGs from `public` to avoid copying both formats into `dist`.
- No permanent dependency, visual redesign, or runtime image pipeline was added.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_170_convert_largest_artwork_assets_to_webp`
- Related request(s): `req_072_serve_large_web_artwork_as_webp`

# AI Context
- Summary: Orchestrate WebP artwork conversion
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_072_serve_large_web_artwork_as_webp`
- Product brief(s): `prod_036_webp_artwork_delivery_product_brief`
- Architecture decision(s): (none yet)
