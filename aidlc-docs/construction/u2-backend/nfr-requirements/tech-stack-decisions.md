# Tech Stack Decisions — Unit U2 (Backend)

Confirmed backend stack and libraries with rationale. All dependencies pinned via a lock file from trusted registries (SECURITY-10); no `latest` tags.

---

## Runtime & Framework
| Concern | Choice | Rationale |
|---|---|---|
| Language | **Python 3.11+** | Per requirements; strong AWS/AI ecosystem. |
| Web framework | **FastAPI** | Async, Pydantic validation, auto OpenAPI (Q4 from app design), minimal boilerplate. |
| ASGI server | **Uvicorn** | Standard FastAPI server; `uvicorn app.main:app --reload` for dev. |
| Data validation | **Pydantic v2** | Enforces SECURITY-05 input validation; models mirror the seed JSON entities. |

## AI & Tools
| Concern | Choice | Rationale |
|---|---|---|
| Bedrock access | **boto3** (`bedrock-runtime`) | Official AWS SDK; credentials/model/region from env (FR-7.2, US-10.1). |
| Timeouts | **botocore Config** (connect/read) set to 20 s (Q1) | Enforce NFR-U2-P2 / RESILIENCY-06. |
| MCP tools | **In-code mock** behind `MCPToolInterface` protocol | Swappable for real MCP later (NFR-7). |

## Cross-cutting
| Concern | Choice | Rationale |
|---|---|---|
| Logging | **stdlib `logging`** configured as **structured JSON to stdout** (Q5) | SECURITY-03; no PII; correlation id per request. |
| Rate limiting | **Lightweight in-process limiter** on AI endpoints (Q4/Q6) | Prevent accidental Bedrock cost spikes (SECURITY-11). |
| CORS | **FastAPI CORSMiddleware**, origin from env | SECURITY-08 restrictive CORS. |
| Config | **pydantic-settings** (env-driven `Settings`) | Central env config; DI selection of AIClient/MCP (app design Q9). |
| Error handling | **FastAPI exception handlers** (global) | SECURITY-15 fail-closed, generic errors. |

## Testing
| Concern | Choice | Rationale |
|---|---|---|
| Test runner | **pytest** | Standard; integrates with Hypothesis. |
| Property-based | **Hypothesis** (Partial mode) | PBT-09; verifies INV-1..INV-5. |
| HTTP tests | **FastAPI TestClient / httpx** | Endpoint + integration tests. |

## Packaging & Layout
- Layout (from unit-of-work.md): `backend/app/{main,api,services,clients,data,core}` + `backend/tests`.
- Dependency management: `requirements.txt` (pinned) or `pyproject.toml` + lock; `.env.example` documents `BEDROCK_MODEL_ID`, `AWS_REGION`, `ALLOWED_ORIGIN`, `AI_TIMEOUT_S`, `AI_MAX_TOKENS`, `AI_RATE_LIMIT`.
- Vulnerability scan step documented in build-and-test instructions (SECURITY-10).

## Env Variables (contract)
| Var | Purpose | Default |
|---|---|---|
| `BEDROCK_MODEL_ID` | Bedrock model id | a sensible default (e.g., a Claude/Nova model id) |
| `AWS_REGION` | Bedrock region | e.g., `us-east-1` |
| `ALLOWED_ORIGIN` | CORS origin | `http://localhost:5173` (Vite default) |
| `AI_TIMEOUT_S` | Bedrock call timeout | `20` |
| `AI_MAX_TOKENS` | Output token cap | configurable |
| `AI_RATE_LIMIT` | AI endpoint rate limit | configurable |

**Note**: AWS credentials themselves come from the standard AWS credential chain (env/profile), never committed (US-10.1, SECURITY-12).
