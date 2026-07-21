## req_070_split_large_web_views_from_the_initial_bundle - Split large web views from the initial bundle
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Reduce initial JavaScript downloaded and parsed by moving large secondary screens behind dynamic imports.
- Keep the core league shell, navigation, authentication/profile state, and first useful screen immediately available.
- Preserve every existing route/view transition, modal, and replay/report access path while splitting code.
- Give future contributors a clear pattern for lazily loaded views without adding routing or state-management dependencies.

# Context
- The app is a Vite React workspace under apps/web.
- The current dependency set is intentionally small: React, React DOM, Vite, and local shared package.
- No router library is currently used, so code-splitting should fit the existing app state/view switch rather than introducing a routing framework.
- Build warnings currently mention chunks over 500 kB after minification.

# Acceptance criteria
- AC1: Garage, championship, report, and replay views are loaded through React.lazy or equivalent dynamic imports only when their view is selected.
- AC2: The initial app shell keeps rendering without a blank page, with a small loading fallback that matches the existing visual system.
- AC3: Switching to and from split views preserves current state, selected league, active GP/chrono context, and modal behavior.
- AC4: The production build emits separate chunks for at least two secondary views and reduces the initial JS chunk compared with the pre-change baseline.
- AC5: Typecheck, lint, unit tests, build, and the private league e2e flow pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_034_web_view_code_splitting_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/package.json
- apps/web/src/app/App.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/ChampionshipView.tsx
- apps/web/src/features/ReportView.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/styles/layout.css
- Current diagnostic: the web production build emits one main JS bundle around 714 kB uncompressed / 200 kB gzip, and the app currently has no React.lazy or dynamic imports in source.
- Current diagnostic: secondary views such as garage, championship, report, and replay are not required for the first interactive screen but are included in the initial bundle.

# AI Context
- Summary: Split large web views from the initial bundle
- Keywords: request-chain-scaffold, split large web views from the initial bundle, development-ready
- Use when: You need to implement or review the scaffolded workflow for Split large web views from the initial bundle.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_168_lazy_load_secondary_web_views`
