## req_034_personalized_race_recap - Personalized race recap
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 92
> Confidence: 88
> Complexity: Medium
> Theme: Post-race feedback quality
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the post-race recap speak about the player's race: what actually gained or lost them positions, whether their directive paid off, and what the next Grand Prix rewards.
- Use the race data the simulation already produces (per-event positionDelta, lap, segment, resolved weather per phase, card triggers, final positionChange) instead of fixed sentences that ignore it.
- Give each Grand Prix a real identity so trait-based advice can be true: derive each round's traits and forecast from its circuit instead of copying the same demo constants every round.
- Evaluate the player's directive against what happened: preparation versus resolved weather, played card versus its triggered events, approach versus final result.
- Make the 'next GP' lesson actually reference the next round's circuit and conditions, with enough template variety that three consecutive GPs do not read identically.
- Support parameterized translation strings so copy can embed real values (segment, weather, position deltas, circuit names) in both EN and FR.

# Context
- The recap is built in ReportView.tsx from three helpers in apps/web/src/app/helpers.ts: the 'difference' card shows majorEvents[0] — the first major event of the whole field, not the player's — and weather_change events render the fixed string event_weather_change ('La météo change pendant la course') although the event carries segment and weather data.
- describeDecision only echoes the picked approach/preparation/card; nextLesson is a five-branch if-chain of canned sentences (lesson_card_paid fires when ANY player-related event has a cardId, including a rival's card via relatedTeamId) and references the CURRENT GP's traits under a 'next GP' title.
- Root cause of the stale feeling: startNextGrandPrix copies DEMO_RACE_INPUT.primaryTrait/secondaryTrait/forecast for every round (apps/api/src/features/leagues/store.ts:753), so every Grand Prix has identical traits and forecast. Trait-based advice cannot be relevant until GP identity varies.
- The data to fix this exists client-side and in shared: CITY_CIRCUITS in apps/web/src/app/circuits.ts carries per-circuit traits {grip, overtaking, energy} and likelyWeather, and circuitForRound(round) is a deterministic modulo rotation — the web can compute the next round's circuit without an API change; the server needs the same table to vary GP inputs.
- The i18n layer (apps/web/src/i18n/index.ts) is a plain key lookup with no interpolation; parameterized copy needs a small {placeholder} substitution added to t()/tt.
- The simulation writes English reportText strings on events that the web ignores (it re-localizes from event type keys); the redesign should keep using typed event data, not parse those strings.
- Owner decision (2026-07-15): no LLM-generated narrative — cost, latency, and a new dependency are out; parameterized templates over real data give most of the effect.
- Constraint: changing GP traits/forecast per round changes simulation inputs, so existing unit/e2e tests that pin race outcomes may need their expectations re-derived (same PRNG, new inputs). This is expected and must be done consciously, not by loosening assertions.
- Sequencing with sibling chains: run AFTER req_033 (over-engineering cleanup) — both touch apps/web/src/app/helpers.ts, the EN/FR catalogs (req_033 deletes ~30 dead keys, this request adds/replaces recap keys), and the report/replay views (req_033's item_053 hoists WEATHER_ICONS, which this request's ReportView rework must not duplicate). Running req_033 first avoids re-creating deleted keys and merge conflicts in the same files.

# Acceptance criteria
- AC1: Grand Prix identity varies per round: each round's primaryTrait, secondaryTrait, and forecast are derived deterministically from its circuit (shared rotation table), replacing the copied DEMO_RACE_INPUT constants, and league creation plus next-GP flows produce them consistently.
- AC2: The circuit identity table (city, traits, likely weather, laps — not the route geometry) lives in packages/shared and is consumed by both the API (GP creation) and the web (display and next-GP lesson), with no duplicated table.
- AC3: t() supports {placeholder} interpolation, is covered by a unit test, and existing non-parameterized keys keep working unchanged.
- AC4: The 'difference' recap card shows the player's most impactful event (largest absolute positionDelta among the player's own events, with sensible fallbacks: player card trigger, then field-level weather shift with segment and new weather, then headline), phrased with the event's real data.
- AC5: The 'directive' recap card adds a computed verdict: preparation judged against resolved weather across segments, played card judged against its triggered events and their deltas, approach judged against final positionChange — each verdict phrased from parameterized templates in EN and FR.
- AC6: The 'next GP' lesson names the actual next round's circuit and its dominant trait or likely weather (via the deterministic rotation) and ties it to the main cause of the player's result this race; the card-attribution bug (rival cards counted via relatedTeamId) is fixed.
- AC7: Template variety: each recap card draws from at least three parameterized variants per outcome family, and the same variant does not repeat on consecutive GPs for the same card when alternatives exist.
- AC8: All new copy exists in both EN and FR catalogs with identical key sets; no hardcoded user-facing strings in the recap path.
- AC9: Unit tests cover the new recap helpers (difference selection, directive verdict, next-GP lesson) with fixture race results; affected existing tests are re-derived, not weakened.
- AC10: Typecheck, lint, unit tests, build, and e2e all pass; the 3-GP e2e loop still completes with varying GP traits.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_005_personalized_race_recap_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/roadmap/road_001_cr_league_roadmap.md
- apps/web/src/features/ReportView.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/app/circuits.ts
- apps/web/src/i18n/index.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/race.ts
- apps/api/src/features/leagues/store.ts
- Player feedback (2026-07-15): the race recap panel (result_recap_title) feels basic and stale — 'what made the difference' shows a generic fixed sentence, 'your directive' only echoes the player's own picks, and 'lesson for the next GP' repeats one of five canned sentences that reference the current GP instead of the next one.

# AI Context
- Summary: Personalized race recap
- Keywords: request-chain-scaffold, personalized race recap, development-ready
- Use when: You need to implement or review the scaffolded workflow for Personalized race recap.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_054_derive_grand_prix_identity_from_the_circuit_rotation`
- `item_055_add_placeholder_interpolation_to_the_i18n_layer`
- `item_056_rebuild_the_three_recap_cards_on_player_race_data`
