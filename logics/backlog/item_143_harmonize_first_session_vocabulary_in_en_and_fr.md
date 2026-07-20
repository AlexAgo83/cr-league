## item_143_harmonize_first_session_vocabulary_in_en_and_fr - Harmonize first-session vocabulary in EN and FR
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
- Out:
  - Renaming i18n keys themselves (values only, unless a key name actively lies).
  - Vocabulary outside the five listed concepts (report, replay, garage).

# Acceptance criteria
- AC1: The EN chrono CTA reads 'New chrono' and each of the five concepts uses one term per locale.
- AC2: The parity test and all pinned-label tests pass.
- AC3: The playtest checklist matches the shipped labels.

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
