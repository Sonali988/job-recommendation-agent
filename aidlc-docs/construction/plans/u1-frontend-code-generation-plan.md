# Code Generation Plan — Unit U1 (Frontend)

**Location**: `frontend/` at workspace root. **Docs**: `aidlc-docs/construction/u1-frontend/code/`.
Approved with defaults; steps execute in order.

## Target structure (`frontend/`)
```
frontend/
  package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js
  index.html
  .env.example
  src/
    main.tsx, index.css
    app/            App, AppLayout, SideNav, TopBar, ErrorBoundary, routes
    api/            client.ts (typed ApiClient)
    types/          models.ts (TS mirrors of domain types)
    state/          CaseContext.tsx, hooks
    storage/        localRepo.ts
    i18n/           index.ts, en.ts
    components/     Card, StatTile, ProgressRing, MatchScoreRing, Badge, Button, Spinner, EmptyState, DegradedBanner
    features/       login, dashboard, profile, skills, roadmap, opportunities, chat, notifications
  tests/            localRepo round-trip (fast-check), a component test
```

## Steps
- [ ] Step 1 — Scaffold config: package.json, vite/ts/tailwind/postcss configs, index.html, .env.example, index.css
- [ ] Step 2 — Types (`types/models.ts`) mirroring U2 domain
- [ ] Step 3 — ApiClient (`api/client.ts`) with timeout + typed results
- [ ] Step 4 — storage/localRepo + i18n
- [ ] Step 5 — CaseContext + hooks (state, persistence, agent-cycle-on-load, degraded)
- [ ] Step 6 — Reusable components (Card, StatTile, ProgressRing, MatchScoreRing, Badge, Button, Spinner, EmptyState, DegradedBanner)
- [ ] Step 7 — App shell (App, AppLayout, SideNav, TopBar, ErrorBoundary, routing)
- [ ] Step 8 — Feature screens (login, dashboard, profile, skills, roadmap, opportunities, chat, notifications)
- [ ] Step 9 — Tests (fast-check localRepo round-trip; a component render test) + docs (README, code-summary.md)
- [ ] Step 10 — Verify: `npm install` + `npm run build` (typecheck) + `npm test`

## Story coverage
All U1 stories from the story map (E1–E10 UI side). Backend contract: U2 `/api/*`.
