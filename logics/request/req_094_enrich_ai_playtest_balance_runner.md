## req_094_enrich_ai_playtest_balance_runner - Enrich AI playtest balance runner
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Balance tooling
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make `npm run playtest:ai` a better balance runner without adding a real LLM dependency.
- Add deterministic extreme scripted profiles that stress cards, pit strategies, economy hoarding, rain gambling, rival targeting, and no-card play.
- Report balance metrics that are directly useful for tuning: position distribution, average start-to-finish delta, net credits after purchases, card impact when triggered, and zone usage.
- Keep outputs machine-readable through JSON alerts and human-readable through the Markdown report.

# Context
- The existing runner already simulates script-driven AI profiles through the real shared `simulateRace` engine.
- This is an equilibrium/balance tool, not a product-comprehension test. It should remain deterministic and cheap.
- Canonical track zones are now available on race events and replay facts, so playtest output can count where gameplay moments happen.
- Existing generated evidence lives under `docs/audits/`; local `reports/` remains mostly ignored.

# Acceptance criteria
- AC1: `scripts/ai-playtest.ts` includes additional deterministic profile archetypes for extreme balance cases without using an external LLM.
- AC2: Markdown and JSON output include profile position distribution, average position delta, net credits after purchases, card trigger impact, and zone usage.
- AC3: Alerts remain deterministic and include actionable balance warnings for dominant/weak profiles, dead/overplayed cards, and missing zone coverage.
- AC4: The documented command for balance/playtest evidence is updated.
- AC5: `rtk npm run typecheck`, a short `playtest:ai` smoke, and `rtk npm run logics:validate` pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- scripts/ai-playtest.ts
- docs/balance-simulations.md
- docs/ai-app-test-runbook.md
- docs/audits/README.md
- docs/audits/playtest-ai.md
- docs/audits/playtest-ai.json
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/race.ts

# AI Context
- Summary: Enrich AI playtest balance runner.
- Keywords: ai-playtest, balance runner, deterministic profiles, card metrics, zone usage
- Use when: Updating or interpreting AI playtest balance evidence.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_214_enrich_ai_playtest_balance_runner`
- `item_214_enrich_ai_playtest_balance_runner`
