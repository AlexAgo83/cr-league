## req_079_clarify_weather_semantics_forecast_vs_resolved_and_pace_marker_legend - Clarify weather semantics: forecast vs resolved and pace-marker legend
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Low
> Theme: Race legibility
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Needs
- Frame the pre-race weather pill as a forecast that is not guaranteed, with a qualitative tendency (for example dry likely, rain possible around mid-race), and no per-phase percentages.
- Label the replay weather timeline as the actual resolved weather per phase, distinct from the pre-race forecast.
- Add a short legend explaining the moving pace marker (chrono rhythm) and that the cloud icons map to the five race phases.
- Keep framing honest with the model: do not present a precise per-phase probability the simulation does not apply.
- Support EN/FR copy, keep it compact, and do not rely on color alone (ADR-006).
- Change no simulation behavior, no weather model, and add no new dependency.

# Context
- The pre-race forecast pill (DriveView) and the replay timeline (ReplayProgress) currently both show only a weather name, so players cannot tell probability from actuality (audit cause D).
- The simulation resolves weather per segment; only the mid segment reads the forecast, so any displayed probability must stay qualitative to avoid misleading the player.
- This is a readability change with no model change; it is a post-0.3 gameplay/legibility carry-over, not part of the 0.4 performance theme, and it does not depend on the 0.5 evidence gate.
- Weather icons and colors already exist; this request adds framing, labels, and a legend around them.

# Acceptance criteria
- AC1: The pre-race weather pill is clearly labeled as a forecast that is not final and conveys a qualitative tendency, without per-phase percentages.
- AC2: The replay weather timeline is clearly labeled as the actual resolved weather per phase, distinct from the pre-race forecast.
- AC3: A concise legend explains the pace marker and that cloud icons map to the five race phases.
- AC4: No displayed weather probability contradicts the simulation model (no precise per-phase percentages implied to be exact).
- AC5: Meaning is not conveyed by color alone (ADR-006); EN/FR copy is present and compact.
- AC6: No simulation behavior or weather model changes.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate pass after implementation.

# Delivery notes
- The pre-race map weather readout now says the forecast is not final and uses qualitative tendency copy.
- The replay timeline now labels resolved weather by phase and includes a text legend for pace/race markers and five phase cloud icons.
- No simulation or weather model code changed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_043_weather_legibility_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/architecture/adr_006_accessibility.md
- docs/audits/AUDIT_CR_LEAGUE.md
- apps/web/src/app/DriveView.tsx
- apps/web/src/features/replay/ReplayProgress.tsx
- apps/web/src/features/replay/replayDirector.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- Current diagnostic: before the race, DriveView.tsx (lines 133-147) shows a single forecastPick weather pill labeled only with the weather name (weather_<value>), with no framing that it is a probability and not the final weather.
- Current diagnostic: in the replay, ReplayProgress.tsx (lines 70-79) renders resolvedWeather per segment with only the weather name as tooltip, never labeling it as the actual resolved weather versus the earlier forecast.
- Current diagnostic: the orange pace marker is the qualifying_pace director beat at progress 0.5 (replayDirector.ts:22); its only label is the marker title, with no legend explaining the moving playhead or that the cloud icons map to the five race phases.
- Simulation truth: resolveWeather in simulateRace.ts uses the forecast only for the mid segment; early is a fixed 80/18/2 roll and late/finish are derived, so a precise per-phase probability display would misrepresent the model. Framing must stay qualitative and honest.
- Scope note: weather visual states (icons/colors) already shipped (item_121); this request changes semantics and labeling only, not the icon set.

# AI Context
- Summary: Clarify weather semantics: forecast vs resolved and pace-marker legend
- Keywords: request-chain-scaffold, clarify weather semantics: forecast vs resolved and pace-marker legend, development-ready
- Use when: You need to implement or review the scaffolded workflow for Clarify weather semantics: forecast vs resolved and pace-marker legend.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_177_label_forecast_vs_resolved_weather_and_add_a_replay_legend`
