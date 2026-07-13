## item_007_define_grand_prix_core_loop_and_simulation_v1 - Define Grand Prix core loop and simulation V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Gameplay design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- CR League cannot be implemented safely until the first Grand Prix loop is concrete.
- The race simulation must be simple enough for V1, but rich enough to create understandable race stories.
- Replay and report outputs need a stable event model so the frontend can visualize and explain results.

# Scope
- In:
  - Grand Prix phase flow from briefing through preparation, resolution, replay, report, rewards, and next-race setup.
  - V1 simulation inputs and outputs.
  - Segment-based simulation model.
  - Event timeline format.
  - Replay and race report requirements.
  - One complete example Grand Prix.
  - V1 exclusions and implementation notes.
- Out:
  - production code.
  - exact numeric balance tuning.
  - final UI mockups.
  - 3D rendering.
  - live in-race interaction.
  - full card catalogue implementation.

# Acceptance criteria
- AC1: A reviewable spec exists at `logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md`.
- AC2: The spec describes the player-facing loop and the implementation-facing simulation contract.
- AC3: The spec defines how simulation results become replay events and report explanations.
- AC4: The spec preserves a small V1 scope and names explicit non-goals.
- AC5: The spec is validated by Logics lint/audit.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: bounded delivery slice.
- request-AC2 -> This backlog slice. Proof: promotable backlog item.
- request-AC3 -> This backlog slice. Proof: delivery chain includes a task-ready backlog item.
- request-AC4 -> This backlog slice. Proof: `spec_001_grand_prix_core_loop_and_simulation_v1` includes a complete Silver Ridge GP example with setup, choices, resolved weather, timeline, report summary, rewards, and next hook.
- request-AC5 -> This backlog slice. Proof: `spec_001_grand_prix_core_loop_and_simulation_v1` includes a V1 Non-goals section that excludes direct driving, live decisions, physics, pit-stop simulation, tire compound management, permanent upgrades, complex damage, public matchmaking, and 3D requirements.

# Decision framing
- Product framing: Required; this defines the first playable gameplay loop.
- Architecture framing: Light; the spec must remain compatible with lazy server-side race resolution.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_001_define_grand_prix_core_loop_and_simulation_v1`
- Primary task(s): `task_002_define_grand_prix_core_loop_and_simulation_v1`

# AI Context
- Summary: Define Grand Prix core loop and simulation V1
- Keywords: backlog, promote, slice, define grand prix core loop and simulation v1
- Use when: You need a bounded backlog item for Define Grand Prix core loop and simulation V1.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: The race loop is the core product risk; implementation should not start before this is explicit.

# Notes
- Generated from `prod_001_cr_league_product_brief` and expanded as the first gameplay design slice.
- Task `task_002_define_grand_prix_core_loop_and_simulation_v1` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_002_define_grand_prix_core_loop_and_simulation_v1`
