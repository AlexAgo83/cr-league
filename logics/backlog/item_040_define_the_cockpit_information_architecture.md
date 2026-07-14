## item_040_define_the_cockpit_information_architecture - Define the cockpit information architecture
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 92
> Progress: 100%
> Complexity: Medium
> Theme: UX structure
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current page stacks setup, race desk, dashboard, garage, standings, recap, replay, key moments, and report in one long flow.
- Players cannot immediately tell which panel is the main task, which is context, and which is post-race evidence.
- The lack of screen-level hierarchy makes the app feel unfinished even when the underlying loop works.

# Scope
- In:
  - Define the V0 screen model for the playable app: Course, Championship, Garage, and Result/Replay regions.
  - Decide which information belongs in the first viewport before and after a GP is resolved.
  - Specify desktop layout rules, mobile stacking order, and sticky or persistent action expectations if needed.
  - Name which existing panels should be merged, moved, renamed, or removed from the default flow.
  - Document the state model for briefing, ready, resolved, between-GP, and no-league setup states.
- Out:
  - New navigation routes.
  - Marketing or landing page layout.
  - Deep season management screens.
  - New gameplay mechanics or new API contracts.

# Acceptance criteria
- AC1: The IA plan names the primary surface for each game state and identifies the player's next action in that state.
- AC2: The plan defines desktop and mobile ordering for Course, Championship, Garage, and Result/Replay.
- AC3: The plan removes or consolidates at least one redundant panel from the current long stack.
- AC4: The plan names the post-GP information sequence: outcome first, explanation second, replay/report supporting evidence after.

# Direction to carry into implementation
- Baseline: follow the V2 mockup structure over the earlier blocky layout. The cockpit should feel like a composed command product, not only a set of dark cards.
- Screen zones:
  - Course: current GP state, next action, readiness, and the active directive.
  - Strategy: directive form or locked directive summary, selected card, and track/weather cues.
  - Championship: round, invite code, leader, standings, and readiness context.
  - Garage: credits, rewards, inventory, available card choices, and purchase state.
  - Result/Replay: final outcome, player consequence, classification, race readout, key moments, and report.
- Desktop order: fixed left rail for section markers, top header for race state and ticker pills, primary grid for Course/Strategy/Telemetry/Result, and a right-side timing/support column for Championship or Garage. The primary action must be visible without scanning the full page.
- Mobile order: Course, primary action, Strategy, Result/Replay when present, Garage, Championship, secondary settings.
- Post-GP sequence: outcome first, then why it happened, then classification, then race readout, then key moments/report, then next-GP action.
- Consolidation targets: merge duplicated dashboard/status cards into Course or Championship; move settings, forget team, and restart playtest out of the command row; remove any panel that repeats state already visible in the cockpit header.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The IA plan names the primary surface for each game state and identifies the player's next action in that state.
- request-AC3 -> This backlog slice. Proof: AC2: The plan defines desktop and mobile ordering for Course, Championship, Garage, and Result/Replay.
- request-AC4 -> This backlog slice. Proof: AC3: The plan removes or consolidates at least one redundant panel from the current long stack.
- request-AC7 -> This backlog slice. Proof: AC4: The plan names the post-GP information sequence: outcome first, explanation second, replay/report supporting evidence after.
- request-AC5 -> This backlog slice. Evidence needed: French and English UI copy come from the i18n catalogs for all redesigned surfaces, and a test or audit catches the main hardcoded-copy regressions.
- request-AC6 -> This backlog slice. Evidence needed: The web implementation is split into practical components or helpers for the redesigned surfaces, without speculative abstractions or new dependencies.
- request-AC8 -> This backlog slice. Evidence needed: Existing 3-GP e2e behavior and validation gates continue to pass after the redesign.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Define the cockpit information architecture
- Keywords: scaffolded-backlog, define the cockpit information architecture, implementation-ready
- Use when: Implementing the scaffolded slice for Define the cockpit information architecture.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_033_orchestrate_race_cockpit_redesign_v0`

# Notes
- Task `task_033_orchestrate_race_cockpit_redesign_v0` was finished via `logics-manager flow finish task` on 2026-07-14.
