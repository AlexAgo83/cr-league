## req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation - Post-remediation hardening: submit/sell concurrency, client security and privacy, accessibility, data-model integrity, and config validation
> From version: 0.3.27
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Post-remediation hardening
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Close the last JSON-column concurrency axis: re-validate card ownership inside the locked transaction for submitDecision and sellCard so a concurrent sell/submit can never attach or keep a card that is no longer valid, and cover the sell-vs-submit pair in the Postgres integration suite.
- Harden the web client's security and privacy: sanitize livery colors before injecting them into the map, stop announcing/logging the raw recovery code, refuse plaintext API origins in production, and add a clickjacking/credential-exposure baseline (CSP and secret storage).
- Meet an accessibility baseline for the replay: honor prefers-reduced-motion, fix the modal focus trap, and make the speed menu behave like the listbox its ARIA advertises.
- Tighten the data model: index and FK the RaceDecision references, constrain the enum-like string columns, and make the new index migration deploy without locking the teams table.
- Validate required environment on boot and declare the admin envs so production cannot silently misconfigure CORS or the admin surface.

# Context
- submitDecision already locks the GP row and re-checks status (store.ts:542-547); the remaining gap is that the card-ownership guard at store.ts:538 runs on the pre-transaction team read. Move the cards.includes check (and the qualifying-lock check) inside the runWrite block after a fresh team read; because sellCard locks the team row and submitDecision locks the GP row, also take lockTeamRow in submitDecision (or re-read and re-validate cards under it) so the two operations serialize on the same row. sellCard's in-use guards (store.ts:433-438) should likewise re-check fresh decisions/qualifying inside its transaction. Add a sell-vs-submit integration test to app.postgres.test.ts alongside the existing sell-vs-sell coverage.
- LiveryPlate.tsx:6-13 already has the safeHex helper; export it (or move it to a shared web util) and run car.livery.primary/secondary through it in CircuitMap.tsx:456 before building carStyle, mirroring the plate. No visual change for valid liveries.
- copyProfileCode (sessionActions.ts:126) should show a generic copied confirmation (tt key only) and never interpolate the code into the announced/persisted status; the code is already placed on the clipboard by copyText, so the display string does not need it.
- appStorage.ts:3 should require VITE_API_BASE_URL (throw at module load when missing in a production build) or default to an https origin, and reject non-https bases outside dev, so credential-bearing POSTs cannot go cleartext. Keep the localhost default only for dev mode.
- Add a prefers-reduced-motion gate: read matchMedia('(prefers-reduced-motion: reduce)') once and default the replay clock to paused (no auto-rAF) and the ambient animateMotion to static when reduce is set, per ADR-006. Modal.tsx:77 should filter the focusable query by visibility (offsetParent/getClientRects().length) and focus the first visible control instead of the dialog container. The ReplayStageOverlay speed menu should either implement arrow-key roving focus per the listbox pattern or drop the listbox/option roles and be a plain button menu.
- index.html should carry a restrictive Content-Security-Policy meta including frame-ancestors 'none' (or the host should send the header); given recoveryCode/claimCode live in localStorage, also consider scoping those secrets to sessionStorage. Keep the CSP compatible with the inlined Vite assets.
- Data model: add @@index([teamId]) to RaceDecision; model rivalTeamId as a real relation to Team with onDelete: SetNull plus an index (or clean it up on team delete) so deleting a team cannot leave a dangling rival the sim reads; convert status/kind/cadence/approach/preparation/pitStrategy to Prisma enums or add CHECK constraints so an invalid value cannot persist and crash the as RaceInput casts; and split the profileId index into a CREATE INDEX CONCURRENTLY migration run outside a transaction so db:deploy does not write-lock teams on a populated database.
- config.ts should throw on missing WEB_ORIGIN and DATABASE_URL outside development (fail fast rather than silently defaulting to localhost), and render.yaml should declare ADMIN_TOKEN and ADMIN_EMAILS so the admin routes and admin flag work in production. Keep the dev defaults for local runs.
- Out of scope: full session auth or CSRF tokens (the claim-code model stays); rewriting the replay animation; broad schema migration beyond the referenced columns; new dependencies or a rate-limit/CSP infrastructure layer.

