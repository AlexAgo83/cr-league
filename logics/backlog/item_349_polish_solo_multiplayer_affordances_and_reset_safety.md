## item_349_polish_solo_multiplayer_affordances_and_reset_safety - Polish solo/multiplayer affordances and reset safety
> From version: 0.6.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Mode clarity and data safety
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A local solo save can be confusing if the UI looks identical to a private league or if profile logout affects it unexpectedly.
- Players need an explicit way to leave or reset local solo without destroying multiplayer data.

# Scope
- In:
  - Show a compact Solo/local indicator in the topbar or profile/home surface when the active game is local solo.
  - Add a deliberate reset/forget solo action with confirmation copy that only clears solo storage.
  - Ensure existing multiplayer forget/logout paths leave solo storage untouched unless the new solo reset path is invoked.
  - Add tests for solo reset and multiplayer logout isolation.
- Out:
  - Settings for multiple solo profiles.
  - Migration UI for old solo saves, unless the implementation introduces a versioned key and needs a simple guard.

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
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): (none yet)
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
