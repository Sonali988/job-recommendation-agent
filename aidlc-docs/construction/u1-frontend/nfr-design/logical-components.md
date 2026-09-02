# Logical Components — Unit U1 (Frontend)

Logical components (technology-aware) realizing the NFR patterns, under `frontend/src/`.

### LC-F1 ApiClient (`api/client.ts`)
- Typed fetch wrapper per U2 endpoint; applies timeout via `AbortController`; returns `{ data?, error?, degraded }`.
- Reads `VITE_API_BASE_URL`; never carries secrets.

### LC-F2 CaseProvider / hooks (`state/`)
- React Context holding case, sessionState, cached AI results, degraded flag.
- Hooks: `useCase`, `useAlerts`, `useProgress`, `useDegraded`.

### LC-F3 LocalStorageRepo (`storage/localRepo.ts`)
- `save/load/clear`, namespaced by profileId; round-trip safe (CINV-1).

### LC-F4 ErrorBoundary (`app/ErrorBoundary.tsx`)
- Wraps routed screens; renders fallback UI; logs in dev only (SECURITY-15).

### LC-F5 DegradedBanner (`components/DegradedBanner.tsx`)
- Subscribes to degraded flag; non-blocking banner (US-10.2).

### LC-F6 I18nProvider (`i18n/`)
- `t()` provider; English bundle; locale switch scaffolding.

### LC-F7 Reusable UI (`components/`)
- `Card, StatTile, ProgressRing, MatchScoreRing, Badge, Button, Spinner, EmptyState, Banner` — Tailwind; `data-testid` on interactives.

### LC-F8 Feature screens (`features/*`)
- One folder per screen; each uses ApiClient hooks + context; loading/error/degraded states.

## Integration
```
main -> App (Router + I18nProvider + CaseProvider)
  -> ErrorBoundary -> AppLayout (SideNav, TopBar, DegradedBanner) -> feature screens
       screens -> hooks -> LC-F1 ApiClient -> U2
       mutations -> CaseProvider actions -> LC-F3 LocalStorageRepo
```
