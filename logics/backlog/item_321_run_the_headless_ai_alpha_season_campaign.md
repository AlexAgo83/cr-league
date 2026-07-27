## item_321_run_the_headless_ai_alpha_season_campaign - Run the headless AI alpha season campaign
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Low
> Theme: Headless alpha evidence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The next 0.6 decision needs more than a single replayability report; it needs a repeatable headless alpha pack.
- The repo already has headless playtest, replayability, and balance scripts, so adding another runner would be waste.
- Without fixed report paths and sample sizes, another AI cannot compare results or resume the campaign cleanly.

# Scope
- In:
  - Run a large AI playtest campaign and write markdown plus JSON under reports/playtest/alpha-seasons/.
  - Run replayability analytics and balance gate after the AI campaign.
  - Record headline metrics: champions, cards bought/played/triggered, profile/approach/pit performance, dominant clusters, comeback rate, close finishes, boring races, title lock round, and balance-gate pass/fail.
- Out:
  - Changing simulation, economy, card effects, or personas.
  - Treating noisy one-run balance-gate rows as tuning proof.

# Acceptance criteria
- AC1: A markdown report and JSON payload exist for the AI campaign.
- AC2: Replayability and balance-gate outputs are regenerated or copied into the alpha evidence folder.
- AC3: The item report states whether headless evidence shows a blocker for 0.6.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A markdown report and JSON payload exist for the AI campaign.
- request-AC2 -> This backlog slice. Proof: AC2: Replayability and balance-gate outputs are regenerated or copied into the alpha evidence folder.
- request-AC5 -> This backlog slice. Proof: AC3: The item report states whether headless evidence shows a blocker for 0.6.
- request-AC6 -> This backlog slice. Proof: AC3: The item report states whether headless evidence shows a blocker for 0.6.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_080_ai_alpha_seasons_evidence_run_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_128_ai_alpha_seasons_evidence_run_stress_the_season_loop_with_headless_and_browser_agents_before_0_6`
- Primary task(s): `task_129_orchestrate_the_ai_alpha_seasons_evidence_run`

# AI Context
- Summary: Run the headless AI alpha season campaign
- Keywords: scaffolded-backlog, run the headless ai alpha season campaign, implementation-ready
- Use when: Implementing the scaffolded slice for Run the headless AI alpha season campaign.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Report
- Completed on 2026-07-27.
- Commands:
  - `npx tsx scripts/ai-playtest.ts --agents 84 --seasons 6 --rounds 6 --league-size 6 --report reports/playtest/alpha-seasons/headless-ai-playtest.md --json reports/playtest/alpha-seasons/headless-ai-playtest.json`
  - `npx tsx scripts/replayability-analytics.ts --seasons 24 --rounds 6 --agents 14 --report reports/playtest/alpha-seasons/replayability.md --json reports/playtest/alpha-seasons/replayability.json`
  - `npm run balance:gate`
- Evidence:
  - `reports/playtest/alpha-seasons/headless-ai-playtest.md`
  - `reports/playtest/alpha-seasons/headless-ai-playtest.json`
  - `reports/playtest/alpha-seasons/replayability.md`
  - `reports/playtest/alpha-seasons/replayability.json`
  - `reports/playtest/alpha-seasons/balance-gate.txt`
- Headline result: no stability or balance-gate blocker for 0.6. Replayability shows 99.31% unique finishing orders, 96.53% comeback race rate, 0% boring races, and title lock average round 5.75.
- Watchpoint: profile-level dominance remains visible in the headless campaign (`sprinter` 63.43% win rate, `all-in-attack` 41.67%), but replayability clusters stay under the 25% dominance threshold.
