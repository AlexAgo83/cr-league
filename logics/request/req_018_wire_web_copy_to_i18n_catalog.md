## req_018_wire_web_copy_to_i18n_catalog - Wire web copy to i18n catalog
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: i18n
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Move static player-facing web copy into the source-locale i18n catalog.
- Add the smallest typed translation helper needed by the current app.
- Keep runtime locale switching and additional locales out of scope.

# Context
- The i18n contract exists and points to `apps/web/src/i18n/{locale}.json`.
- `App.tsx` still owned user-facing English copy directly.
- The current product source locale is English.

# Acceptance criteria
- AC1: `apps/web/src/i18n/en.json` contains semantic source-locale keys for current static UI copy.
- AC2: Web code has a minimal typed `t(key)` helper.
- AC3: `App.tsx` uses catalog keys for static UI copy, labels, buttons, and status messages.
- AC4: Existing playable web flow test still covers the rendered labels.
- AC5: i18n validation passes.
- AC6: Typecheck, tests, build, lint, and Logics validation pass.
- AC7: Runtime locale switching and extra locales are not introduced.

# AC Traceability
- AC1 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: `apps/web/src/i18n/en.json`.
- AC2 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: `apps/web/src/i18n/index.ts`.
- AC3 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: `apps/web/src/app/App.tsx`.
- AC4 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: `apps/web/src/app/App.test.tsx`.
- AC5 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: `logics-manager i18n validate`.
- AC6 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: validation commands passed.
- AC7 -> `task_019_wire_web_copy_to_i18n_catalog`. Proof: no locale switcher or extra locale catalog was added.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `adr_007_i18n`
- `logics/i18n/contract.json`
- `apps/web/src/i18n/en.json`

# AI Context
- Summary: Wire current web UI copy to the initialized i18n catalog.
- Keywords: i18n, web-copy, source-locale, translation-helper
- Use when: Updating current web copy extraction and source-locale keys.
- Skip when: Adding runtime locale switching or non-English translations.

# Backlog
- `item_024_wire_web_copy_to_i18n_catalog`
