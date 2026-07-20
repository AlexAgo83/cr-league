## req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest - Replay suspense and first-contact polish from the 2026-07-20 AI playtest
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Low
> Theme: Replay and first-session polish
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Preserve the replay's suspense: the race payoff and final classification must not be visible while the live replay is still running; they appear once the replay has finished or the player has deliberately skipped to the result.
- Remove the first-contact frictions: one click to run a chrono when attempts remain, Enter submits the setup forms, and a quick-start intro seen once stays dismissed for that league without requiring the checkbox.
- Make the small readability fixes: rank chrono attempts without race-position P labels, and de-duplicate key moments so a calm race shows fewer, more varied entries instead of repeated identical lines.
- Make plan locking safe and legible: Send plan confirms with a plan summary and warns when a playable card is left unselected, the plan screen visibly shows the locked state, and a plan carried over from the previous Grand Prix is labeled as such until the player opens it; a returning player lands on the finished-GP summary instead of an auto-replaying replay, with a visibly labeled exit. (Added 2026-07-20 after the second AI playtest session: the tester locked a carried-over plan with one unconfirmed click, could not add the card they had just bought, and found no visible lock indicator; on every return the finished replay auto-played from the start.)

# Context
- ResultView renders the payoff panel (finish, points, credits, cards spent, championship movement) and passes it to ReplayView as afterMapContent on the replay tab, so it sits under the map from the first frame; the replay tab and report tab are a local ResultTab switch. The fix is presentation-side: gate the payoff (and anything else that reveals the final order, including the report tab if it spoils) on replay completion state, with an explicit skip-to-result affordance for players who do not want to watch. The replay clock already knows elapsed versus total time.
- This lands in the same files req_058 item_138 (ReplayView split, useReplayClock) and req_060 (report verdict) touch; whichever chain lands last rebases trivially, and the completion-gate belongs in the replay clock state so the decomposition should carry it, not fight it.
- The chrono flow: the desk NEW LAP TIME button opens a confirmation modal showing attempts left with a confirm button also labeled NEW LAP TIME. When attempts remain, the desk button can run the attempt directly with the attempts-left count surfaced on the desk button or as a toast; the modal remains only when it adds information (last attempt warning). Aligns with the single-CTA work in req_059 item_141 but is a separate friction.
- Setup forms (profile create, recover, league create/join in SetupViews) are button-submit only; pressing Enter in a filled email or code field does nothing. Wrapping in form elements with onSubmit or key handling fixes it; the e2e spec and App tests pin these flows.
- Quick-start intros (league, plan, garage) come from the req_040 dismissible-help system: they reopen on every reload unless the do-not-show checkbox was ticked. Seen-once-per-league persistence (the existing UI-preferences storage) matches player expectation; the explicit help affordance to reopen them stays.
- The LAP TIMES qualifying panel labels the player's own attempts P1/P2/P3 by rank; during qualifying these read as race positions (the same P-badge styling is used for race standings). Label attempts as attempt ordinals or best/second/third instead; i18n EN/FR parity test applies.
- Key moments in ReportView are result.events filtered to severity major, sliced to five, in order; the 2026-07-20 playtest showed three identical same-lap mechanical-scare lines from different teams plus the player's own race finish as a highlight. Grouping identical same-lap event types into one line and preferring event-type variety in the five slots is a render-side change in ReportView (or its helper), not a simulation change; req_060's verdict block is separate and unaffected.
- All changes are web-side presentation and copy; no API, schema, or simulation output changes.

