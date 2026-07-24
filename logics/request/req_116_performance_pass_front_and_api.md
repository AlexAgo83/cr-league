## req_116_performance_pass_front_and_api - Performance pass front and API
> From version: 0.4.5
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Cut the replay/asset payload: downscale and convert the oversized car sprite PNGs and the crl UI PNGs to WebP, so the game loads and renders with a fraction of today's image bytes and no visual regression.
- Defer non-critical front-end code: load circuit route data on demand per selected circuit instead of bundling all 25 tracks on the critical path, and memoize the GameApp shell so unrelated state changes stop rebuilding admin/overlay/menu trees.
- Stop wasted backend work on the mutation path: build league state once per request, stop over-fetching historical grand-prix decisions/JSON, and batch per-team writes.
- Get CPU-heavy and blocking work off the hot path: compute simulateRace before the write transaction (not while holding the row lock), and move the auth scrypt KDF off the event loop.
- Preserve behavior exactly: identical rendered output, identical API responses, and the race-integrity guarantees (in-transaction re-checks, row locks, rule errors) intact.

# Context
- TypeScript monorepo: apps/api (Fastify 5 + Prisma 6 + Postgres), apps/web (React 19 + Vite), packages/shared (domain + seeded simulation).
- This is a turn-based racing-league game; the replay/circuit-map layer is the heaviest front-end screen and is already well-optimized at the per-frame level (imperative refs, WeakMap geometry cache, throttled state) — that loop must not be touched.
- No new runtime dependencies are wanted; asset work reuses the existing webp pipeline and car-assets tooling.
- Database indexes were audited and found adequate — this pass adds no schema/index changes.
- The single-node Render deploy makes event-loop blocking (simulateRace, scryptSync) a real cross-request stall, not a theoretical one.

# Acceptance criteria
- AC1: Car sprite masters are downscaled and served as WebP, cutting the per-replay image bytes by roughly an order of magnitude, with the replay rendering visually unchanged.
- AC2: The crl UI PNGs are converted to WebP with no visual regression in Garage/Plan/Championship screens.
- AC3: The auth KDF no longer blocks the event loop — scryptSync is replaced by async crypto.scrypt on the request path — with auth behavior (hash format, verify results, legacy path) unchanged.
- AC4: Circuit route data is loaded on demand for the selected circuit; the eager circuit-routes chunk is off the first-paint critical path; the correct circuit still renders for every round.
- AC5: The GameApp shell is memoized so unrelated state changes no longer rebuild the admin view, overlays, and menus; adminView is not constructed for non-admins; rendered output and behavior are unchanged.
- AC6: getLeagueState is built at most once per mutation and its history query no longer fetches decisions/qualifyingRuns/forecast for past grand prixes; API responses are byte-identical to today.
- AC7: Per-team write loops in resolve, season rollover, and bot purchases are batched, reducing in-transaction round-trips, with identical resulting points/credits/state.
- AC8: simulateRace is computed before the write transaction opens; the transaction performs only validation and writes; race-integrity guarantees and simulation outputs are preserved verbatim.
- AC9: Typecheck, lint, the full unit suite (315+ passing), balance:gate, and logics:validate all stay green, with no weakened assertions.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/features/carAssets.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/app/circuitRoutes/index.ts
- apps/web/src/app/circuits.ts
- apps/web/src/app/App.tsx
- apps/web/src/features/AssetImage.tsx
- apps/web/vite.config.ts
- apps/api/src/features/leagues/storeCore.ts
- apps/api/src/features/leagues/utils.ts
- apps/api/src/features/leagues/transactionHelpers.ts
- prisma/schema.prisma
- Audit finding (front): public/assets/cars totals ~18 MB; each car top.png is ~1200x480 (~0.6-1.1 MB) and is referenced twice per car (CircuitMap.tsx:695 and :718); a replay renders ~10-16 cars => ~10 MB of PNG fetched/decoded, rendered at ~1/10 size (markerScale, CircuitMap.tsx:352).
- Audit finding (front): public/assets/crl totals ~14 MB of 250-500 KB PNGs served via AssetImage; the repo already ships .webp for some art (report-victory.webp, plan-header).
- Audit finding (front): circuitRoutes/index.ts statically imports all 25 route files; circuits.ts imports that barrel at module-eval and is on the critical path, so dist/assets/circuit-routes-*.js (~217 KB raw, ~47 KB gzip, 7445 lines) loads on first paint though only one circuit renders per round (circuitForRound, circuits.ts:46).
- Audit finding (front): no React.memo anywhere in src; GameApp (App.tsx:102) re-invokes action factories (App.tsx:305/326/339/380) and rebuilds commonOverlays (:620), adminView (:702), setupTopbar (:615), profileMenu (:769) on every state change; the per-frame replay loop is already imperative (refs + WeakMap geometry cache) and must NOT be changed.
- Audit finding (api): getLeagueState (storeCore.ts:317) issues one 3-level nested query (teams + all grand prixes + all decisions) and is called 3-5x per mutation (e.g. submitDecision at 586/633/638/641; resolveCurrentGrandPrix at 745/758/761/769/821; buy/sell/livery/name call it twice).
- Audit finding (api): the getLeagueState include (storeCore.ts:322-327) over-fetches decisions plus result/qualifyingRuns/forecast JSON for every historical grand prix, though only the current GP uses them; the history mapping (361-368) reads only id/name/season/round/status/result.
- Audit finding (api): resolveCurrentGrandPrix runs simulateRace (synchronous, CPU-heavy) inside runWrite while holding lockGrandPrixRow (SELECT ... FOR UPDATE) at storeCore.ts:767-819, blocking the single-node event loop and extending lock hold time.
- Audit finding (api): per-team write loops issue up to ~3N sequential queries inside transactions (resolveCurrentGrandPrix 800-818, startNextGrandPrix 861-878, buyBotCards/buyBotCars 1149-1186); an updateMany-with-guard pattern already exists at 493 and 1177.
- Audit finding (api): scryptSync (utils.ts:35 and :49) runs synchronously on the auth request path (recoverProfile, ensureProfileOwnership, createProfile), blocking the event loop for the KDF duration.
- Audit finding (api): database indexes were checked against every where/orderBy/join and are adequate; there is NO missing-index work in this pass.
- Current baseline: 315 unit tests passing, lint clean, tsc strict; CI runs npm audit, lint, typecheck, balance:gate, logics:validate. The repo already downscales/optimizes some art to webp and uses a car-assets pipeline (scripts/generate-car-assets.py, docs/car-assets-runbook.md).

# AI Context
- Summary: Performance pass front and API
- Keywords: request-chain-scaffold, performance pass front and api, development-ready
- Use when: You need to implement or review the scaffolded workflow for Performance pass front and API.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_279_downscale_and_webp_the_car_sprite_assets`
- `item_280_convert_crl_ui_pngs_to_webp`
- `item_281_move_the_auth_scrypt_kdf_off_the_event_loop`
- `item_282_lazy_load_circuit_route_data_per_selected_circuit`
- `item_283_memoize_the_gameapp_shell_to_stop_unrelated_rebuilds`
- `item_284_cut_getleaguestate_rebuilds_and_historical_over_fetch`
- `item_285_batch_per_team_write_loops_in_resolve_rollover_and_bot_purchases`
- `item_286_compute_simulaterace_before_the_write_transaction`
