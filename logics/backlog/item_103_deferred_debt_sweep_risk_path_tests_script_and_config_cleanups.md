## item_103_deferred_debt_sweep_risk_path_tests_script_and_config_cleanups - Deferred debt sweep: risk-path tests, script and config cleanups
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Debt cleanup
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The mechanical_scare and mechanic_save branches are the most consequential untested simulation paths.
- The balance script computes cardDelta via a ten-level nested ternary; scripts resolve the shared package through two different paths; shared tests pay jsdom startup for nothing; config.ts accepts a NaN API_PORT; render.yaml migrates during build.

# Scope
- In:
  - Add a deterministic simulateRace test fixture (seed search allowed) that triggers a mechanical_scare and one that triggers a fleet_maintenance mechanic_save, asserting the score/position/event effects.
  - Replace the balance script's nested ternary with a Record lookup plus the weather conditionals.
  - Import shared through one consistent path in scripts.
  - Scope jsdom to web tests (environmentMatchGlobs or per-file pragma) with node as the default environment.
  - Validate API_PORT: fall back to the default when parsing yields NaN.
  - Move prisma migrate deploy from buildCommand to preDeployCommand in render.yaml.
- Out:
  - Testing weather-transition distributions or narrative event text.
  - Changing the release contract or CI workflows beyond the render.yaml line.

# Acceptance criteria
- AC1: Forced mechanical_scare and mechanic_save outcomes are pinned by deterministic tests.
- AC2: The balance script still produces identical output with the lookup table.
- AC3: Shared tests run under node, the API rejects NaN ports safely, and Render applies migrations pre-deploy.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Forced mechanical_scare and mechanic_save outcomes are pinned by deterministic tests.
- request-AC8 -> This backlog slice. Proof: AC2: The balance script still produces identical output with the lookup table.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_repo_review_remediation_pass_4_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish`
- Primary task(s): `task_046_orchestrate_repo_review_remediation_pass_4`

# AI Context
- Summary: Deferred debt sweep: risk-path tests, script and config cleanups
- Keywords: scaffolded-backlog, deferred debt sweep: risk-path tests, script and config cleanups, implementation-ready
- Use when: Implementing the scaffolded slice for Deferred debt sweep: risk-path tests, script and config cleanups.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
