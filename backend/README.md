# YuvaMitra Backend (Unit U2)

Thin Python/FastAPI proxy that securely calls Amazon Bedrock, loads the seed
youth-case / jobs / courses data, and exposes REST endpoints for the YuvaMitra
frontend. AWS credentials stay server-side (never in the browser).

## Requirements
- Python 3.11+
- (Optional) AWS credentials with Amazon Bedrock access for live AI. Without
  them the backend still runs and returns deterministic fallbacks.

## Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env         # then edit as needed
```

## Run
```bash
uvicorn app.main:app --reload
```
- API docs (OpenAPI): http://localhost:8000/docs
- Health: http://localhost:8000/api/health

## Configuration (env)
| Var | Purpose | Default |
|---|---|---|
| `BEDROCK_MODEL_ID` | Bedrock model id | Claude 3.5 Sonnet id |
| `AWS_REGION` | Bedrock region | `us-east-1` |
| `ALLOWED_ORIGIN` | CORS origin (frontend) | `http://localhost:5173` |
| `AI_TIMEOUT_S` | Bedrock call timeout | `20` |
| `AI_MAX_TOKENS` | Output token cap | `1024` |
| `AI_RATE_LIMIT_PER_MIN` | AI endpoint rate limit | `30` |
| `HEALTH_CACHE_TTL_S` | Health cache TTL | `60` |
| `DEADLINE_WINDOW_DAYS` / `INACTIVITY_WINDOW_DAYS` / `PROGRESS_DELTA_THRESHOLD` | Agent-cycle thresholds | 14 / 7 / 5 |

AWS credentials come from the standard AWS credential chain (env/profile/role) —
never place `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` in committed files.

## Endpoints
- `GET /api/health`
- `GET /api/profiles`, `GET /api/case/{profile_id}`
- `POST /api/assessment`, `POST /api/gap-analysis`, `POST /api/roadmap`
- `GET /api/opportunities`, `POST /api/opportunities/act`
- `POST /api/chat`, `POST /api/agent-cycle`

## Tests
```bash
cd backend
pytest
```
Tests run without live AWS (Bedrock is mocked / fallbacks exercised). Coverage
includes PBT invariants (Hypothesis) and graceful-degradation checks.

## Security & resiliency notes
- Recruiter PII and promotional spam are stripped from job data at load and
  before any Bedrock/UI output (`app/core/sanitiser.py`).
- Restrictive CORS, input validation (Pydantic), fail-closed global error
  handling, structured JSON logs (no PII), light rate limiting on AI endpoints.
- Explicit Bedrock timeout + one bounded retry + deterministic fallbacks.
