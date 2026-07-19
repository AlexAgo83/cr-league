## req_050_add_a_secured_admin_operations_console - Add a secured admin operations console
> From version: 0.3.8
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Admin operations
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Expose a protected admin entry from the profile menu so operators can inspect production or playtest data without database access.
- Protect all admin API surfaces behind server-side environment configuration; the admin feature must be unavailable when the API has no admin token configured.
- Provide an admin users screen that lists profiles and supports safe account removal.
- Handle recovery codes safely: existing recovery codes are currently stored only as hashes, so the admin must reset and display a new code once instead of trying to reveal existing codes.
- Provide an admin leagues screen that lists leagues with useful operational metadata and lets an operator enter a league context for inspection.
- Keep the first implementation small and auditable: no role model, no database schema change unless required, no hidden destructive bulk actions.

# Context
- `prisma/schema.prisma` stores `Profile.recoveryCodeHash`; plaintext recovery codes are not recoverable by design.
- `apps/api/src/config.ts` currently reads host, port, and web origin only; admin auth should extend config with an optional `adminToken` or equivalent server-side setting.
- `apps/api/src/app.ts` registers league routes when a Prisma client is present; an admin route module can be registered alongside league routes when the same DB dependency exists.
- `apps/api/src/features/leagues/routes.ts` and `store.ts` already contain profile, recovery, league, and admin-proof patterns, but those proofs are team claim-code based and are not sufficient for global admin operations.
- `apps/web/src/app/App.tsx` renders the profile menu and routes game views through `GAME_VIEWS`; the admin entry can be a profile-menu action that opens an admin view or modal workflow.
- The web app already uses localized EN/FR catalogs and should not hard-code new visible admin copy.
- Destructive profile deletion can orphan teams by the existing `Team.profile` relation with `onDelete: SetNull`; acceptance criteria must require tests for this behavior or an intentional store policy.
- League entry should start as inspection/navigation, not silent mutation or claim-code impersonation.

# Acceptance criteria
- AC1: The API reads an admin token from environment/configuration and all `/admin/*` routes return forbidden or unavailable responses when the token is missing or incorrect.
- AC2: Admin authentication uses an HTTP header such as `Authorization: Bearer <token>`; admin credentials are never embedded into the built web bundle.
- AC3: The profile menu exposes an Admin action that opens an admin authentication workflow or admin screen without disrupting the current league session.
- AC4: The admin Users sub-screen lists profiles with id, email, created date, and useful team/league counts; it does not display existing recovery codes.
- AC5: The admin Users sub-screen can reset a profile recovery code and displays the new code once after the reset succeeds.
- AC6: The admin Users sub-screen can delete a profile through an explicit confirmation and refreshes the list afterward.
- AC7: The admin Leagues sub-screen lists leagues with id/code/name/status/current season-round/player count/created date, and includes a control to enter or inspect a selected league.
- AC8: Entering a league from admin mode loads the selected league in a clearly marked admin/inspection context and does not require a player claim code for read-only inspection.
- AC9: EN/FR i18n covers all new visible admin copy.
- AC10: Tests cover API token rejection, users listing, recovery reset, profile deletion, league listing, profile-menu admin entry, and the primary admin screen states.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_021_admin_operations_console_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/product/prod_001_cr_league_product_brief.md
- logics/specs/spec_016_implementation_roadmap.md
- apps/api/src/app.ts
- apps/api/src/config.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/app.test.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/types.ts
- apps/web/src/app/App.test.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/styles/layout.css
- prisma/schema.prisma
- User request: add an admin screen from the profile menu with users/recovery management and league listing/entry; setup should be coordinated through environment configuration.

# AI Context
- Summary: Add a secured admin operations console
- Keywords: request-chain-scaffold, add a secured admin operations console, development-ready
- Use when: You need to implement or review the scaffolded workflow for Add a secured admin operations console.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_126_add_secured_admin_api_operations`
- `item_127_add_profile_menu_admin_console_ui`
