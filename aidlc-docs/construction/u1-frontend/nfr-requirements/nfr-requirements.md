# NFR Requirements — Unit U1 (Frontend)

Non-functional requirements for the React SPA. Defaults applied per user direction.

## Performance
- **NFR-U1-P1**: First meaningful render fast on local dev (`npm run dev`); production `npm run build` produces an optimized bundle.
- **NFR-U1-P2**: Async screens show loading skeletons/spinners; AI results cached in context to avoid duplicate calls.
- **NFR-U1-P3**: Route-level code splitting available if the bundle grows.

## Availability / Resiliency (Resiliency baseline — directional)
- **NFR-U1-R1**: Non-blocking degraded UX when U2/AI is unavailable (US-10.2); deterministic data still renders.
- **NFR-U1-R2**: All network calls have timeouts and a retry affordance; no full-screen crashes.
- **N/A (local demo)**: CDN/multi-region hosting, uptime SLAs — documented N/A this iteration.

## Security (Security baseline — blocking). Applicability:
| Rule | Applies to U1? | How addressed / rationale |
|---|---|---|
| SECURITY-03 logging | Partial | Minimal client console logging; no secrets/PII logged. |
| SECURITY-04 HTTP security headers | **Applies (host)** | CSP `default-src 'self'`, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` — set by the static host/dev server config; documented in README. |
| SECURITY-05 input validation | **Applies** | Client-side validation on goal/chat inputs (defense-in-depth; server also validates). |
| SECURITY-08 access control / CORS | Partial | No client auth (mock profile); CORS enforced by U2. |
| SECURITY-10 supply chain | **Applies** | Lock file (package-lock.json) pinned; trusted registry (npm); vuln scan (`npm audit`) documented. |
| SECURITY-12 credentials | **Applies** | No secrets/credentials in the frontend bundle or source (US-10.1). |
| SECURITY-13 integrity | Partial | Treat backend responses as data (no HTML injection); SRI for any external CDN scripts (none planned). |
| SECURITY-15 exception handling | **Applies** | Error boundaries + graceful fallbacks; generic user-facing errors. |
| SECURITY-01/02/06/07/09/11/14 | **N/A** | Server/cloud-infra concerns handled by U2 or out of scope for a static SPA. |

- No blocking security findings.

## Usability & Accessibility (NFR-6, US-10.3)
- **NFR-U1-A1**: WCAG-baseline — keyboard operability, focus visibility, aria labels, contrast, semantic landmarks.
- **NFR-U1-A2**: Responsive layout (mobile + desktop).

## Internationalization (US-10.4)
- **NFR-U1-I1**: All UI strings via i18n; English shipped; adding locales requires no component changes.

## Testing (PBT — Partial)
- **NFR-U1-T1**: Vitest + React Testing Library for component/interaction tests.
- **NFR-U1-T2**: fast-check for client invariants: localStorage round-trip (CINV-1), apply/save set validity/no-dupes (CINV-2), progress clamp (CINV-3).
