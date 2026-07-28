## item_348_build_local_solo_state_persistence_and_action_adapter - Build local solo state, persistence, and action adapter
> From version: 0.6.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Local solo game loop
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current game loop assumes API-backed league mutations, so a local solo mode needs a local source of truth and local implementations of the same player actions.
- Solo must not accidentally reuse multiplayer claims or profile storage.

# Scope
- In:
  - Create a local solo LeagueState factory using the shared LeagueState shape: one human team, bot teams, manual cadence, no league code, current GP round 1, default card shop, and a local player claim marker.
  - Persist solo LeagueState under dedicated local storage keys separate from PROFILE_SESSION_KEY, PLAYER_CLAIMS_KEY, and ACTIVE_PLAYER_CLAIM_KEY.
  - Add local handlers for directive submission, qualifying, race resolution, next Grand Prix, buy/sell card, buy car asset if currently exposed, livery update, and team rename by reusing shared/domain helpers where available.
  - Keep the local boundary small: App.tsx/AppShell should call either existing network actions or local solo actions based on an explicit game mode flag.
  - Add tests where fetch is mocked to throw and solo setup plus representative solo actions still succeed.
- Out:
  - Backend local-mode endpoints.
  - Cloud save or profile recovery for solo.
  - A separate solo-only simulation engine.

# Acceptance criteria
- AC3: Solo can start or resume with the API unavailable.
- AC4: The first GP loop and common garage/team actions work locally.
- AC5: Solo persistence is isolated from multiplayer storage.
- AC6: Tests prove solo actions do not call fetch/api().

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC3: Solo can start or resume with the API unavailable.
- request-AC4 -> This backlog slice. Proof: AC4: The first GP loop and common garage/team actions work locally.
- request-AC5 -> This backlog slice. Proof: AC5: Solo persistence is isolated from multiplayer storage.
- request-AC6 -> This backlog slice. Proof: AC6: Tests prove solo actions do not call fetch/api().
- request-AC8 -> This backlog slice. Proof: AC6: Tests prove solo actions do not call fetch/api().

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): (none yet)
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