# Acceptance criteria
- AC1: submitDecision and sellCard re-validate card ownership/in-use state inside their locked transactions on a fresh read, and a Postgres integration test proves a concurrent sell-then-submit cannot attach or keep an invalid card.
- AC2: Livery colors are sanitized before map injection, the recovery code is never interpolated into announced or persisted status text, non-https API bases are refused in production, and index.html carries a CSP with frame-ancestors restriction.
- AC3: The replay honors prefers-reduced-motion (defaults to no auto-motion when reduce is set), the modal focus trap skips hidden elements and focuses the first visible control, and the speed menu either implements listbox keyboard navigation or drops the listbox roles.
- AC4: RaceDecision.teamId is indexed, rivalTeamId is a FK/relation with onDelete handling and an index, the enum-like columns are DB-constrained, and the profileId index migration runs without write-locking teams.
- AC5: The API fails fast on missing WEB_ORIGIN/DATABASE_URL outside development, and render.yaml declares ADMIN_TOKEN and ADMIN_EMAILS.
- AC6: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass, and the Postgres integration lane stays green.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup.md
- logics/request/req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation.md
- logics/request/req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/persistence.ts
- apps/api/src/config.ts
- apps/api/src/app.ts
- prisma/schema.prisma
- render.yaml
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/LiveryPlate.tsx
- apps/web/src/app/sessionActions.ts
- apps/web/src/app/appStorage.ts
- apps/web/src/features/replay/useReplayClock.ts
- apps/web/src/features/replay/ReplayStageOverlay.tsx
- apps/web/src/ui/Modal.tsx
- apps/web/index.html
- Fourth audit sweep on 2026-07-22 after req_085/req_086/req_087 all landed (HEAD 611bd57), targeting surfaces the prior passes did not open. Findings. (1) submit-vs-sell card race: submitDecision now locks the GP row and re-checks status inside runWrite (store.ts:542-547), closing the decision-vs-resolve race, but the card-ownership guard (store.ts:538, cardId && !team.cards.includes(cardId)) reads team.cards from the pre-transaction requireTeamClaim read (store.ts:532) and is never re-checked inside the lock; submitDecision locks the GP row while sellCard locks the team row (different rows, no mutual exclusion), so a concurrent sell-then-submit can attach a just-sold card to the plan. sellCard's own in-use guards (store.ts:433-438) are the mirror image and are only covered by sell-vs-sell in app.postgres.test.ts; sell-vs-submit is uncovered. (2) Livery colors are injected unsanitized: CircuitMap.tsx:456 sets --car-primary/--car-secondary straight from car.livery.primary/secondary while LiveryPlate.tsx:6-13 sanitizes identical values through safeHex(/^#[0-9a-f]{6}$/). (3) copyProfileCode (sessionActions.ts:126) interpolates the raw long-lived recovery code into the aria-live status string and notification history. (4) API_BASE_URL (appStorage.ts:3) falls back to plaintext http://localhost:4874, so a missing VITE_API_BASE_URL at build time posts claimCode/recoveryCode bodies over unencrypted HTTP. (5) No prefers-reduced-motion: useReplayClock auto-plays via requestAnimationFrame (useReplayClock.ts:128) and CircuitMap ambient cars use SVG animateMotion (CircuitMap.tsx:484); neither consults matchMedia and the CSS reduce-block only disables decorative accents. (6) Modal focus trap (ui/Modal.tsx:77) selects focusable elements without filtering hidden/zero-size ones and focuses the dialog container rather than the first control. (7) The replay speed menu (ReplayStageOverlay.tsx:312-327) uses role=listbox/option with no arrow-key roving focus. (8) index.html has no Content-Security-Policy or frame-ancestors, so the app is iframe-embeddable (clickjacking) while recoveryCode/claimCode persist in localStorage. (9) RaceDecision.teamId has no standalone index (schema.prisma:93); the composite unique (grandPrixId, teamId) cannot lead on teamId, so the Team->RaceDecision cascade and teamId filters seq-scan. (10) RaceDecision.rivalTeamId (schema.prisma:98) stores a Team id with no FK/relation/onDelete/index, leaving dangling references that simulateRace consumes. (11) Enum-like columns (status, kind, cadence, approach, preparation, pitStrategy) are free-text String with no DB constraint, so an invalid value can persist and later crash the sim's as RaceInput casts (e.g. store.ts:719-725). (12) The profileId index migration (prisma/migrations/20260722110000_add_team_profile_index) uses non-concurrent CREATE INDEX, taking a write lock on teams during db:deploy. (13) No required-env validation (config.ts:16-35): WEB_ORIGIN silently defaults to http://localhost:4873 so a missing prod env makes CORS reject the real frontend with no startup error (app.ts:22-32), and render.yaml never sets ADMIN_TOKEN/ADMIN_EMAILS so admin token routes 503 and the admin flag is never granted in production.

# AI Context
- Summary: Post-remediation hardening: submit/sell concurrency, client security and privacy, accessibility, data-model integrity, and config validation
- Keywords: request-chain-scaffold, post-remediation hardening: submit/sell concurrency, client security and privacy, accessibility, data-model integrity, and config validation, development-ready
- Use when: You need to implement or review the scaffolded workflow for Post-remediation hardening: submit/sell concurrency, client security and privacy, accessibility, data-model integrity, and config validation.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_197_close_the_submit_vs_sell_card_race`
- `item_198_client_security_and_privacy_hardening`
- `item_199_replay_and_dialog_accessibility_baseline`
- `item_200_racedecision_data_model_integrity`
- `item_201_required_env_validation_and_admin_config`
