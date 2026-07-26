## req_120_ux_evaluation_harness_let_an_ai_judge_ui_ux_friction_and_onboarding_by_capturing_what_it_can_see_and_measure - UX evaluation harness: let an AI judge UI/UX, friction and onboarding by capturing what it can see and measure
> From version: 0.4.6
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: UX evaluation tooling
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Turn a browser AI play session into a reviewable VISUAL artifact: screenshots plus the on-screen state/annotation at each meaningful step, on desktop and mobile, assembled into a playthrough gallery a human or AI can review to judge UI/UX.
- Measure interaction FRICTION and accessibility during a run: actions-per-task, dead-ends and hesitation, console errors, mobile tap-target/overflow issues, and an automated axe-core a11y audit, emitted as a friction report.
- Measure first-time COMPREHENSION with a cold-start agent that acts only on visible text/affordances and reports whether (and where) it can reach the first decision, race, and purchase without prior knowledge.
- Produce all three as artifacts under reports/ (alongside reports/playtest) so an AI reviewer can consume them and give a grounded UX/onboarding opinion.

# Context
- This is built on req_119, not a new agent: it consumes the browser-driven playtest agent and its shared decision brain. The harness adds capture and measurement AROUND the agent's navigation; it must not fork a second UI driver or a second brain. Where the agent already reads on-screen state to decide, reuse that read for the annotations.
- Visual capture (A): at each meaningful step (screen entered, decision submitted, card bought, GP resolved, replay opened) capture a full-page screenshot and a short structured annotation of what the agent saw/did, for BOTH a desktop viewport and a mobile viewport (~390px, matching the responsive work). Assemble them into a single reviewable playthrough (markdown or a self-contained gallery) with step, screen name, and thumbnail. This is the keystone deliverable — without it no UI opinion is grounded.
- Friction + a11y (B): instrument the same run to record per-task action counts, retries, dead-ends, and hesitations (a step where the agent's brain has no obvious affordance to act on), plus any thrown console error/warning; on the mobile viewport, flag tap targets below the accessible minimum and any horizontal overflow of the page body. Add axe-core as the automated accessibility pass (there is none today) and include its violations in the report. Output a friction report under reports/.
- Cold-start comprehension (C): add a naive agent variant that is denied game knowledge — it may only act on visible labels, text, and affordances, never on internal IDs or the decision brain's strategy — and attempts the first-session goals (reach first decision, run first race, make first purchase). Record an onboarding funnel: which step it reached, where it got stuck, and what on-screen copy was missing or ambiguous. This measures ease of prise en main against OnboardingShell.
- Determinism and cost: reuse req_119's seeded/booted backend so captures are repeatable; keep the harness runnable as npm scripts and non-blocking in CI (a UX report, not a gate). Screenshots and reports go to a reports/ subtree, not committed by default.
- Out of scope: automated PASS/FAIL judgement of UX quality (the harness produces evidence; the opinion is a separate reviewing step); changing the game UI itself in response to findings (that is downstream work per finding); redesigning onboarding; multi-browser matrices beyond one desktop + one mobile viewport; and replacing the headless playtest tools.

# Acceptance criteria
- AC1: A run of the browser playtest agent produces a visual playthrough artifact — screenshots plus per-step state annotations at each meaningful step, on both a desktop and a ~390px mobile viewport — assembled into a single reviewable gallery/markdown under reports/.
- AC2: The same run emits a friction report capturing actions-per-task, dead-ends/hesitations, thrown console errors, and (on mobile) sub-minimum tap targets and page-body overflow.
- AC3: An automated axe-core accessibility pass runs during the session and its violations are included in the report (no a11y checker existed before).
- AC4: A cold-start naive agent variant, restricted to visible text/affordances, attempts the first-session goals and emits an onboarding funnel showing the furthest step reached and where/why it got stuck.
- AC5: The harness is wired as npm script(s), reuses the req_119 seeded backend and shared agent (no second driver/brain), stays non-blocking in CI, and npm run typecheck, npm test, npm run lint, and npm run logics:validate pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_072_ai_ux_evaluation_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/scaffold/browser-driven-ai-playtest.json
- logics/request/req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain.md
- scripts/ai-playtest.ts
- tests/e2e/private-league.spec.ts
- playwright.config.ts
- apps/web/src/app/OnboardingShell.tsx
- apps/web/src/features/ChampionshipView.tsx
- An AI can only give a grounded opinion on UI/UX, friction, and onboarding for things it can SEE (screens) or MEASURE (signals); today it has neither. The browser-driven AI playtest agent (req_119) will play the real UI, but on its own it produces outcomes, not evidence a reviewer can look at. This request builds the evaluation harness ON TOP of that agent so a play session becomes a reviewable artifact. Three gaps. (A) No visual record: nothing captures screenshots + the on-screen state at each meaningful step, on desktop AND mobile, so no one (human or AI) can review the interface hierarchy, legibility, consistency, or mobile crowding after a run — and we just shipped mobile-sensitive work (splash brand hiding, replay start lights/finish flag, circuit filters/pagination) with no visual capture. (B) No friction/accessibility signal: nothing measures how many actions a task costs, where the agent dead-ends or hesitates (ambiguous states with no obvious affordance), whether the console throws, whether mobile tap targets are too small or layouts overflow; there is no axe-core/a11y audit at all (grep finds only hand-written aria-* attributes, no automated checker). (C) No cold-start comprehension measure: every existing playtest agent already knows the game; none tests whether a FIRST-TIME user could reach the first decision/race/purchase using only visible text and affordances, so onboarding ease (OnboardingShell) is unmeasured. The harness turns the browser agent's session into: a visual playthrough gallery, a measured friction+a11y report, and a cold-start onboarding funnel — the evidence an AI needs to opine on UX.

# AI Context
- Summary: UX evaluation harness: let an AI judge UI/UX, friction and onboarding by capturing what it can see and measure
- Keywords: request-chain-scaffold, ux evaluation harness: let an ai judge ui/ux, friction and onboarding by capturing what it can see and measure, development-ready
- Use when: You need to implement or review the scaffolded workflow for UX evaluation harness: let an AI judge UI/UX, friction and onboarding by capturing what it can see and measure.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_295_visual_playthrough_capture_screenshots_annotated_state_desktop_and_mobile`
- `item_296_friction_accessibility_instrumentation_with_axe_core`
- `item_297_cold_start_naive_agent_and_onboarding_funnel`
