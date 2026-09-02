# Tech Stack Decisions — Unit U1 (Frontend)

All dependencies pinned via `package-lock.json` from the npm registry (SECURITY-10); no secrets in the bundle (US-10.1).

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **React 18** | Per requirements. |
| Language | **TypeScript** | Type safety; matches domain types. |
| Build/dev | **Vite** | Fast dev server + optimized build. |
| Styling | **Tailwind CSS** | Utility-first; matches mockup styling. |
| Routing | **react-router-dom** | Left-nav multi-screen SPA (Q1=A). |
| Data/async | **Typed ApiClient (fetch) + custom hooks** | Lightweight, no extra deps (Q2=A). |
| State | **React Context + hooks** | Session state + cached AI results. |
| Persistence | **localStorage** wrapper | Session state, apply/save (Q4=A). |
| i18n | **react-i18next** (or a thin `t()` shim) | Scaffolding; English shipped. |
| Testing | **Vitest + React Testing Library** | Component/interaction tests. |
| Property tests | **fast-check** | Client invariants (PBT Partial). |

## Env / config
- `VITE_API_BASE_URL` — U2 backend base URL (default `http://localhost:8000`).
- No secrets in any `VITE_*` var (they are exposed to the client by design).

## Scripts
- `npm run dev`, `npm run build`, `npm run preview`, `npm test` (Vitest).

## Structure (from unit-of-work.md)
`frontend/src/{app,features,state,api,storage,i18n,components,types}` + `frontend/tests`.
