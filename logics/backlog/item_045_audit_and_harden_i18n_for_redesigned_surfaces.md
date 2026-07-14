## item_045_audit_and_harden_i18n_for_redesigned_surfaces - Audit and harden i18n for redesigned surfaces
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
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

# Direction to carry into implementation
- Treat French as the playtest-priority locale for this redesign. The UI may be authored in English internally, but a French playtest cannot expose English fragments in the redesigned surfaces.
- No new user-facing JSX literals in the cockpit except proper names, dynamic values, or data that comes from the API. New labels belong in `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`.
- Label groups that must be covered: Course, Strategy, Championship, Garage, Result, Directive, Preparation, Directive locked, Race complete, Next GP, Race readout, Classification, Key moments, Report, credits, points, weather, readiness, card consumed, and rewards.
- Add or update tests so they assert a small set of main labels in French mode. The goal is to protect the redesigned experience, not to build a full translation linter.
- If `logics-manager i18n status` reports no project-owned contract, record the current state and still run the existing i18n validation/check surface used by the repo.
- Check empty states and disabled states too; English leaks often hide in placeholders, errors, unavailable card messages, and secondary controls.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: New cockpit, championship, garage, result, and replay labels exist in both EN and FR catalogs.
- request-AC8 -> This backlog slice. Proof: AC2: French mode no longer shows English for the redesigned primary surfaces.
- request-AC3 -> This backlog slice. Evidence needed: The race desk exposes a single obvious primary action per state and keeps the current GP status, player directive, and next action visible on desktop and mobile.
- request-AC4 -> This backlog slice. Evidence needed: The result and replay area clearly distinguishes final classification, race explanation, replay/visual summary, and written report, with no ambiguous labels.
- request-AC6 -> This backlog slice. Evidence needed: The web implementation is split into practical components or helpers for the redesigned surfaces, without speculative abstractions or new dependencies.
- request-AC7 -> This backlog slice. Evidence needed: Desktop and mobile screenshots demonstrate that text does not overlap, core controls remain visible, and the app no longer reads as an unstructured admin page.

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

# Tasks
- `task_033_orchestrate_race_cockpit_redesign_v0`

# Notes
- Task `task_033_orchestrate_race_cockpit_redesign_v0` was finished via `logics-manager flow finish task` on 2026-07-14.
