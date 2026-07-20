## item_151_readability_papercuts_attempt_rank_labels_and_key_moment_variety - Readability papercuts: attempt rank labels and key-moment variety
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90
> Confidence: 85
> Progress: 85%
> Complexity: Low
> Theme: Race learning and feedback
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The LAP TIMES panel labels the player's own attempts P1/P2/P3 in the same badge style as race positions, and the report's key moments can show several identical same-lap lines plus the player's own finish as a highlight.

# Scope
- In:
  - Replace the P-rank badges on chrono attempts with attempt ordinals or best-time markers, in both locales.
  - In the key-moments selection, collapse identical same-lap event types into one grouped line and prefer event-type variety when filling the five slots; keep chronological order.
  - Extend the existing report/helpers tests for the grouping rule.
- Out:
  - Changing which events the simulation emits or their severity.
  - The verdict block and recap cards (req_060).

# Acceptance criteria
- AC1: Chrono attempts no longer carry race-position styling or labels.
- AC2: Key moments show no duplicate same-lap same-type lines and at most one entry per event type unless slots remain.
- AC3: Tests cover the grouping rule.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Chrono attempts no longer carry race-position styling or labels.
- request-AC8 -> This backlog slice. Proof: AC2: Key moments show no duplicate same-lap same-type lines and at most one entry per event type unless slots remain.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Implementation Notes
- Wave 3: the race desk chrono panel now uses plain `#rank` text instead of race-position `P` badges for chrono rows.
- Wave 3: `ReportView` now deduplicates major key moments by displayed lap and event type, then prefers one event per type before filling remaining slots.
- Validation wave 3: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/features/ReportView.test.tsx apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts` passed with 30 tests.

# Links
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Primary task(s): `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# AI Context
- Summary: Readability papercuts: attempt rank labels and key-moment variety
- Keywords: scaffolded-backlog, readability papercuts: attempt rank labels and key-moment variety, implementation-ready
- Use when: Implementing the scaffolded slice for Readability papercuts: attempt rank labels and key-moment variety.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
