# YuvaMitra Frontend (Unit U1)

React 18 + TypeScript + Vite + Tailwind SPA. Talks to the U2 backend over HTTP;
never contacts Amazon Bedrock directly (no secrets in the bundle).

## Setup
```bash
cd frontend
npm install
copy .env.example .env    # set VITE_API_BASE_URL if backend isn't on :8000
```

## Run
```bash
npm run dev        # http://localhost:5173
```
Start the backend separately (`uvicorn app.main:app --reload` in `backend/`).

## Scripts
- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` — tsc --noEmit
- `npm test` — Vitest (component + fast-check property tests)

## Config
- `VITE_API_BASE_URL` (default `http://localhost:8000`) — the only config; no secrets.

## Structure
`src/{app,api,types,state,storage,i18n,components,features}`. Screens: login,
dashboard, profile, skills, roadmap, opportunities, chat, notifications.

## Notes
- Session state (goal, applied/saved, completed tasks, dismissed alerts) persists to
  localStorage, namespaced per profile.
- Non-blocking degraded banner appears when the backend/AI is unavailable; the app stays usable.
- `npm audit` reports some vulnerabilities in transitive dev dependencies (build tooling);
  review before production hardening.
