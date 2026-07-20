## item_160_clean_up_app_root_locale_ownership_and_hooks_warning - Clean up App root locale ownership and Hooks warning
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Root shell hygiene
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The splash wrapper and GameApp both initialize locale from localStorage/browser language, which is duplicated root-shell logic and can drift in future edits.
- App.tsx still emits a React Hooks exhaustive-deps warning around onboarding helpers; lint passes only because it is a warning.

# Scope
- In:
  - Move locale initialization/change handling to one owner or one small helper reused by splash and GameApp.
  - Fix the App.tsx exhaustive-deps warning without changing the intended one-shot onboarding behavior.
  - Keep the App root change narrow and covered by existing App and profile tests.
  - Run lint and confirm the App.tsx warning is gone.
- Out:
  - A broad App.tsx decomposition or new state-management abstraction.
  - Changing onboarding copy, onboarding storage keys, or help dismissal semantics.
  - Changing route parsing or splash persistence behavior.

# Acceptance criteria
- AC4: Locale defaulting and persistence live in one reusable path for both splash and entered app.
- AC5: npm run lint reports no App.tsx React Hooks exhaustive-deps warning.
- AC6: Existing App, profile, i18n, and e2e flows still pass.

# Implementation notes
- 2026-07-20: `App` now owns locale state through one `initialLocale()` path and passes the locale/change callback into `GameApp`, removing the duplicate localStorage/browser-locale initialization in the entered app body.
- 2026-07-20: Onboarding storage/open helpers are stable callbacks and the onboarding effect declares them in its dependency list; lint no longer reports the App.tsx React Hooks warning.
- Targeted proof: `rtk npm run lint` passed with no warnings; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/routes.test.ts apps/web/src/i18n/index.test.ts` passed (52 tests).

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC4: Locale defaulting and persistence live in one reusable path for both splash and entered app.
- request-AC5 -> This backlog slice. Proof: AC5: npm run lint reports no App.tsx React Hooks exhaustive-deps warning.
- request-AC6 -> This backlog slice. Proof: AC6: Existing App, profile, i18n, and e2e flows still pass.
- request-AC7 -> This backlog slice. Proof: AC6: Existing App, profile, i18n, and e2e flows still pass.
- request-AC1 -> This backlog slice. Evidence needed: At 360px and 390px widths, the splash header has no horizontal scroll, no clipped controls, and better visual breathing than the current one-row brand + Language label + two language buttons layout.
- request-AC2 -> This backlog slice. Evidence needed: Desktop splash header remains visually consistent with the Profile/setup header and the language switcher still works from the splash.
- request-AC3 -> This backlog slice. Evidence needed: On desktop, the splash background image is fit by height without over-zooming; any exposed side area uses a page background/blend that feels continuous with the image rather than blank letterboxing.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_030_post_splash_playtest_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_066_post_splash_playtest_polish_mobile_header_and_root_shell_cleanup`
- Primary task(s): `task_067_orchestrate_post_splash_playtest_polish`

# AI Context
- Summary: Clean up App root locale ownership and Hooks warning
- Keywords: scaffolded-backlog, clean up app root locale ownership and hooks warning, implementation-ready
- Use when: Implementing the scaffolded slice for Clean up App root locale ownership and Hooks warning.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_067_orchestrate_post_splash_playtest_polish`

# Notes
- Task `task_067_orchestrate_post_splash_playtest_polish` was finished via `logics-manager flow finish task` on 2026-07-20.
