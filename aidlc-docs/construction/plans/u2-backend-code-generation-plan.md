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

- [ ] **Step 1 — Project structure & config**: create `backend/` tree, `requirements.txt` (pinned: fastapi, uvicorn, boto3, pydantic, pydantic-settings, hypothesis, pytest, httpx), `.env.example`, `core/config.py`.
- [ ] **Step 2 — Seed data**: copy the three JSON files into `backend/app/data/seed/` (read-only source of truth).
- [ ] **Step 3 — Domain models** (`data/models.py`): Pydantic models from domain-entities.md (YouthCase + nested, Opportunity, Course, Assessment, SkillGap/PrioritizedGap, Roadmap/RoadmapStep, NextBestAction, Alert, AgentCycleResult, JourneyEvent, SessionState, ChatMessage, AIResult, HealthStatus).
- [ ] **Step 3b — Model unit tests + PBT round-trip** (`tests/test_roundtrip.py`): INV-1.
- [ ] **Step 4 — Core cross-cutting**: `logging.py` (LC-1/2), `errors.py` (LC-8), `rate_limit.py` (LC-6), `sanitiser.py` (LC-7).
- [ ] **Step 4b — Sanitiser tests**: assert PII stripped, spam handles removed.
- [ ] **Step 5 — Repository** (`data/case_repository.py`, LC-12): load + sanitise + index seed; `get_case`, `list_profiles`, `list_opportunities_raw`, course index.
- [ ] **Step 6 — Clients**: `ai_client.py` (AIClient protocol + BedrockAIClient with timeout/retry/strict-JSON/guardrails + `AIResult`), `mcp_tools.py` (MCP protocol + MockMCPTools).
- [ ] **Step 7 — Business services** (deterministic core + Bedrock reasoning + fallbacks): progress, assessment, gap (incl. goal-required skills Q1=C), roadmap (courses mapping Q3=A), opportunity (scoring Q2=A), chat, agent_cycle (Q4=A).
- [ ] **Step 7b — Service unit tests + PBT**: `test_gap_invariants.py` (INV-2/3), `test_progress_invariants.py` (INV-4), `test_matching.py` (INV-5 + eligibility), `test_degradation.py` (mock Bedrock failure -> fallback, degraded=true).
- [ ] **Step 8 — API layer**: `api/schemas.py` (LC-9), `api/routes.py` (all endpoints), `main.py` (app, CORS LC-10, middleware, error handlers, DI wiring LC-3/di).
- [ ] **Step 8b — API tests** (`tests/test_api.py`): TestClient smoke tests for each endpoint incl. `/api/health` and a degraded path.
- [ ] **Step 9 — Docs**: `backend/README.md` (run instructions, env vars) + `aidlc-docs/construction/u2-backend/code/code-summary.md` (files created, story coverage).
- [ ] **Step 10 — Verify**: `pip install -r requirements.txt` and run `pytest` (no live AWS needed — Bedrock mocked/fallback); fix failures.

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
