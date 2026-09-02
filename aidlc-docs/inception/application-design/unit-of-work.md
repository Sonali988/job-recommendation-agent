# Units of Work — YuvaMitra

**Decomposition** (from unit-of-work-plan.md answers):
- **Granularity (Q1=A)**: 2 units — Frontend (U1) + Backend (U2, includes MCP mock + seed data + case model).
- **Layout (Q2=A)**: two-folder monorepo at workspace root — `frontend/` + `backend/`.
- **Shared types (Q3=A)**: TS interfaces (frontend) and Python models (backend) defined independently; seed JSON is the contract.
- **API contract (Q4=A)**: FastAPI-generated OpenAPI is the reference; frontend ApiClient typed manually against it.
- **CONSTRUCTION sequencing (Q5/Q6 → follow-up A)**: sequential, **Backend (U2) first**, then **Frontend (U1)**.

---

## Unit U2 — Backend (FastAPI)

**Type**: Independently runnable service (local `uvicorn`). Built first.

**Responsibility**: Thin Python/FastAPI proxy that securely calls Amazon Bedrock, loads seed youth-case JSON, runs AI/agent logic, and exposes REST endpoints. Holds AWS credentials server-side (env only). Includes the mocked MCP tool interface and the case data/model.

**Contains (from application design)**:
- API Routers (BC-1)
- AssessmentService (BC-2), GapAnalysisService (BC-3), RoadmapService (BC-4), OpportunityService (BC-5), ChatService (BC-6), AgentCycleService (BC-7)
- AIClient / BedrockAIClient (BC-8)
- MCPToolInterface / MockMCPTools (BC-9)  — folded in per Q1=A
- CaseRepository + seed JSON + case model/types (BC-10, U4-draft folded in per Q1=A)
- Config & Bootstrap (BC-11)

**Modules (logical)**:
- `api` (routers), `services` (AI/agent orchestration), `clients` (Bedrock, MCP mock), `data` (case repo + seed JSON + models), `core` (config, DI, security/resiliency helpers).

**Cross-cutting**: input validation (SECURITY-05), restrictive CORS (SECURITY-08), fail-closed errors (SECURITY-15), structured logging without secrets/PII (SECURITY-03), explicit AI/MCP timeouts + graceful degradation (RESILIENCY-06/10), health endpoint.

**Code organization (greenfield)**:
```
backend/
  app/
    main.py
    api/            # routers per capability
    services/       # assessment, gap, roadmap, opportunity, chat, agent_cycle
    clients/        # bedrock_ai_client.py, mcp_tools.py (mock)
    data/           # case_repository.py, models.py, seed/*.json
    core/           # config.py, di.py, errors.py, logging.py
  tests/            # unit + PBT (Hypothesis)
  pyproject.toml / requirements.txt
  .env.example
```

---

## Unit U1 — Frontend SPA (React 18 + TS + Vite + Tailwind)

**Type**: Static single-page app (local `npm run dev`, prod `npm run build`). Built second, against U2's OpenAPI contract.

**Responsibility**: Deliver the seven core screens + chat + notifications, manage session state, persist in-session changes to localStorage, and call U2 over HTTP. Never contacts Bedrock directly.

**Contains (from application design)**:
- App Shell & Nav (FC-1), Mock Login (FC-2), Dashboard (FC-3), Profile & Case (FC-4), Skills & Gap (FC-5), Roadmap (FC-6), Opportunities (FC-7), Chat (FC-8), Notifications (FC-9)
- CaseContext / AppState (FC-10), ApiClient (FC-11), LocalStorageRepo (FC-12), i18n Provider (FC-13)

**Modules (logical)**: `features/*` (per-screen, feature-based per design Q1), `state` (CaseContext + hooks), `api` (ApiClient), `storage` (LocalStorageRepo), `i18n`, `components` (shared UI), `types` (TS case types).

**Cross-cutting**: accessibility baseline (US-10.3), i18n scaffolding English-only (US-10.4), graceful-degradation UX when backend down (US-10.2), stable `data-testid` on interactive elements.

**Code organization (greenfield)**:
```
frontend/
  src/
    main.tsx
    app/            # shell, routing, layout, nav
    features/       # dashboard, profile, skills, roadmap, opportunities, chat, notifications, login
    state/          # CaseContext, hooks
    api/            # ApiClient (typed against OpenAPI)
    storage/        # localStorage repo
    i18n/
    components/     # shared UI
    types/          # YouthCase and related TS interfaces
  tests/            # unit + PBT (fast-check)
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
```

---

## Repository Layout (workspace root)
```
job-recommendation-agent/
  frontend/        # U1
  backend/         # U2
  aidlc-docs/      # documentation only (unchanged)
```

## CONSTRUCTION Sequence
1. **U2 Backend** — Functional Design → NFR Requirements → NFR Design → Code Generation.
2. **U1 Frontend** — Functional Design → NFR Requirements → NFR Design → Code Generation.
3. **Build and Test** — after both units (build both, unit tests incl. PBT, integration test frontend↔backend).
