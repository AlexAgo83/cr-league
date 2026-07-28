## item_348_build_local_solo_state_persistence_and_action_adapter - Build local solo state, persistence, and action adapter
> From version: 0.6.1
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 88
> Progress: 25%
> Complexity: High
> Theme: Local solo game loop
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current game loop assumes API-backed league mutations, so a local solo mode needs a local source of truth and local implementations of the same player actions.
- Solo must not accidentally reuse multiplayer claims or profile storage.
- The engine rules must not be duplicated in the web app; solo and multiplayer need one shared mutable league model so race, garage, and team behavior do not drift.

# Scope
- In:
  - Extract or build shared league modules under `packages/shared/src/domain/`, with `leagueFactory.ts` for initial state creation and `leagueEngine.ts` for deterministic state transitions.
  - The shared engine covers at least `createLeagueState`, `submitDecision`, `runQualifying`, `resolveGrandPrix`, `startNextGrandPrix`, `buyCard`, `sellCard`, `updateLivery`, and `updateTeamName`.
  - Refactor API-backed multiplayer to call the shared engine around DB load/persist without changing public API behavior.
  - Create a local solo LeagueState factory using the shared LeagueState shape: one human team, bot teams, manual cadence, no league code, current GP round 1, default card shop, and a local player marker.
  - Persist solo LeagueState under one dedicated versioned local storage key, recommended `cr-league-solo-save-v1`, with schemaVersion, createdAt, updatedAt, and state payload, separate from PROFILE_SESSION_KEY, PLAYER_CLAIMS_KEY, and ACTIVE_PLAYER_CLAIM_KEY.
  - Add solo handlers that load local state, call the shared engine, update React state, and persist localStorage for directive submission, qualifying, race resolution, next Grand Prix, buy/sell card, buy car asset if currently exposed, livery update, and team rename.
  - Keep the local boundary small: App.tsx/AppShell should call either existing network persistence or local solo persistence based on an explicit game mode flag, while both paths use shared engine rules.
  - Add tests where fetch is mocked to throw and solo setup plus representative solo actions still succeed.
- Out:
  - Backend local-mode endpoints.
  - Cloud save or profile recovery for solo.
  - A separate solo-only simulation engine or duplicate web-only race/garage/team rules.
  - Service worker/PWA offline packaging.

# Progress notes
- 2026-07-28: Workstream launched. Initial implementation focus is shared engine extraction and a small persistence boundary so API and local solo both call shared league rules instead of duplicating game behavior.

# Acceptance criteria
- AC3: Solo can start or resume with the API unavailable.
- AC4: The first GP loop and common garage/team actions work locally.
- AC5: Solo persistence uses one versioned local save and is isolated from multiplayer storage.
- AC6: Tests prove solo actions do not call fetch/api().

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC3: Solo can start or resume with the API unavailable.
- request-AC4 -> This backlog slice. Proof: AC4: The first GP loop and common garage/team actions work locally.
- request-AC5 -> This backlog slice. Proof: AC5: Solo persistence is isolated from multiplayer storage.
- request-AC6 -> This backlog slice. Proof: AC6: Tests prove solo actions do not call fetch/api().
- request-AC8 -> This backlog slice. Proof: AC6: Tests prove solo actions do not call fetch/api().

# Decision framing
- Product framing: Not needed
- Architecture framing: `adr_009_shared_local_and_network_league_engine` is binding for this slice. Prefer shared engine extraction before wiring solo actions; use adapter code only for DB or localStorage persistence.

# Links
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): `adr_009_shared_local_and_network_league_engine`
- Request: `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`
- Primary task(s): `task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode`

# AI Context
- Summary: Build local solo state, persistence, and action adapter
- Keywords: scaffolded-backlog, build local solo state, persistence, and action adapter, implementation-ready
- Use when: Implementing the scaffolded slice for Build local solo state, persistence, and action adapter.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
