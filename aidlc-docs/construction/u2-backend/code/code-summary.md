# Code Generation Summary — Unit U2 (Backend)

**Application code location**: `backend/` (workspace root).

## Files created
### Config & packaging
- `backend/requirements.txt` (pinned deps)
- `backend/.env.example`
- `backend/pytest.ini`
- `backend/README.md`
- `backend/app/__init__.py` (+ package `__init__.py` files)

### Core (cross-cutting, LC-1..LC-8, LC-11)
- `backend/app/core/config.py` — Settings (env)
- `backend/app/core/logging.py` — CorrelationMiddleware + structured JSON logger
- `backend/app/core/errors.py` — global fail-closed error handlers
- `backend/app/core/rate_limit.py` — in-process rate limiter
- `backend/app/core/sanitiser.py` — PII strip + spam cleanup
- `backend/app/core/di.py` — dependency wiring (AIClient/MCP/RateLimiter/repo)
- `backend/app/core/health.py` — HealthProvider (shallow + cached flag)

### Data (LC-12)
- `backend/app/data/models.py` — Pydantic domain models
- `backend/app/data/case_repository.py` — tolerant seed loader + indexes
- `backend/app/data/seed/{users,jobs,courses}.json` — copied seed data (read-only)

### Clients (LC-4)
- `backend/app/clients/ai_client.py` — AIClient protocol + BedrockAIClient (timeout/retry/JSON/guardrails)
- `backend/app/clients/mcp_tools.py` — MCPToolInterface + MockMCPTools

### Services
- `progress_service.py`, `skills.py`, `gap_service.py`, `assessment_service.py`,
  `roadmap_service.py`, `opportunity_service.py`, `chat_service.py`, `agent_cycle_service.py`

### API
- `backend/app/api/schemas.py` — request/response models (validation)
- `backend/app/api/routes.py` — all REST endpoints
- `backend/app/main.py` — app, CORS, middleware, error handlers, startup

### Tests
- `test_roundtrip.py` (INV-1), `test_gap_invariants.py` (INV-2/3),
  `test_progress_invariants.py` (INV-4), `test_matching.py` (INV-5 + eligibility),
  `test_sanitiser.py`, `test_degradation.py` (RESILIENCY-14), `test_api.py` (TestClient),
  `conftest.py`

## Story coverage
US-1.1, US-2.1, US-3.1 (case/profile/goal); US-4.1/4.2/4.3 (assessment/inventory/gap);
US-5.1/5.2 (roadmap/next-best); US-6.1/6.2 (opportunities + MCP mock); US-7.1/7.2 (chat);
US-9.1/9.2/9.3 (agent cycle); US-10.1 (server-side creds); US-10.2 (graceful degradation).

## Verification status — PASSED
- Dependencies installed (Python 3.14): pydantic 2.12.5, fastapi 0.124.4, hypothesis 6.167.1, pytest 9.1.1, boto3 1.43.86. (requirements.txt uses version floors because the originally pinned pydantic-core 2.27.2 has no Python 3.14 wheel; generate a lock file for reproducible pins.)
- App imports and loads real seed data: **10 profiles, 79 opportunities (1 malformed job record tolerated/skipped), 171 courses**.
- **`pytest`: 17 passed** — API smoke tests (health/profiles/case/gap/opportunities + 404), graceful-degradation tests (Bedrock unavailable -> deterministic fallback, endpoints still 200), PBT invariants INV-1..INV-5, and sanitiser PII/spam tests.
- Confirmed graceful degradation with no AWS creds: `NoCredentialsError` -> one bounded retry -> fallback -> 200 (US-10.2).
