## item_347_introduce_the_solo_multiplayer_setup_hierarchy - Introduce the Solo / Multiplayer setup hierarchy
> From version: 0.6.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Setup flow and navigation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current setup asks the player to create or join a league before the product has explained the broader choice between local solo and private multiplayer.
- Create / Join remains valid for multiplayer, but it should be one level deeper than the mode choice.

# Scope
- In:
  - Add a setup mode layer that presents Solo and Multiplayer as the first no-active-game choice.
  - Move the existing LeagueSetupView create/join/saved-claims experience behind the Multiplayer branch with a back action to the mode choice.
  - Decide and implement the profile ordering: preferred V1 is Solo available without profile, Multiplayer requiring the existing profile flow.
  - Add en/fr copy for Solo, Multiplayer, local-only explanation, and back/navigation labels.
  - Add tests proving the top-level no-game setup shows Solo/Multiplayer and that Multiplayer still reaches the existing create/join UI.
- Out:
  - Visual redesign of all setup screens.
  - Multiple solo save slots.
  - Any backend change for multiplayer.

# Acceptance criteria
- AC1: Create / Join is no longer the first setup choice.
- AC2: Multiplayer preserves the current create/join/saved-league flow.
- AC3: Solo can be selected without first creating a multiplayer profile.
- AC7: English and French labels make the mode distinction clear.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Create / Join is no longer the first setup choice.
- request-AC2 -> This backlog slice. Proof: AC2: Multiplayer preserves the current create/join/saved-league flow.
- request-AC3 -> This backlog slice. Proof: AC3: Solo can be selected without first creating a multiplayer profile.
- request-AC7 -> This backlog slice. Proof: AC7: English and French labels make the mode distinction clear.
- request-AC8 -> This backlog slice. Proof: AC7: English and French labels make the mode distinction clear.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): (none yet)
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
