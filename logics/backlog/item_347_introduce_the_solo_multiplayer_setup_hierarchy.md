## item_347_introduce_the_solo_multiplayer_setup_hierarchy - Introduce the Solo / Multiplayer setup hierarchy
> From version: 0.6.1
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Setup flow and navigation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current setup asks the player to create or join a league before the product has explained the broader choice between local solo and private multiplayer.
- Create / Join remains valid for multiplayer, but it should be one level deeper than the mode choice.

# Scope
- In:
  - Add a setup mode layer that presents Solo and Multiplayer as the first no-active-game choice immediately after the splash/root entry.
  - Move the existing LeagueSetupView create/join/saved-claims experience behind the Multiplayer branch with a back action to the mode choice.
  - Implement the confirmed profile ordering: Solo is available before profile setup; Multiplayer keeps the existing profile create/recover flow before league create/join.
  - Add en/fr copy for Solo, Multiplayer, local-only explanation, and back/navigation labels.
  - Add tests proving the top-level no-game setup shows Solo/Multiplayer and that Multiplayer still reaches the existing create/join UI.
- Out:
  - Visual redesign of all setup screens.
  - Multiple solo save slots.
  - Any backend change for multiplayer.

# Progress notes
- 2026-07-28: Workstream launched. Initial implementation focus is the Solo / Multiplayer entry point, preserving the existing Multiplayer profile and Create / Join subflow while Solo remains profile-free.
- 2026-07-28: Setup hierarchy now reaches an actual local solo league before profile setup. The AppShell guard explicitly allows `solo-local` without a profile, while the Multiplayer branch still preserves the existing profile and league setup path.

# Acceptance criteria
- AC1: Create / Join is no longer the first setup choice.
- AC2: Multiplayer preserves the current create/join/saved-league flow.
- AC3: Solo can be selected and started before creating or recovering a multiplayer profile.
- AC7: English and French labels make the mode distinction clear.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Create / Join is no longer the first setup choice.
- request-AC2 -> This backlog slice. Proof: AC2: Multiplayer preserves the current create/join/saved-league flow.
- request-AC3 -> This backlog slice. Proof: AC3: Solo can be selected without first creating a multiplayer profile.
- request-AC7 -> This backlog slice. Proof: AC7: English and French labels make the mode distinction clear.
- request-AC8 -> This backlog slice. Proof: AC7: English and French labels make the mode distinction clear.
- request-AC4 -> This backlog slice. Evidence needed: In solo mode, the first playable loop works locally through at least briefing, plan editing, chrono/qualifying, directive lock, GP resolution, replay/report viewing, next Grand Prix, garage card purchase/sale, livery update, and team rename.
- request-AC5 -> This backlog slice. Evidence needed: Solo progress survives reload via a single versioned local storage save and is isolated from multiplayer profile/session/claim storage. Forgetting or logging out of a multiplayer profile does not corrupt solo progress unless a dedicated solo reset command is used.
- request-AC6 -> This backlog slice. Evidence needed: Solo mode never calls fetch/api() for solo-only actions. Tests prove this by running solo setup and at least one solo GP action with fetch mocked to fail if called.

# Decision framing
- Product framing: Not needed
- Architecture framing: Follow `adr_009_shared_local_and_network_league_engine` for the app mode boundary between shared engine and persistence adapters.

# Links
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): `adr_009_shared_local_and_network_league_engine`
- Request: `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`
- Primary task(s): `task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode`

# AI Context
- Summary: Introduce the Solo / Multiplayer setup hierarchy
- Keywords: scaffolded-backlog, introduce the solo / multiplayer setup hierarchy, implementation-ready
- Use when: Implementing the scaffolded slice for Introduce the Solo / Multiplayer setup hierarchy.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode`

# Notes
- Task `task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode` was finished via `logics-manager flow finish task` on 2026-07-28.
