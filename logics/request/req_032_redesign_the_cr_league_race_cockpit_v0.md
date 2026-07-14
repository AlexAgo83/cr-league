## req_032_redesign_the_cr_league_race_cockpit_v0 - Redesign the CR League race cockpit V0
> From version: 0.1.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Cockpit UX and visual direction
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace the current prototype-like single-page stack with a coherent race cockpit that feels like a game interface rather than an admin dashboard.
- Establish a minimal but intentional visual direction for CR League: racing pit wall, urban micro-EV championship, clear state hierarchy, and restrained game-like energy.
- Make the main screen answer the player's immediate questions in under five seconds: where the GP stands, what action is expected, what the player's team status is, and what changed after the race.
- Make all visible user-facing copy respect the existing i18n catalog and prevent English copy from leaking into the French experience.
- Split the current large web app surface into practical, domain-named components only where that makes the redesign easier to reason about and test.
- Rework the result and replay experience so it is visually clear whether the user is looking at a final classification summary, a race story, or a replay-like visualization.

# Context
- The current CR League prototype can create and run a private league loop, submit directives, resolve GPs, show a dashboard, garage, recap, report, and a first visual replay.
- The implementation is functionally validated, but the user-facing experience now exposes a product risk: the interface does not yet feel designed, directed, or game-like enough to carry the concept.
- The main React screen currently concentrates too many responsibilities in `apps/web/src/app/App.tsx`, which makes visual hierarchy and localized copy harder to audit.
- The current palette, panel rhythm, and layout read as a generic web dashboard. The product brief asks for an asynchronous racing championship where the player feels like a team principal watching the consequences of a strategic bet.
- The redesign should not introduce new gameplay mechanics, a routing framework, a component library, animation engine, or broad dependency churn. The first win is a better cockpit and clearer result/replay presentation using existing React, CSS, and catalogs.
- The work should preserve the proven 3-GP private league loop and established gates: typecheck, unit tests, lint, build, e2e, i18n validation, Logics validation, plus desktop and mobile visual QA.

# Acceptance criteria
- AC1: The main playable screen is reorganized into a cockpit layout with clear Course, Championship, Garage, and Result/Replay responsibilities instead of one long undifferentiated stack.
- AC2: A documented V0 visual direction defines palette, density, typography scale, panel rhythm, state colors, and racing-specific UI motifs without adding a design-system dependency.
- AC3: The race desk exposes a single obvious primary action per state and keeps the current GP status, player directive, and next action visible on desktop and mobile.
- AC4: The result and replay area clearly distinguishes final classification, race explanation, replay/visual summary, and written report, with no ambiguous labels.
- AC5: French and English UI copy come from the i18n catalogs for all redesigned surfaces, and a test or audit catches the main hardcoded-copy regressions.
- AC6: The web implementation is split into practical components or helpers for the redesigned surfaces, without speculative abstractions or new dependencies.
- AC7: Desktop and mobile screenshots demonstrate that text does not overlap, core controls remain visible, and the app no longer reads as an unstructured admin page.
- AC8: Existing 3-GP e2e behavior and validation gates continue to pass after the redesign.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- logics/specs/spec_016_implementation_roadmap.md
- logics/architecture/adr_005_theme_design_system.md
- logics/architecture/adr_006_accessibility.md
- logics/architecture/adr_007_i18n.md
- docs/playtest/private-league-3gp-checklist.md
- apps/web/src/app/App.tsx
- apps/web/src/styles/layout.css
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- tests/e2e/private-league.spec.ts
- Recent feedback: the current app feels visually unstructured, lacks an intentional art direction, stacks unrelated panels into one long page, makes the replay hard to understand, and still exposes English copy in a localized experience.

# AI Context
- Summary: Redesign the CR League race cockpit V0
- Keywords: request-chain-scaffold, redesign the cr league race cockpit v0, development-ready
- Use when: You need to implement or review the scaffolded workflow for Redesign the CR League race cockpit V0.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_040_define_the_cockpit_information_architecture`
- `item_041_establish_visual_direction_and_css_foundations`
- `item_042_rebuild_the_race_desk_around_one_clear_action`
- `item_043_redesign_championship_and_garage_as_supporting_panels`
- `item_044_make_result_and_replay_presentation_unambiguous`
- `item_045_audit_and_harden_i18n_for_redesigned_surfaces`
- `item_046_split_the_web_cockpit_into_practical_components`
- `item_047_validate_the_redesigned_cockpit_with_screenshots_and_playtest_prompts`
