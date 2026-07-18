## item_094_make_concurrent_league_write_paths_safe - Make concurrent league write paths safe
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Concurrency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- submitQualifyingRun and ensureBotQualifyingRuns read the qualifyingRuns JSON array, append, and write it back without a transaction, so overlapping writes silently drop runs and defeat the attempt limit.
- fillLeagueWithBots can run twice concurrently, hitting the leagueId+name unique constraint and returning an unhandled 500.
- startNextGrandPrix mutates bot credits, creates the next Grand Prix, and resets points in separate writes with no idempotence guard, so double calls 500 and partial failures leave inconsistent state.

# Scope
- In:
  - Wrap qualifyingRuns read+append+write in a transaction that re-reads the Grand Prix row inside it, reusing the existing runWrite/transaction helpers from req_041.
  - Make fillLeagueWithBots idempotent: catch the unique-constraint conflict, re-read the team count, and treat the first writer as the winner.
  - Guard startNextGrandPrix with a conditional updateMany claim on the resolved status (mirroring resolveCurrentGrandPrix) and run the bot purchases, Grand Prix creation, and points reset in one transaction.
  - Move the season-rollover points reset into that same transaction as a single updateMany.
  - Add tests that exercise double submission and double next-grand-prix calls where the test harness allows, at minimum asserting idempotent outcomes on sequential repeat calls.
- Out:
  - Migrating qualifyingRuns to a dedicated table.
  - Advisory locks or queue infrastructure.
  - Changing the card-consumption snapshot behavior beyond re-reading inside the existing resolve transaction if trivially reachable.

# Acceptance criteria
- AC1: Repeated or concurrent qualifying submissions never drop a previously stored run and the attempt limit holds.
- AC2: Duplicate bot-fill attempts return success without duplicate bots or 500s.
- AC3: Calling next-grand-prix twice yields one new Grand Prix and one consistent points state.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Repeated or concurrent qualifying submissions never drop a previously stored run and the attempt limit holds.
- request-AC7 -> This backlog slice. Proof: AC2: Duplicate bot-fill attempts return success without duplicate bots or 500s.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Primary task(s): `task_045_orchestrate_repo_review_remediation_pass_3`

# AI Context
- Summary: Make concurrent league write paths safe
- Keywords: scaffolded-backlog, make concurrent league write paths safe, implementation-ready
- Use when: Implementing the scaffolded slice for Make concurrent league write paths safe.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
