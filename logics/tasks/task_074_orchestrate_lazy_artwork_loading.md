## task_074_orchestrate_lazy_artwork_loading - Orchestrate lazy artwork loading
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
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read AssetImage and its call sites.
- [x] 2. Add lazy/async defaults with one priority escape hatch if needed.
- [x] 3. Update only eager-critical call sites.
- [x] 4. Run typecheck, lint, unit tests, and build.
- [x] 5. Record which images remain eager and why.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_171_add_lazy_defaults_to_assetimage`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `AssetImage` now defaults rendered images to `loading="lazy"` and `decoding="async"`.
- request-AC2 -> Priority callers can pass native image props; topbar brand images opt into `loading="eager"`.
- request-AC3 -> ModalHero, card art, directive art, and flags inherit the lazy default.
- request-AC4 -> Existing alt fallback and caller-provided alt text are unchanged.
- request-AC5 -> Proof: `npx vitest run apps/web/src/features/AssetImage.test.tsx`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` pass.

# Validation
- `npx vitest run apps/web/src/features/AssetImage.test.tsx` passed: 3 tests.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 216 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run logics:validate` passed after closeout; warnings are deferred/open-doc warnings only.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- `AssetImage` centralizes lazy loading and async decoding by default.
- First-screen brand images in `SetupTopbar` and `GameTopbar` remain eager because they are visible shell identity.
- No custom image loader, observer, or dependency was added.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_171_add_lazy_defaults_to_assetimage`
- Related request(s): `req_073_lazy_load_non_critical_web_artwork`

# AI Context
- Summary: Orchestrate lazy artwork loading
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_073_lazy_load_non_critical_web_artwork`
- Product brief(s): `prod_037_lazy_artwork_loading_product_brief`
- Architecture decision(s): (none yet)
