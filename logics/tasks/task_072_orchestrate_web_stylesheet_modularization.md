## task_072_orchestrate_web_stylesheet_modularization - Orchestrate web stylesheet modularization
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
- Orchestrate the stylesheet modularization request chain and keep sibling implementation slices linked.
- This pass is mechanical CSS extraction only: no class renames, no visual redesign, and no new styling dependency.

# Plan
- [x] 1. Inventory layout.css sections and choose the lowest-risk feature blocks to extract.
- [x] 2. Move one feature block at a time into a dedicated CSS file, preserving selector order.
- [x] 3. Run build after the first extraction, then continue with the remaining selected blocks.
- [x] 4. Run lint, typecheck, tests, build, and representative e2e flows or screenshots.
- [x] 5. Record the before/after line counts and any CSS bundle change in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_169_extract_feature_css_from_layout_css`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `layout.css` was reduced from 8214 to 4277 lines by extracting eight ordered CSS files, including `championship.css`, `garage.css`, and `replay-report.css`.
- request-AC2 -> Shared tokens, reset/base, shell, buttons, panels, and modal primitives remain in `tokens.css`, `base.css`, and `layout.css`.
- request-AC3 -> The extracted CSS reconstructs to the previous stylesheet with whitespace normalized, and representative e2e flows passed.
- request-AC4 -> CSS files are imported once in deterministic order from `main.tsx`; production CSS remained `141.35 kB` / `25.10 kB gzip`.
- request-AC5 -> Proof: typecheck, lint, tests, build, e2e, and Logics validation pass.

# Validation
- `npm run build` passed after the first extraction and after the final extraction; production CSS remained `141.35 kB` / `25.10 kB gzip`.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 222 passed, 4 skipped.
- `npm run test:e2e` passed after the final extraction: 4 Playwright tests.
- CSS reconstruction check passed with whitespace normalized against `HEAD:apps/web/src/styles/layout.css`.
- `npm run logics:validate` passed after workflow closeout; remaining warnings are unrelated open-doc Mermaid/traceability warnings.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Extracted `championship.css`, `garage.css`, `replay-report.css`, `responsive.css`, `pit-wall.css`, `paper-material.css`, `directive-telemetry.css`, and `plan-steps.css`.
- Kept `layout.css` as the shared shell/base layout stylesheet.
- No selector renames, style redesign, or dependencies were added.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_169_extract_feature_css_from_layout_css`
- Related request(s): `req_071_modularize_the_large_web_layout_stylesheet`

# AI Context
- Summary: Orchestrate web stylesheet modularization
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_071_modularize_the_large_web_layout_stylesheet`
- Product brief(s): `prod_035_web_stylesheet_modularization_product_brief`
- Architecture decision(s): (none yet)
