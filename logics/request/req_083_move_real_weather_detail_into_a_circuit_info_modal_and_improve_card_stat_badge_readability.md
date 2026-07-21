## req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability - Move real-weather detail into a circuit info modal and improve card stat badge readability
> From version: 0.3.26
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Race readability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace the raw inline real-weather-by-phase copy with a compact circuit info action in the circuit presentation panel.
- Open a focused modal from that circuit info action to explain the resolved weather phases after the GP has run.
- Make card stat badges wrap cleanly inside plan, garage, shop, and card-detail cells, with space for at least two lines by default.
- Expose more information on card stat badges on hover and keyboard focus using the smallest accessible mechanism.
- Preserve existing replay weather markers, forecast labels, and race mechanics.

# Context
- The Drive circuit panel already presents city, layout, lap count, weather tendency, and map status; it is the natural place for a compact info action.
- ReplayProgress currently summarizes resolved weather phases inline, which is accurate but visually noisy.
- CardStatBadges already centralizes the badge rendering used by Plan and Garage surfaces, so stat explanations should be added there instead of per caller.
- The desired badge explanation can start with native title/aria-label text before adding any custom tooltip component.

# Acceptance criteria
- AC1: The raw resolved-weather phase sentence is no longer shown inline in the replay progress panel.
- AC2: The circuit presentation panel exposes a compact info action styled like existing view/edit actions when resolved weather details are available.
- AC3: Activating the info action opens a modal that explains the resolved weather phases with EN/FR copy and closes through existing modal behavior.
- AC4: Card stat badges wrap without squeezing text, and card cells reserve enough vertical space for at least two badge rows on representative Plan and Garage surfaces.
- AC5: Each stat badge has hover/focus accessible explanatory text for Grip, Attack, and Endurance.
- AC6: No simulation, weather resolution, card effect, API, or replay marker behavior changes.
- AC7: Typecheck, lint, unit tests, build, e2e, and Logics validation pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_047_race_weather_and_card_stat_readability_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/app/DriveView.tsx
- apps/web/src/features/replay/ReplayProgress.tsx
- apps/web/src/features/CardStatBadges.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/DirectivePanel.tsx
- apps/web/src/styles/layout.css
- apps/web/src/styles/paper-material.css
- apps/web/src/styles/directive-telemetry.css
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- User feedback 2026-07-21: the inline 'actual weather by phase' text feels too raw and should move behind an info action on the circuit presentation panel.
- User feedback 2026-07-21: card stat badges should naturally wrap to at least two lines, and hovering/focusing a stat badge should explain the stat.

# AI Context
- Summary: Move real-weather detail into a circuit info modal and improve card stat badge readability
- Keywords: request-chain-scaffold, move real-weather detail into a circuit info modal and improve card stat badge readability, development-ready
- Use when: You need to implement or review the scaffolded workflow for Move real-weather detail into a circuit info modal and improve card stat badge readability.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_181_move_resolved_weather_details_to_a_circuit_info_modal`
- `item_182_wrap_card_stat_badges_and_add_stat_explanations`
