## req_131_solo_and_multiplayer_entry_split_with_local_solo_mode - Solo and multiplayer entry split with local solo mode
> From version: 0.6.1
> Schema version: 1.0
> Status: Draft
> Understanding: 95
> Confidence: 90
> Complexity: High
> Theme: Setup flow and local solo play
> Non-semantic edit: 2026-07-28 added implementation launch progress note only; request scope/status unchanged.
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace the current top-level league setup choice with a clear Solo / Multiplayer mode choice before profile or league setup whenever no active game context is loaded.
- Move the existing Create league / Join league / saved multiplayer league UI behind the Multiplayer choice without regressing existing multiplayer behavior.
- Add a first local solo mode that does not call the API for setup, rejoin, plan submission, qualifying, race resolution, next Grand Prix, garage purchases, livery updates, or team rename.
- Reuse the existing LeagueState shape, game screens, race preparation loop, replay/report surfaces, cards, garage, championship, and a shared engine in `packages/shared` instead of creating a separate game UI or duplicate solo engine.
- Persist solo progress locally so a player can close and reopen the browser and continue their solo season, while keeping multiplayer profile/session storage compatible with the current implementation.
- Make solo visibly distinct from multiplayer in setup and in the profile/home affordances so the player understands that solo is local to this device and private leagues still require multiplayer.

# Context
- The current no-league setup path lives in SetupGate.tsx and renders LeagueSetupView from SetupViews.tsx after a profileSession exists and leagueState is null.
- LeagueSetupView currently owns the Create / Join choice and saved league carousel. That screen is the correct Multiplayer sublevel and should not remain the top-level setup choice.
- createRaceActions in raceActions.ts currently sends API requests for create/join league, directive submission, and qualifying. leagueMutations.ts sends API requests for settings, resolve, next GP, cards, livery, and team rename. A local solo implementation needs a small local adapter or clearly separated local action path so solo never hits api().
- LeagueState is shared from packages/shared/src/domain/league.ts and already represents human and bot teams, current Grand Prix, decisions, card shop, action state, player claim, and history. Reusing this shape keeps Drive/Plan/Championship/Garage/Replay mostly intact.
- Confirmed architecture direction: extract the mutable league rules into shared modules such as `packages/shared/src/domain/leagueFactory.ts` and `packages/shared/src/domain/leagueEngine.ts`. The API should load/persist DB state around that engine; solo web should load/persist localStorage state around the same engine.
- The shared engine should cover at least `createLeagueState`, `submitDecision`, `runQualifying`, `resolveGrandPrix`, `startNextGrandPrix`, `buyCard`, `sellCard`, `updateLivery`, and `updateTeamName`. Do not hand-roll a second solo-only implementation of these rules in the web app.
- createInitialForm in raceFlow.ts has strong defaults: maxPlayers 8, fillWithBots true, manual cadence, 6 GP season, weather preparation. Solo should keep defaults small and fast: one human team plus bots, manual cadence, immediate local GP resolution, and no invite code.
- Profile setup currently requires API-backed profile creation/recovery before league setup. Confirmed product direction: root splash -> Solo / Multiplayer; Solo can start local without profile; Multiplayer continues through the existing profile and league setup gates.
- Stored multiplayer claims use PLAYER_CLAIMS_KEY and ACTIVE_PLAYER_CLAIM_KEY in appStorage.ts. Solo local persistence should use separate keys so local solo data cannot be mistaken for a multiplayer claim and logout/forget profile does not accidentally delete solo progress unless explicitly designed.
- Solo V1 uses a single versioned local save slot, recommended key `cr-league-solo-save-v1`, containing LeagueState plus minimal metadata such as schemaVersion, createdAt, and updatedAt.
- Existing tests in App.test.tsx cover splash, profile setup, league create/join, rejoin, garage, plan, replay, and season flow. Add focused tests for the mode split and no-network solo flows rather than duplicating every game screen test.
- Keep the implementation minimal: a single local solo season slot is enough for V1. No multi-save list, import/export, cloud sync, account recovery, offline PWA packaging, or public local campaign system in this slice.
- "No network" in V1 means no API calls for solo actions after the web app is loaded; it does not require service worker/PWA offline packaging.
- Deliver in three implementation waves: shared engine extraction without multiplayer behavior change; Solo / Multiplayer entry plus solo storage; solo action wiring, local badge/reset, and no-fetch tests.
- Implementation launch note: development has started at low progress (about 5-10%) with three parallel workstreams: shared engine extraction, setup hierarchy UI, and solo local storage/action adapter. No delivery slice is complete yet.

# Acceptance criteria
- AC1: When the app has no active game context, the first gameplay setup decision is Solo / Multiplayer, not Create league / Join league.
- AC2: Choosing Multiplayer shows the existing Create league, Join league, and saved multiplayer league flow with unchanged API behavior, validation, saved-claim switching, admin/changelog access, and copy.
- AC3: Choosing Solo starts or resumes a local solo league before profile setup and without requiring API availability, profile creation, recovery code, invite code, or multiplayer claim.
- AC4: In solo mode, the first playable loop works locally through at least briefing, plan editing, chrono/qualifying, directive lock, GP resolution, replay/report viewing, next Grand Prix, garage card purchase/sale, livery update, and team rename.
- AC5: Solo progress survives reload via a single versioned local storage save and is isolated from multiplayer profile/session/claim storage. Forgetting or logging out of a multiplayer profile does not corrupt solo progress unless a dedicated solo reset command is used.
- AC6: Solo mode never calls fetch/api() for solo-only actions. Tests prove this by running solo setup and at least one solo GP action with fetch mocked to fail if called.
- AC7: The UI labels and empty states clearly distinguish local Solo from Multiplayer/private league play in both English and French.
- AC8: npm run typecheck -w @cr-league/web, the relevant Vitest suites, npm run build -w @cr-league/web, and Logics validation pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): `adr_009_shared_local_and_network_league_engine`

# References
- Conversation on 2026-07-28: the current Create / Join league screen should move behind a Multiplayer choice, while the top-level setup offers Solo and Multiplayer. Solo should be a local mode without network calls.
- Conversation follow-up on 2026-07-28: confirmed Solo should be before profile, Solo V1 is local no-API rather than PWA offline, solo uses one versioned local save, reset solo is explicit, and league rules should be mutualized in `packages/shared` rather than duplicated.
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/scaffold/asynchronous-racing-league.json
- apps/web/src/app/App.tsx
- apps/web/src/app/AppShell.tsx
- apps/web/src/app/SetupGate.tsx
- apps/web/src/app/SetupViews.tsx
- apps/web/src/app/raceActions.ts
- apps/web/src/app/leagueMutations.ts
- apps/web/src/app/sessionActions.ts
- apps/web/src/app/appStorage.ts
- apps/web/src/app/raceFlow.ts
- apps/web/src/app/App.test.tsx
- apps/web/src/app/App.testFixtures.ts
- packages/shared/src/domain/league.ts
- packages/shared/src/domain/leagueFactory.ts (planned)
- packages/shared/src/domain/leagueEngine.ts (planned)
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css

# AI Context
- Summary: Solo and multiplayer entry split with local solo mode
- Keywords: request-chain-scaffold, solo and multiplayer entry split with local solo mode, development-ready
- Use when: You need to implement or review the scaffolded workflow for Solo and multiplayer entry split with local solo mode.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_347_introduce_the_solo_multiplayer_setup_hierarchy`
- `item_348_build_local_solo_state_persistence_and_action_adapter`
- `item_349_polish_solo_multiplayer_affordances_and_reset_safety`
