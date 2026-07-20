## item_167_write_beta_support_runbooks_and_known_limits - Write beta support runbooks and known limits
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Operational documentation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A hosted beta needs operator instructions before problems happen.
- Testers need known limits so support requests do not become avoidable confusion.

# Scope
- In:
  - Document backup, restore, support triage, test-data cleanup, and known limits.
  - Reference concrete commands/config paths already present in the repo.
  - Add docs validation proof at closeout.
- Out:
  - External helpdesk integration.
  - Legal/privacy policy drafting.
  - Automated backup scheduling unless already supported by existing infrastructure.

# Acceptance criteria
- AC5: Runbooks and known-limits docs include concrete commands and recovery steps.
- AC7: Validation passes after documentation changes.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC5: Runbooks and known-limits docs include concrete commands and recovery steps.
- request-AC7 -> This backlog slice. Proof: AC7: Validation passes after documentation changes.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_033_beta_support_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_069_beta_support_hardening`
- Primary task(s): `task_070_orchestrate_beta_support_hardening`

# AI Context
- Summary: Write beta support runbooks and known limits
- Keywords: scaffolded-backlog, write beta support runbooks and known limits, implementation-ready
- Use when: Implementing the scaffolded slice for Write beta support runbooks and known limits.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_070_orchestrate_beta_support_hardening` was finished via `logics-manager flow finish task` on 2026-07-20.
