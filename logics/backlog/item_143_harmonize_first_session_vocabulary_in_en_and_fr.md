## item_143_harmonize_first_session_vocabulary_in_en_and_fr - Harmonize first-session vocabulary in EN and FR
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 85
> Complexity: Low
> Theme: i18n
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The chrono CTA is 'New lap time' in EN but 'Nouveau chrono' in FR, while the roadmap and playtest checklist call it 'New chrono'.
- Plan, chrono, and launch concepts each spread across several diverging labels (Send plan / Edit plan / Current plan; New lap time / Review lap time / Run lap time / Chrono report; Launch GP / move into launch), which competes for a first-session player's attention.

# Scope
- In:
  - Rename the EN chrono CTA family to the chrono term (New chrono, Review chrono, Run chrono) and keep FR aligned.
  - Audit the league, championship, plan, chrono, and launch keys across rail_*, rail_short_*, plan_subscreen_*, action_*, command_hint_*, and briefing labels; converge each concept on one term per locale with minimal renames.
  - Update App.test.tsx exact-text assertions, the e2e spec, and docs/playtest/private-league-3gp-checklist.md to the final labels.
  - Keep the i18n EN/FR key-parity test passing; no key additions without both locales.
  - Replace the bot status label "missing" in the championship standings with phase-appropriate wording (e.g. "no plan yet" during preparation, nothing on a finished round): the 2026-07-20 playtest read it as a data error.
- Out:
  - Renaming i18n keys themselves (values only, unless a key name actively lies).
  - Vocabulary outside the five listed concepts (report, replay, garage).

# Acceptance criteria
- AC1: The EN chrono CTA reads 'New chrono' and each of the five concepts uses one term per locale.
- AC2: The parity test and all pinned-label tests pass.
- AC3: The playtest checklist matches the shipped labels.

# Implementation Notes
- 2026-07-20 wave 1: renamed the EN primary chrono CTA values from `New lap time` / `Review lap time` to `New chrono` / `Review chrono`, and updated pinned unit/e2e expectations to match.
- 2026-07-20 wave 3: completed the visible EN chrono-label sweep (`Run chrono`, `Chronos`, `Chrono logged`, `Understand the chrono`, `Chrono replay`, `No chrono`) and aligned exact-text tests. Replaced championship team `missing` status with `no plan yet` / `plan absent`.
- Remaining: run full-suite validation and any final playtest checklist touch-ups found during closeout.

# Validation
- 2026-07-20 targeted: `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`; `rtk npx playwright test tests/e2e/private-league.spec.ts -g "first-click commands"`.
- 2026-07-20 targeted: `rtk npm run typecheck`; `rtk npm run lint`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/raceFlow.test.ts apps/web/src/i18n/index.test.ts apps/web/src/features/ReplayView.test.ts`.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: The EN chrono CTA reads 'New chrono' and each of the five concepts uses one term per locale.
- request-AC4 -> This backlog slice. Proof: AC2: The parity test and all pinned-label tests pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`
- Primary task(s): `task_060_orchestrate_first_gp_action_clarity`

# AI Context
- Summary: Harmonize first-session vocabulary in EN and FR
- Keywords: scaffolded-backlog, harmonize first-session vocabulary in en and fr, implementation-ready
- Use when: Implementing the scaffolded slice for Harmonize first-session vocabulary in EN and FR.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
