## item_349_polish_solo_multiplayer_affordances_and_reset_safety - Polish solo/multiplayer affordances and reset safety
> From version: 0.6.1
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 95%
> Complexity: Medium
> Theme: Mode clarity and data safety
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A local solo save can be confusing if the UI looks identical to a private league or if profile logout affects it unexpectedly.
- Players need an explicit way to leave or reset local solo without destroying multiplayer data.

# Scope
- In:
  - Show a compact `Solo local` indicator in the topbar or profile/home surface when the active game is local solo.
  - Add setup copy that frames Solo as "local to this device" and Multiplayer as a private league with invite code.
  - Add a deliberate reset/forget solo action with confirmation copy that only clears the dedicated solo save key.
  - Ensure existing multiplayer forget/logout paths leave solo storage untouched unless the new solo reset path is invoked.
  - Add tests for solo reset and multiplayer logout isolation.
- Out:
  - Settings for multiple solo profiles.
  - Migration UI for old solo saves, unless the implementation introduces a versioned key and needs a simple guard.

# Progress notes
- 2026-07-28: Workstream launched. Initial implementation focus is copy, `Solo local` affordance, reset confirmation, and proving multiplayer logout/forget flows do not touch solo storage.
- 2026-07-28: `Solo local` is now visible in the game topbar for local solo state, and the menu exposes a confirmed reset that only clears the solo save. The focused App test proves reset returns to Solo / Multiplayer setup without fetch.

# Acceptance criteria
- AC5: Multiplayer logout and forget flows do not corrupt solo progress.
- AC7: Solo is visibly identified as local to this device.
- AC8: Focused tests and typecheck pass.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC5: Multiplayer logout and forget flows do not corrupt solo progress.
- request-AC7 -> This backlog slice. Proof: AC7: Solo is visibly identified as local to this device.
- request-AC8 -> This backlog slice. Proof: AC8: Focused tests and typecheck pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Follow `adr_009_shared_local_and_network_league_engine`; this slice should not introduce presentation-only forks of game behavior.

# Links
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): `adr_009_shared_local_and_network_league_engine`
- Request: `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`
- Primary task(s): `task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode`

# AI Context
- Summary: Polish solo/multiplayer affordances and reset safety
- Keywords: scaffolded-backlog, polish solo/multiplayer affordances and reset safety, implementation-ready
- Use when: Implementing the scaffolded slice for Polish solo/multiplayer affordances and reset safety.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
