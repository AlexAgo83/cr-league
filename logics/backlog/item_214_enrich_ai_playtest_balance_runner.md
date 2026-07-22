## item_214_enrich_ai_playtest_balance_runner - Enrich AI playtest balance runner
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Owner: codex

# Problem
Make `npm run playtest:ai` a better balance runner without adding a real LLM dependency.
Add deterministic extreme scripted profiles that stress cards, pit strategies, economy hoarding, rain gambling, rival targeting, and no-card play.
Report balance metrics that are directly useful for tuning: position distribution, average start-to-finish delta, net credits after purchases, card impact when triggered, and zone usage.
Keep outputs machine-readable through JSON alerts and human-readable through the Markdown report.

# Scope
- In:
  - Enrich `scripts/ai-playtest.ts` with deterministic edge-case profiles.
  - Add balance metrics for positions, deltas, net credits, card impact, and track-zone usage.
  - Refresh `docs/audits/playtest-ai.md` and `.json` as the versioned baseline evidence.
  - Update operator docs for the canonical evidence command.
- Out:
  - Real LLM agents.
  - Browser UX/replay judgement.
  - Card/stat balance changes.

# Acceptance criteria
- AC1: `scripts/ai-playtest.ts` includes additional deterministic profile archetypes for extreme balance cases without using an external LLM.
- AC2: Markdown and JSON output include profile position distribution, average position delta, net credits after purchases, card trigger impact, and zone usage.
- AC3: Alerts remain deterministic and include actionable balance warnings for dominant/weak profiles, dead/overplayed cards, and missing zone coverage.
- AC4: The documented command for balance/playtest evidence is updated.
- AC5: `rtk npm run typecheck`, a short `playtest:ai` smoke, and `rtk npm run logics:validate` pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: `scripts/ai-playtest.ts` includes additional deterministic profile archetypes for extreme balance cases without using an external LLM.
- request-AC2 -> This backlog slice. Proof: AC2: Markdown and JSON output include profile position distribution, average position delta, net credits after purchases, card trigger impact, and zone usage.
- request-AC3 -> This backlog slice. Proof: AC3: Alerts remain deterministic and include actionable balance warnings for dominant/weak profiles, dead/overplayed cards, and missing zone coverage.
- request-AC4 -> This backlog slice. Proof: AC4: The documented command for balance/playtest evidence is updated.
- request-AC5 -> This backlog slice. Proof: AC5: `rtk npm run typecheck`, a short `playtest:ai` smoke, and `rtk npm run logics:validate` pass.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_094_enrich_ai_playtest_balance_runner`
- Primary task(s): `task_095_enrich_ai_playtest_balance_runner`

# AI Context
- Summary: Enrich AI playtest balance runner
- Keywords: backlog-groom, request, enrich ai playtest balance runner, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Enrich AI playtest balance runner.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_094_enrich_ai_playtest_balance_runner` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_094_enrich_ai_playtest_balance_runner.md`.
- Generated locally by logics-manager.
- Task `task_095_enrich_ai_playtest_balance_runner` was finished via `logics-manager flow finish task` on 2026-07-22.

# Tasks
- `task_095_enrich_ai_playtest_balance_runner`
