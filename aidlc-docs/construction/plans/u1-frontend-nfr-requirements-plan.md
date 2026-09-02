# NFR Requirements Plan — Unit U1 (Frontend)

**Unit**: U1 — Frontend SPA. Decisions taken as defaults (user: "keep defaults / continue").

## Defaults applied (recommended)
- **Performance**: initial load fast on local dev; code-split routes if needed; skeleton/loading states for async views.
- **Bundle/security**: no secrets in bundle (US-10.1); dependencies pinned via lock file (SECURITY-10); HTTP security headers are served by the static host in prod (documented), CSP `default-src 'self'` baseline.
- **Accessibility**: WCAG-baseline (keyboard, aria, contrast) as functional-design rules already state (US-10.3).
- **Resiliency**: non-blocking degraded UX; request timeouts + retry affordance (US-10.2).
- **Testing**: Vitest + React Testing Library for components; fast-check for client PBT (localStorage round-trip, apply/save set invariants).
- **Tech stack**: React 18, TypeScript, Vite, Tailwind, React Router; typed ApiClient (fetch) + hooks; no heavy UI lib.

## Execution Checklist
- [x] Analyze U1 functional design + enabled extensions
- [x] Apply default NFR decisions (no open questions)
- [x] Generate `nfr-requirements.md`
- [x] Generate `tech-stack-decisions.md`
- [x] Update state and present for approval
