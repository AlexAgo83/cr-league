## spec_009_playtest_plan - Playtest Plan
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 85%
> Confidence: 87
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`
> Non-semantic edit: 2026-07-23 corpus grooming note added; spec remains Draft.
> Semantic edit: 2026-07-23 refreshed current status so `req_099` precedes the next playtest baseline.

# Purpose
Define how to test whether the CR League loop is fun before building too much.

# Current Status
Keep this spec in Draft. The repository has a private-league checklist, AI playtest report, and balance evidence workflow, and the 0.4.11-0.4.13 hardening/replay-geometry chains are Done. Run the active `req_099` review-findings remediation before using automated evidence as the next human-session gate; the qualifying/replay/garage loop still needs a real 3-to-5 tester session before the playtest plan is settled.

# Test Goal
Validate the core product question:

> Does making a few pre-race decisions create enough tension, understanding, and story to make players want the next Grand Prix?

# Automated Preflight
Run automated evidence before human sessions so obvious balance or replay regressions are fixed first:

- `npm run playtest:ai -- --agents 50 --seasons 3 --rounds 6 --report docs/audits/playtest-ai.md --json docs/audits/playtest-ai.json`
- `npm run balance:sim -- --runs 300 --circuits 4 --limit 10 --json docs/audits/balance-latest.json`

These reports are guards, not substitutes for observation: a PASS means the build is ready to put in front of testers, not that the loop is proven fun.

# First Playtest
Participants:

- 3 to 5 people;
- include at least 1 non-gamer or casual player;
- include at least 1 optimization-oriented player.

Format:

- solo vertical slice first;
- each tester plays 3 Grand Prix;
- observe without over-explaining;
- collect quick feedback after each GP and at the end.

# What To Observe
- Can the player choose a plan without confusion?
- Do they understand weather and circuit tradeoffs?
- Do they understand what the card might do?
- Do they read the report?
- Do they watch the replay?
- Can they explain why they gained or lost positions?
- Do they want to change strategy next race?
- Do they mention a memorable event?

# Questions After Each GP
- What do you think caused your result?
- Did your card matter?
- Did anything feel unfair?
- What would you change next race?
- Was the report useful?
- Was the replay useful?

# Questions After Session
- Would you play another season?
- Would this be fun with coworkers or friends?
- What was the most memorable moment?
- Which decision felt least meaningful?
- Was anything too complicated?
- Did the game feel too random?

# Success Signals
- 4 out of 5 testers understand at least one cause of their result.
- 3 out of 5 testers want to play another GP.
- At least 3 testers can name a memorable race event.
- Casual players finish preparation without external explanation.
- Optimization-oriented players identify at least one strategy they want to test.

# Failure Signals
- Players describe results as random.
- Players ignore cards or cannot explain them.
- Players do not care about next race.
- Reports are not read or do not help.
- Replay feels disconnected from final result.

# Iteration Rules
- If confusion is about wording, fix UI/report copy first.
- If confusion is about causality, improve event timeline/report mapping.
- If boredom is about weak choices, revisit card and decision design.
- If frustration is about randomness, reduce hidden variance or improve forecast context.

# Non-goals
- No monetization testing.
- No public launch metrics.
- No large survey.
- No competitive balance claims from first playtest.

# Open Questions
- Should the first playtest use a clickable prototype or rough coded vertical slice?
- Should testers compare report-only versus replay-plus-report?
- Should multiplayer be tested only after solo loop succeeds?
