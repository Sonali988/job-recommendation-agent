# Code Generation Plan — Unit U2 (Backend)

**Unit**: U2 — Backend (FastAPI). **Application code location**: `backend/` at the workspace root (`d:\DIC\workshop\yuvamitra\job-recommendation-agent\backend`). **Docs/summaries**: `aidlc-docs/construction/u2-backend/code/` (markdown only).

**This plan is the single source of truth for U2 code generation.** After approval, steps execute in order; checkboxes are marked [x] as completed.

---

## Unit Context
- **Stories covered (backend side)**: US-1.1 (case/profile load), US-2.1/3.1 (case+goal), US-4.1/4.2/4.3 (assessment/inventory/gap), US-5.1/5.2 (roadmap/next-best), US-6.1/6.2 (opportunities + MCP mock), US-7.1/7.2 (chat), US-9.1/9.2/9.3 (agent cycle), US-10.1/10.2 (server-side creds, graceful degradation).
- **Dependencies**: none on U1 (U1 consumes U2's OpenAPI). Runtime dep: Amazon Bedrock (boto3), with deterministic fallbacks so it runs without live AWS during dev.
- **Data**: seed JSON copied/read from `assets/` (youth users, jobs, courses).
- **Design inputs**: functional-design (domain-entities, business-logic-model, business-rules), nfr-requirements, nfr-design (patterns + logical components LC-1..LC-12).

---

## Target Structure (`backend/`)
```
backend/
  app/
    main.py                 # FastAPI app, CORS, middleware, routers, error handlers
    core/
      config.py             # LC-3 Settings (pydantic-settings, env)
      logging.py            # LC-1 CorrelationMiddleware, LC-2 StructuredLogger
      errors.py             # LC-8 GlobalErrorHandler
      rate_limit.py         # LC-6 RateLimiter
      sanitiser.py          # LC-7 Sanitiser (PII strip + spam clean)
      di.py                 # dependency wiring (AIClient, MCP, repo)
    data/
      models.py             # Pydantic domain models (YouthCase, Opportunity, Course, ...)
      case_repository.py    # LC-12 CaseIndex: load seed, sanitise, index
      seed/                 # copies of the three JSON files
    clients/
      ai_client.py          # AIClient protocol + BedrockAIClient (LC-4) + fallback flag
      mcp_tools.py          # MCPToolInterface protocol + MockMCPTools
    services/
      assessment_service.py     # US-4.1/4.2
      gap_service.py            # US-4.3 (+ goal-required skills)
      roadmap_service.py        # US-5.1/5.2 (+ courses mapping)
      opportunity_service.py    # US-6.1/6.2
      chat_service.py           # US-7.1/7.2
      agent_cycle_service.py    # US-9.x
      progress_service.py       # progress metric
    api/
      routes.py             # all REST endpoints
      schemas.py            # request/response Pydantic schemas (LC-9)
  tests/
    test_gap_invariants.py      # PBT (Hypothesis) INV-2/3
    test_progress_invariants.py # PBT INV-4
    test_matching.py            # PBT INV-5 + eligibility
    test_roundtrip.py           # PBT INV-1 (serialisation)
    test_degradation.py         # resiliency: mocked Bedrock failure -> fallback
    test_api.py                 # endpoint smoke tests (TestClient)
    conftest.py
  requirements.txt          # pinned deps
  .env.example
  README.md
```

---

## Generation Steps (execute in order after approval)

- [x] **Step 1 — Project structure & config**
- [x] **Step 2 — Seed data** (users.json, jobs.json, courses.json copied to seed/)
- [x] **Step 3 — Domain models** (`data/models.py`)
- [x] **Step 3b — Model unit tests + PBT round-trip** (INV-1) — PASS
- [x] **Step 4 — Core cross-cutting** (logging, errors, rate_limit, sanitiser)
- [x] **Step 4b — Sanitiser tests** — PASS
- [x] **Step 5 — Repository** (`data/case_repository.py`, tolerant loader + indexes)
- [x] **Step 6 — Clients** (ai_client BedrockAIClient + mcp_tools MockMCPTools)
- [x] **Step 7 — Business services** (progress, assessment, gap+goal skills, roadmap+courses, opportunity scoring, chat, agent_cycle)
- [x] **Step 7b — Service unit tests + PBT** (INV-2/3/4/5 + degradation) — PASS
- [x] **Step 8 — API layer** (schemas, routes, main w/ CORS/middleware/errors/lifespan/DI)
- [x] **Step 8b — API tests** (TestClient, incl. degraded path) — PASS
- [x] **Step 9 — Docs** (README + code-summary.md)
- [x] **Step 10 — Verify**: deps installed, `pytest` = **17 passed** (no live AWS; fallbacks exercised)

---

## Story → Step traceability
| Story | Step(s) |
|---|---|
| US-1.1, US-2.1, US-3.1 | 5, 8 |
| US-4.1/4.2 | 7 (assessment) |
| US-4.3 | 7 (gap + goal skills), 7b |
| US-5.1/5.2 | 7 (roadmap), 8 |
| US-6.1/6.2 | 6 (mcp), 7 (opportunity), 7b |
| US-7.1/7.2 | 7 (chat), 8 |
| US-9.1/9.2/9.3 | 7 (agent_cycle), 8 |
| US-10.1 | 1 (env creds), 6 (no creds client-side), 8 (server-side only) |
| US-10.2 | 4 (errors), 6/7 (fallback), 7b/8b (degradation tests) |

## Verification approach
- Backend must build and tests must pass **without live AWS** (Bedrock calls mocked; deterministic fallbacks exercised).
- PBT (Hypothesis) covers INV-1..INV-5; resiliency test covers graceful degradation.
- Security: no secrets in code; env-only credentials; sanitiser applied; generic errors.
