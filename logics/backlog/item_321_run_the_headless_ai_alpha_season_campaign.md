## item_321_run_the_headless_ai_alpha_season_campaign - Run the headless AI alpha season campaign
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
