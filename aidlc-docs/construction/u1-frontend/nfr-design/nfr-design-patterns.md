# NFR Design Patterns — Unit U1 (Frontend)

Patterns realizing the U1 NFR requirements (defaults applied).

## Resilience
- **Error boundaries** around routed screens → prevent full-app crashes (SECURITY-15, FRR-1).
- **ApiClient timeout + typed result** `{ data | error | degraded }`; screens render loading/error/degraded states.
- **Global degraded flag** in context → `DegradedBanner` (non-blocking) when any AI call reports `degraded` or fails (US-10.2).
- **Startup health probe** (`GET /api/health`) sets initial connectivity state.

## Performance
- **Session cache** of AI results in context (avoid duplicate `assessment`/`gap`/`roadmap` calls).
- **Route-level lazy loading** (`React.lazy`) available for larger screens.
- **Memoized selectors/derived values** (progress, unread alert count).

## Security
- **No secrets in bundle**; `VITE_*` used only for the public API base URL (US-10.1, SECURITY-12).
- **Input validation** on goal/chat before send (SECURITY-05).
- **Safe rendering**: backend text rendered as text (no `dangerouslySetInnerHTML`) (SECURITY-13).
- **Security headers** set by host/dev config; documented (SECURITY-04).

## Observability
- Minimal, PII-free console logging in dev; error boundary logs component stack in dev only.

## Testing
- Vitest + RTL for interactions; fast-check for CINV-1..3.

## Rule mapping
| Rule | Pattern | Status |
|---|---|---|
| SECURITY-04/05/12/13/15 | headers, validation, no-secrets, safe render, error boundaries | Compliant |
| SECURITY-10 | lock file + npm audit | Compliant |
| RESILIENCY-10 (client) | timeouts + graceful degradation | Compliant |
| SECURITY-01/02/06/07/09/11/14, RESILIENCY DR/HA | — | N/A (server/cloud or out of scope) |
