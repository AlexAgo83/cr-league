## item_338_add_e2e_coverage_for_the_0_6_corpus_s_highest_risk_flows - Add E2E coverage for the 0.6 corpus's highest-risk flows
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Test coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- tests/e2e/private-league.spec.ts has zero Playwright coverage of the just-shipped 0.6 beta season lifecycle corpus: variable shop mode, the rival thread, contextual card guidance, and team profiles are never mentioned.
- The commissioner 'Race direction' button (tests/e2e/private-league.spec.ts, around line 153) is only ever asserted visible inside a profile-menu ordering check — it is never actually clicked, so the entire Direction de course commissioner screen has no E2E exercise at all.

# Scope
- In:
  - Add a Playwright scenario that clicks the 'Race direction' / commissioner button and verifies the resulting screen renders with a working reminder action (e.g. the manual 'Relancer les retardataires' / send-reminder control).
  - Add a Playwright scenario that creates a league with the variable shop mode checkbox enabled at creation, and verifies the resulting league's shop UI actually reflects the variable-shop behavior (e.g. showing exactly 6 cards, or whatever the current UI surfaces) rather than the fixed default shop.
  - Add a Playwright scenario that opens a team profile modal from the standings view and verifies it renders (livery/rank/points/etc. as currently implemented).
  - Rival-thread and card-guidance logic can remain unit-tested only (they are pure logic with existing unit coverage per the review) — do not force new E2E scenarios for those unless it is natural to extend one of the three scenarios above to touch them incidentally.
- Out:
  - Rewriting or restructuring the existing 4 E2E test scenarios beyond what's needed to add the new ones.
  - Full E2E coverage of every 0.6 feature — only the three flows named above are required.
  - Changing production UI/UX to make it more testable, beyond adding data-testid where covered by the separate 'replace hardcoded E2E copy' backlog slice.

# Acceptance criteria
- AC1: A Playwright test clicks into the commissioner Race direction screen and asserts on real rendered content and a working reminder action, not just button visibility.
- AC2: A Playwright test creates a league with variable shop mode enabled and asserts the shop UI reflects that mode.
- AC3: A Playwright test opens a team profile modal from standings and asserts it renders expected content.
- AC4: npm run test:e2e passes with the new scenarios included.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A Playwright test clicks into the commissioner Race direction screen and asserts on real rendered content and a working reminder action, not just button visibility.
- request-AC13 -> This backlog slice. Proof: AC2: A Playwright test creates a league with variable shop mode enabled and asserts the shop UI reflects that mode.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Add E2E coverage for the 0.6 corpus's highest-risk flows
- Keywords: scaffolded-backlog, add e2e coverage for the 0.6 corpus's highest-risk flows, implementation-ready
- Use when: Implementing the scaffolded slice for Add E2E coverage for the 0.6 corpus's highest-risk flows.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
