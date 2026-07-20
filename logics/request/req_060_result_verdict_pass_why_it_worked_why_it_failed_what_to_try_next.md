## req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next - Result verdict pass: why it worked, why it failed, what to try next
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Race learning and feedback
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Give every race report a direct verdict at the top: one 'why this worked' or 'why this failed' sentence grounded in the player's actual decisions and race events, plus one 'try this next' sentence, readable in seconds before the detailed sections.
- Build the verdict as a pure, deterministic, unit-tested helper beside the existing recap builders so the copy never contradicts the recap cards below it.

# Context
- ReportView receives state, result (RaceResult), circuit (CityCircuit), playerTeamId, playerDecision, and tt; every verdict input is already in scope: classification entry (position, positionChange, points, resultTags), decision (approach prudent/balanced/aggressive, preparation speed/reliability/weather, pitStrategy, cardId), the RaceEvent list (typed, with severity, positionDelta, cardId, tags), resolvedWeather per segment, and circuit traits.
- The explanation logic pattern is established in helpers.ts: recapDifference, recapDirective, recapPlanRead, and recapNextLesson each map race data to i18n keys with seed-based variants via pickRecapKey/resultVariant, and are tested in helpers.test.ts. The verdict builder should follow the same shape: a pure function returning i18n keys plus interpolation values, no JSX.
- A verdict needs a stance before a reason: derive the outcome tier from position, positionChange, and points (e.g. podium, gained places, held, lost places), then pick the dominant cause the same way recapDifference already ranks the player's most impactful event, card outcome, or weather bet. The 'try next' line can reuse the recapNextLesson look-ahead at lower priority so the two never disagree.
- Placement: the verdict renders in the report hero region, above report-phases, on both the report tab and wherever the hero already appears; the four recap cards, phases, rewards, and key moments stay unchanged below it. The 0.3.8 payoff panel in ResultView is not part of this change.
- i18n: report strings live as flat keys with {name} interpolation and _0/_1/_2 variant families in en.json and fr.json; the parity test fails on divergence. The verdict keys should follow the existing recap_*/result_* naming style.
- RaceResult.report.blocks exists in shared types but is unrendered; this feature does not adopt it — the verdict is a web-side derivation like the recap cards, so the simulation output format does not change.
- Tests: helpers.test.ts already covers raceRecapCards scenarios (win with card, clean race, chase-winner) that can be extended with verdict cases; App.test.tsx pins report rendering around the race-payoff-recap panel and headings, so the new block needs its own assertions without breaking those. No ReportView.test exists; adding one for the verdict block is the natural home.

# Acceptance criteria
- AC1: Every race report shows a verdict block above the detailed sections with an outcome stance, one dominant-cause sentence grounded in the player's decision or events, and one try-next sentence, in EN and FR.
- AC2: The verdict builder is a pure function in helpers.ts covered by unit tests spanning at least: podium with a card that fired, position loss from a wrong weather bet, a clean hold with no major events, and a gain driven by approach, with deterministic variant selection.
- AC3: The verdict never contradicts the recap cards: shared cause-ranking logic is reused, not duplicated, and the try-next line defers to the same look-ahead as recapNextLesson.
- AC4: Existing report and payoff tests pass unchanged, a ReportView test asserts the verdict block renders for a finished race, the i18n parity test passes, and npm run typecheck, npm test, npm run build, npm run lint, and npm run test:e2e pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_024_result_verdict_pass_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- apps/web/src/features/ReportView.tsx
- apps/web/src/features/ResultView.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/app/helpers.test.ts
- packages/shared/src/domain/race.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- changelogs/CHANGELOGS_0_3_8.md
- changelogs/CHANGELOGS_0_3_11.md
- Roadmap patch 0.3.14: the race report opens on a hero with headline and podium, then phases, rewards, key moments, and four recap cards (difference, directive, plan read, next lesson) built by raceRecapCards in helpers.ts; there is no direct verdict summary, so a player must assemble 'did my plan work and why' from four cards and an event list. All the inputs for a verdict already reach ReportView: the player's ClassificationEntry (position, positionChange, score, resultTags), the RaceDecision (approach, preparation, pitStrategy, cardId), the typed RaceEvent list with severity and positionDelta, resolvedWeather per segment, and the CityCircuit traits. RaceResult.report.blocks exists in the shared types but is not rendered.

# AI Context
- Summary: Result verdict pass: why it worked, why it failed, what to try next
- Keywords: request-chain-scaffold, result verdict pass: why it worked, why it failed, what to try next, development-ready
- Use when: You need to implement or review the scaffolded workflow for Result verdict pass: why it worked, why it failed, what to try next.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_144_deterministic_verdict_builder`
- `item_145_verdict_block_in_the_race_report`
