## item_045_audit_and_harden_i18n_for_redesigned_surfaces - Audit and harden i18n for redesigned surfaces
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Localization quality
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The app has EN/FR catalogs, but user-facing strings can still be introduced directly in JSX, tests, or helper output.
- French playtests lose trust when parts of the cockpit remain in English.
- A manual i18n check is too easy to skip during rapid UI redesign.

# Scope
- In:
  - Audit redesigned web surfaces for hardcoded user-facing strings.
  - Move missing user-facing copy into `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`.
  - Add a small project-owned check or test focused on the redesigned cockpit's key labels.
  - Keep language switching behavior intact and preserve existing i18n validation.
- Out:
  - Adding new locales.
  - Server-side localization.
  - Pluralization framework.
  - Full static analysis of every possible string in the repository.

# Acceptance criteria
- AC1: New cockpit, championship, garage, result, and replay labels exist in both EN and FR catalogs.
- AC2: French mode no longer shows English for the redesigned primary surfaces.
- AC3: `logics-manager i18n validate` passes.
- AC4: A lightweight test or scripted check protects the main redesigned labels from future hardcoded regressions.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: New cockpit, championship, garage, result, and replay labels exist in both EN and FR catalogs.
- request-AC8 -> This backlog slice. Proof: AC2: French mode no longer shows English for the redesigned primary surfaces.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Audit and harden i18n for redesigned surfaces
- Keywords: scaffolded-backlog, audit and harden i18n for redesigned surfaces, implementation-ready
- Use when: Implementing the scaffolded slice for Audit and harden i18n for redesigned surfaces.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
