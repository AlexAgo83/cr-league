## item_292_extract_the_shared_playtest_brain_decisions_fun_frustration_into_one_module - Extract the shared playtest brain (decisions + fun/frustration) into one module
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: AI playtest tooling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The decision heuristics are duplicated: ai-playtest.ts:256+ (decisionFor/approachFor/preparationFor/pitStrategyFor/buyNextCard) and simulate-playtest.ts:239+ (decisionFor/cardFor/nextBuyFor) each keep their own copy, so a brain change must be made twice and can drift.
- funScore/frustrationScore live only in ai-playtest.ts, so any other surface that wants human-feel metrics would re-implement them.
- There is no single place a new consumer (the browser agent) can import the brain from.

# Scope
- In:
  - Create one shared playtest module exposing the persona profiles, the decision brain (approach/preparation/pit/card-buying given state + persona), and funScore/frustrationScore.
  - Refactor ai-playtest.ts and simulate-playtest.ts to consume it and delete their local duplicates, with no behavior change (reports equivalent to before).
  - Keep the module engine-agnostic so it can be fed either simulated state or DOM-read state.
- Out:
  - Changing what the heuristics decide or retuning fun/frustration.
  - The browser agent itself (next item).

# Acceptance criteria
- AC1: A shared playtest brain module is the single source of decisions and fun/frustration scoring.
- AC2: ai-playtest and simulate-playtest consume it, duplicates deleted, reports unchanged.
- AC3: typecheck/test/lint pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A shared playtest brain module is the single source of decisions and fun/frustration scoring.
- request-AC5 -> This backlog slice. Proof: AC2: ai-playtest and simulate-playtest consume it, duplicates deleted, reports unchanged.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_071_ai_playtest_surfaces_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain`
- Primary task(s): `task_120_orchestrate_the_browser_driven_ai_playtest`

# AI Context
- Summary: Extract the shared playtest brain (decisions + fun/frustration) into one module
- Keywords: scaffolded-backlog, extract the shared playtest brain (decisions + fun/frustration) into one module, implementation-ready
- Use when: Implementing the scaffolded slice for Extract the shared playtest brain (decisions + fun/frustration) into one module.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
