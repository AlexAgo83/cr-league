## prod_052_post_remediation_hardening_product_brief - Post-Remediation Hardening Product Brief
> Date: 2026-07-22
> Status: Proposed
> Related request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
> Related backlog: `item_197_close_the_submit_vs_sell_card_race`, `item_198_client_security_and_privacy_hardening`, `item_199_replay_and_dialog_accessibility_baseline`, `item_200_racedecision_data_model_integrity`, `item_201_required_env_validation_and_admin_config`
> Related task: `task_089_orchestrate_post_remediation_hardening`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
After the three review-driven remediation passes (req_085/req_086/req_087) all shipped, a fourth audit of the not-yet-reviewed surfaces found a final concurrency axis plus client-security, accessibility, data-model, and config hardening. This request closes the submit-vs-sell card race, sanitizes and protects client-side secrets and rendering, meets an accessibility baseline for the replay, tightens the RaceDecision data model, and makes production config fail fast instead of silently misconfiguring.

# Goals
- No concurrent operation can attach or keep an invalid card on a plan.
- The web client does not leak credentials, inject unsanitized user values, or ship cleartext in production.
- The replay respects reduced-motion and its dialogs and menus are keyboard-accessible.
- The RaceDecision model has the indexes, FKs, and constraints its access patterns require.
- Production cannot boot into a silently broken CORS or admin configuration.

# Non-goals
- Do not add session auth, CSRF tokens, or replace the claim-code model.
- Do not rewrite the replay animation or trace format.
- Do not migrate schema columns beyond the referenced RaceDecision/enum fields.
- Do not add new dependencies or a CSP/rate-limit infrastructure service.
- Do not redesign any screen; accessibility work is behavior, not visual.

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Task back-reference: `task_089_orchestrate_post_remediation_hardening`
