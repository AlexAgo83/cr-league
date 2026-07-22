## item_201_required_env_validation_and_admin_config - Required-env validation and admin config
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Config integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- config.ts (16-35) silently defaults WEB_ORIGIN to localhost, so a missing prod env makes CORS reject the real frontend with no startup error (app.ts:22-32).
- render.yaml never sets ADMIN_TOKEN/ADMIN_EMAILS, so admin token routes 503 and the admin flag is never granted in production.

# Scope
- In:
  - Throw at startup on missing WEB_ORIGIN and DATABASE_URL outside development so misconfiguration fails fast.
  - Declare ADMIN_TOKEN and ADMIN_EMAILS in render.yaml (as sync:false secrets / configured values) so the admin surface works in production.
  - Keep the dev defaults for local runs.
- Out:
  - A full config schema/validation library.
  - Changing the admin authentication mechanism.
  - Adding new runtime secrets beyond the admin envs.

# Acceptance criteria
- AC1: The API fails fast with a clear error on missing WEB_ORIGIN or DATABASE_URL outside development.
- AC2: render.yaml declares ADMIN_TOKEN and ADMIN_EMAILS.
- AC3: Local development still runs on the existing defaults.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: The API fails fast with a clear error on missing WEB_ORIGIN or DATABASE_URL outside development.
- request-AC6 -> This backlog slice. Proof: AC2: render.yaml declares ADMIN_TOKEN and ADMIN_EMAILS.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Primary task(s): `task_089_orchestrate_post_remediation_hardening`

# AI Context
- Summary: Required-env validation and admin config
- Keywords: scaffolded-backlog, required-env validation and admin config, implementation-ready
- Use when: Implementing the scaffolded slice for Required-env validation and admin config.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
