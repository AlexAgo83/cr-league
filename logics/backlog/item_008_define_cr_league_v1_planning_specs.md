## item_008_define_cr_league_v1_planning_specs - Define CR League V1 planning specs
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Product planning
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The product brief and race simulation spec define the core, but implementation still needs aligned supporting specs.
- Without these docs, the first build may over-scope, make inconsistent economy/card choices, or create a replay/report UX that does not explain the simulation.

# Scope
- In:
  - Card Set V1 spec.
  - MVP Vertical Slice spec.
  - Race Report and Replay UX spec.
  - Economy V1 spec.
  - League Cadence and Absence Rules spec.
  - Technical Architecture V1 spec.
  - Art Direction Mini Brief.
  - Playtest Plan.
- Out:
  - production code.
  - final numeric balance tuning.
  - final visual assets.
  - deployment setup.
  - public launch planning.

# Acceptance criteria
- AC1: The eight planning specs are present under `logics/specs/`.
- AC2: Each planning spec includes V1 decisions, non-goals, and open questions.
- AC3: The specs provide enough detail to generate future implementation slices.
- AC4: Logics validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: specs `spec_002` through `spec_009` cover cards, MVP vertical slice, report/replay UX, economy, cadence, architecture, art direction, and playtest.
- request-AC2 -> This backlog slice. Proof: each spec includes concrete V1 decisions, non-goals, and open questions.
- request-AC3 -> This backlog slice. Proof: all specs reference or align with `prod_001_cr_league_product_brief`; gameplay specs also align with `spec_001_grand_prix_core_loop_and_simulation_v1`.
- request-AC4 -> This backlog slice. Proof: validation is recorded on `task_003_define_cr_league_v1_planning_specs`.

# Decision framing
- Product framing: Required.
- Architecture framing: Required for the technical architecture spec.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_002_define_cr_league_v1_planning_specs`
- Primary task(s): `task_003_define_cr_league_v1_planning_specs`

# AI Context
- Summary: Define CR League V1 planning specs
- Keywords: backlog, promote, slice, define cr league v1 planning specs
- Use when: You need a bounded backlog item for Define CR League V1 planning specs.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: These specs reduce the remaining V1 ambiguity before implementation begins.

# Notes
- Generated from `prod_001_cr_league_product_brief` after `spec_001_grand_prix_core_loop_and_simulation_v1`.
- Task `task_003_define_cr_league_v1_planning_specs` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_003_define_cr_league_v1_planning_specs`
