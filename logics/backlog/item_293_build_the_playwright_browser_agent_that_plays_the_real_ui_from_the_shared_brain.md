## item_293_build_the_playwright_browser_agent_that_plays_the_real_ui_from_the_shared_brain - Build the Playwright browser agent that plays the real UI from the shared brain
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 30%
> Complexity: Medium
> Theme: AI playtest tooling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- No AI plays through the real browser UI; the e2e spec is hard-scripted with a mocked API and asserts one fixed path, it does not decide.
- Driving the real lifecycle needs both API and web running plus a seeded/fresh league, whereas playwright.config starts only web on :4978 and the spec mocks the API.

# Scope
- In:
  - Add a Playwright-driven runner that binds a persona to the shared brain and plays a full multi-GP loop through the real UI: join/create league, Plan decision, Garage card buys, resolve, Championship, and at least one replay.
  - Read visible state (credits, owned cards, circuit, standings, result) from the DOM to feed the brain; use role/label selectors from the existing e2e vocabulary.
  - Boot API + web and seed a deterministic league (reuse playtest:seed or store createDemoLeague); document the boot/seed path.
- Out:
  - Fun/frustration reporting and failure artifacts (next item).
  - Mobile/multi-browser matrices.
  - Poking the API behind the UI for actions that have a player-facing button.

# Acceptance criteria
- AC1: The agent plays a full multi-GP loop through the real UI with brain-driven decisions bound to a persona.
- AC2: It runs against a real backend with a deterministic seeded league; boot/seed documented.
- AC3: Selectors reuse the existing role/label e2e vocabulary.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The agent plays a full multi-GP loop through the real UI with brain-driven decisions bound to a persona.
- request-AC3 -> This backlog slice. Proof: AC2: It runs against a real backend with a deterministic seeded league; boot/seed documented.
- request-AC5 -> This backlog slice. Proof: AC3: Selectors reuse the existing role/label e2e vocabulary.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_071_ai_playtest_surfaces_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain`
- Primary task(s): `task_120_orchestrate_the_browser_driven_ai_playtest`

# AI Context
- Summary: Build the Playwright browser agent that plays the real UI from the shared brain
- Keywords: scaffolded-backlog, build the playwright browser agent that plays the real ui from the shared brain, implementation-ready
- Use when: Implementing the scaffolded slice for Build the Playwright browser agent that plays the real UI from the shared brain.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