# Acceptance criteria
- AC1: While the replay is playing, no element on the replay tab reveals the final classification or payoff; after the replay ends or the player uses an explicit skip-to-result control, the payoff appears as today, and a test covers the gating.
- AC2: With attempts remaining, one click on the desk chrono CTA starts the run with the attempts-left count still visible somewhere; a confirmation only appears for the last attempt.
- AC3: Enter submits the profile create, profile recover, and league create/join forms when their required fields are filled.
- AC4: A quick-start intro dismissed once for a league does not reopen on reload for that league, without ticking the checkbox; the help affordance to reopen intros still works.
- AC5: Chrono attempts are ranked without race-position P labels in both locales, and the report's key moments never show duplicate identical lines for the same lap and event type, with entries preferring variety across the five slots.
- AC6: Send plan opens a confirmation summarizing approach, preparation, pit strategy, and card, warning when the inventory holds a playable card and none is selected; the plan screen shows an explicit locked state with visually disabled options; a carried-over plan is labeled with its origin GP until first opened; locking stays irreversible.
- AC7: Returning to a finished Grand Prix lands on the summary (classification and actions), not an auto-playing replay; the replay remains one click away and its exit control carries a visible label, not only an aria-label.
- AC8: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)

# AC Traceability
- AC1 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: replay payoff/report gate remains hidden until completion or Skip to result, then payoff appears; covered by `apps/web/src/app/App.test.tsx`.
- AC2 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: chrono starts on one click while attempts remain and keeps final-attempt confirmation; covered by `apps/web/src/app/App.test.tsx`.
- AC3 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: profile create/recover and league create/join use native submit paths; covered by `apps/web/src/app/App.test.tsx` and `apps/web/src/app/App.profile.test.tsx`.
- AC4 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: league-scoped intro dismissals persist after plain close and reset clears them; covered by `apps/web/src/app/App.test.tsx`.
- AC5 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: chrono ranks use `#` labels and report moments dedupe same displayed lap/event type while preserving variety; covered by `apps/web/src/app/App.test.tsx` and `apps/web/src/features/ReportView.test.tsx`.
- AC6 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: Send plan confirms plan summary, warns for unused playable inventory card, locked plan is explicit, and carried-over plan label is first-visit only; covered by `apps/web/src/app/App.test.tsx`.
- AC7 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: resolved GP entry lands on the summary with Replay one click away, explicit replay routes still work, and replay close shows Back to circuit text; covered by `apps/web/src/app/App.test.tsx` and `apps/web/src/app/App.profile.test.tsx`.
- AC8 -> `task_063_orchestrate_replay_suspense_and_first_contact_polish`. Proof: full validation suite passed at closeout.

> Non-semantic edit: closeout traceability proof added after implementation without changing the accepted need.

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization.md
- logics/request/req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next.md
- apps/web/src/features/ResultView.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/ReportView.tsx
- apps/web/src/app/App.tsx
- apps/web/src/app/SetupViews.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- AI playtest of 2026-07-20 on v0.3.11, playing the full loop (profile, league, chrono, plan, launch, replay, report, garage purchase): the race payoff banner (FINISH P1, points, credits, championship movement) is visible from lap 2 of a 12-lap replay because ResultView passes it as afterMapContent under the live replay, spoiling the outcome the replay is supposed to dramatize; the desk chrono CTA NEW LAP TIME opens a confirmation modal whose confirm button is also labeled NEW LAP TIME, so the very first game action takes two identical clicks; pressing Enter in the profile email field does not submit the form; the three quick-start intros (league, plan, garage) reopen on every page reload until their do-not-show checkbox is ticked, and they overlay the very screen they describe; the LAP TIMES panel ranks the player's own attempts as P1/P2/P3, which reads as race positions; and the report's key moments listed three identical mechanical-scare entries from the same lap plus the player finishing the race as a highlight, so a calm race reads as filler.

# AI Context
- Summary: Replay suspense and first-contact polish from the 2026-07-20 AI playtest
- Keywords: request-chain-scaffold, replay suspense and first-contact polish from the 2026-07-20 ai playtest, development-ready
- Use when: You need to implement or review the scaffolded workflow for Replay suspense and first-contact polish from the 2026-07-20 AI playtest.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_149_gate_the_race_payoff_on_replay_completion`
- `item_150_first_contact_frictions_one_click_chrono_enter_submits_intros_persist`
- `item_151_readability_papercuts_attempt_rank_labels_and_key_moment_variety`
- `item_153_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
