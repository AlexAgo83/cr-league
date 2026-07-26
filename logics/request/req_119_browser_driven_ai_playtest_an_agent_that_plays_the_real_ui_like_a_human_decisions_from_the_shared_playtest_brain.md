## req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain - Browser-driven AI playtest: an agent that plays the real UI like a human, decisions from the shared playtest brain
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: AI playtest tooling
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add a browser-driven AI playtest runner: an agent that plays the real web UI through Playwright — home, join/create league, Plan decisions, Garage card buys, resolve, Championship, replays — across multiple Grand Prix, with its choices made by an AI decision brain, not a hard-coded script.
- Make the agent's decisions come from the SAME shared playtest brain used by the headless tools, so behavior is consistent and a brain change lands in one place instead of three.
- Instrument the browser run with the existing human-feel metrics (fun/frustration) plus outcomes, and emit a report alongside the current reports/playtest artifacts, flagging UI/interaction failures a headless run cannot see.
- Wire it as an npm script and make it runnable against a real backend (real league lifecycle), reusing the existing Playwright/webServer setup where possible.

# Context
- Extract-then-reuse, do not fork a third brain: the decision heuristics currently duplicated in ai-playtest.ts (decisionFor/approachFor/preparationFor/pitStrategyFor and the card-buying/nextBuy logic, ~lines 256+) and simulate-playtest.ts (decisionFor/cardFor/nextBuyFor, ~lines 239+) must be lifted into ONE shared playtest module that all three consumers (ai-playtest, simulate-playtest, the new browser agent) call. Keep the 14 persona profiles as the shared brain's input. This is the load-bearing prerequisite; the browser agent binds a persona to real UI actions.
- The browser agent maps brain decisions to real selectors. The existing e2e spec (tests/e2e/private-league.spec.ts) is the selector vocabulary: getByRole tabs 'Stand'/'Plan'/'Championship'/'Garage'/'Result', the decision submit, the Garage card buys, and the championship screens. Reuse that vocabulary (prefer role/label selectors) rather than inventing brittle CSS. The agent reads visible state (owned cards, credits, current circuit, standings) to feed the brain, submits a decision, buys cards, resolves/advances, and can open a replay.
- Backend: simulate-playtest already proves the AI can drive the REAL store lifecycle. The browser agent should play against a REAL API (so it exercises the true end-to-end path, unlike the mocked e2e spec), which means the runner starts both API and web (the current playwright.config webServer starts only web on :4978 and the spec mocks the API). Decide and document how the run boots the API + a seeded/fresh league (e.g. reuse playtest:seed or the store's createDemoLeague), and keep it deterministic where the sim is (seeded).
- Instrumentation parity: reuse funScore/frustrationScore (move them into the shared playtest module too) so the browser run reports the same human-feel signal as ai-playtest, and write the report under reports/playtest/ in the same family. Additionally capture UI-specific failures — a missing element, a stuck state, a thrown console error, or a screenshot on failure — since the whole point is to catch what headless runs miss.
- Scope of realism: the agent must play like a human session (read screen -> think -> act -> watch), not poke the API behind the UI. When a value it needs is on screen (credits, cards, circuit, result), it reads it from the DOM; it only calls the API/store for setup (seeding a league) and lifecycle steps that have no player-facing button in the flow being tested.
- Out of scope: changing the simulation engine, the personas' strategies, or the fun/frustration formulas (move them, do not retune); replacing the existing headless tools (they stay — this is a third surface); turning this into the CI-blocking gate on day one (a fast smoke variant is welcome, but making it required is a follow-up); and multi-browser/mobile matrices (chromium desktop first, mobile is a follow-up).

# Acceptance criteria
- AC1: A shared playtest brain module exists and is the single source of the decision heuristics (approach/preparation/pit/card buying) and the fun/frustration scoring; ai-playtest.ts and simulate-playtest.ts consume it with no behavior change (their reports are equivalent to before), and the per-file duplicates are deleted.
- AC2: A new browser-driven playtest runner plays a full multi-Grand-Prix loop through the real web UI via Playwright — join/create league, Plan decision, Garage card buys, resolve, Championship, and at least one replay — with every decision produced by the shared brain bound to a persona, using role/label selectors from the existing e2e vocabulary.
- AC3: The runner plays against a real backend (real league lifecycle, not a mocked API), booting API + web and a seeded/fresh league deterministically; the boot/seed path is documented.
- AC4: The run emits a report under reports/playtest/ carrying outcomes plus the shared fun/frustration metrics, and surfaces UI-specific failures (missing element / stuck state / console error) with a screenshot on failure.
- AC5: It is wired as an npm script (e.g. playtest:browser), and npm run typecheck, npm test, npm run lint, and npm run logics:validate pass; the existing playtest:ai and playtest:simulate still run and produce equivalent reports.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_071_ai_playtest_surfaces_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- scripts/ai-playtest.ts
- scripts/simulate-playtest.ts
- tests/e2e/private-league.spec.ts
- playwright.config.ts
- apps/api/src/features/leagues/store.ts
- apps/web/src/features/ChampionshipView.tsx
- apps/web/src/features/PlanView.tsx
- package.json
- We already have two AI-driven playtest tools, both HEADLESS: (1) scripts/ai-playtest.ts runs 14 named human-like personas (sprinter, rain-reader, banker, closer, defender, rival-hunter, all-in-attack, economy-hoarder, rain-gambler, no-card-saver, tunnel-rival, mini-spammer, endurance-conservative, random-baseline) through a pure in-memory tournament that calls simulateRace directly, buying cards and choosing approach/preparation/pit each race, and it instruments the HUMAN FEEL with per-race funScore (wins/podiums/overtakes) and frustrationScore (bad finish + mechanical_scare/wrong_weather_bet/minor_error/battery_critical), then writes a markdown report to reports/playtest/. (2) scripts/simulate-playtest.ts drives the REAL API store (createProfile, joinLeagueByCode, buyCard, submitDecision, resolveCurrentGrandPrix, startNextGrandPrix) so AI players traverse the real league lifecycle end-to-end, and even ends its report with a 'browser checklist' of visual-only items a headless run cannot verify. The gap: NO AI ever plays through the real browser UI. The Playwright suite (tests/e2e/private-league.spec.ts) exercises the UI as a human but is hard-scripted with a mocked API (page.route on http://localhost:4874) and asserts one fixed happy path; it does not DECIDE. The decision heuristics (decisionFor/approachFor/preparationFor/pitStrategyFor/card-buying) are ALSO duplicated: ai-playtest.ts:256+ and simulate-playtest.ts:239+ each re-implement their own copy, so a 'brain' change has to be made twice and can drift. We want a third playtest surface: an agent that opens the real app in a browser (Playwright), navigates the real screens (Stand/Plan/Championship/Garage, submit decision, buy cards, run replays) using the SAME decision brain as the headless tools, plays full multi-GP loops, and reports both the outcomes AND the fun/frustration metrics — catching UI/interaction/visual regressions the sim and store levels are blind to (e.g. the recently added replay start lights, finish flag, and circuit filters/pagination).

# AI Context
- Summary: Browser-driven AI playtest: an agent that plays the real UI like a human, decisions from the shared playtest brain
- Keywords: request-chain-scaffold, browser-driven ai playtest: an agent that plays the real ui like a human, decisions from the shared playtest brain, development-ready
- Use when: You need to implement or review the scaffolded workflow for Browser-driven AI playtest: an agent that plays the real UI like a human, decisions from the shared playtest brain.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_292_extract_the_shared_playtest_brain_decisions_fun_frustration_into_one_module`
- `item_293_build_the_playwright_browser_agent_that_plays_the_real_ui_from_the_shared_brain`
- `item_294_instrument_the_browser_run_fun_frustration_report_ui_failure_capture_npm_wiring`
