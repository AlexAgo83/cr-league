## prod_078_credential_storage_and_dependency_currency_product_brief - Credential Storage and Dependency Currency Product Brief
> Date: 2026-07-27
> Status: Proposed
> Related request: `req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation`
> Related backlog: `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`, `item_317_raise_dependency_majors_in_reviewable_steps_under_green_ci`, `item_318_finish_the_residual_app_tsx_state_consolidation_left_by_item_303`
> Related task: `task_127_orchestrate_credential_storage_and_dependency_currency_remediation`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
A whole-repo review found CR League healthy on tests, types, lint, and production dependency audit, with one finding that carries real risk: the master profile recovery code and every team claim code are persisted in plaintext browser storage and replayed as bearer proof on writes, so any script execution in the page yields permanent account takeover. This brief covers replacing that persisted credential with a revocable session credential, restoring dependency currency before the gap compounds, and closing the residual App.tsx state consolidation left by item_303. It deliberately excludes findings that verification cleared and work already owned by req_124 and req_125.

# Goals
- Remove the long-lived plaintext credential from browser storage without regressing any player flow.
- Make the client-held credential revocable and rotatable rather than permanent.
- Return prisma, vite, eslint, and the supporting toolchain to current majors under green CI.
- Reduce App.tsx state sprawl as a bounded, behavior-preserving refactor.
- Keep the review's cleared findings documented so they are not re-investigated later.

# Non-goals
- Do not introduce a full authentication provider, OAuth, JWT infrastructure, or a session store dependency; the product is a casual private-league game and the credential model should stay proportionate.
- Do not change the recovery-by-email product flow, the onboarding copy, or the way players are shown their recovery code once.
- Do not touch shipped image weight or eager bundle splitting; those belong to req_125 and req_124.
- Do not restructure lifecycle.ts again or re-open the item_303 decomposition beyond the residual App.tsx state.
- Do not add CI security scanning, dependency bots, or new lint plugins as part of this work.

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
- Product back-reference: `req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation`
- Task back-reference: `task_127_orchestrate_credential_storage_and_dependency_currency_remediation`
