# Logical Components — Unit U2 (Backend)

Logical (technology-aware) components that realize the NFR design patterns, and how they integrate with the functional services from Application/Functional Design. These live under `backend/app/core/` and `backend/app/clients/` unless noted.

---

## Component list

### LC-1 CorrelationMiddleware (`core/logging`)
- **Realizes**: OP-1, OP-3.
- **Behavior**: assigns/propagates a request correlation id; binds it to the structured JSON logger; logs request start/end + duration. Ensures no PII/secrets are logged.
- **Integrates**: FastAPI middleware; wraps all routes.

### LC-2 StructuredLogger (`core/logging`)
- **Realizes**: SECURITY-03, OP-2, OP-3.
- **Behavior**: stdlib `logging` configured to emit JSON lines to stdout (timestamp, correlation id, level, message, event, non-PII ids). Central `get_logger()`.

### LC-3 Settings/Config (`core/config`)
- **Realizes**: env-driven config, SP-5.
- **Behavior**: `pydantic-settings` reads `BEDROCK_MODEL_ID`, `AWS_REGION`, `ALLOWED_ORIGIN`, `AI_TIMEOUT_S`, `AI_MAX_TOKENS`, `AI_RATE_LIMIT`, health-cache TTL, deadline/inactivity windows. Validated at boot.

### LC-4 AIClient wrapper (`clients/bedrock_ai_client`)
- **Realizes**: RP-1, RP-2, RP-3 (partial), SP-7, cost guardrails.
- **Behavior**: wraps boto3 `bedrock-runtime` with botocore timeout config; one bounded retry on transient/throttling; caps `max_tokens`; parses strict JSON and returns `AIResult{raw, parsed, ok}`. Never logs secrets. Exposes `generate(prompt, context)`.
- **Integrates**: injected (DI) into all AI-using services behind the `AIClient` protocol (swappable).

### LC-5 FallbackProvider (per-service, `services/*`)
- **Realizes**: RP-3, RP-4.
- **Behavior**: each service defines its deterministic fallback (assessment/gaps/roadmap/matches/cycle/chat) used when `AIResult.ok` is false; sets `degraded=true` on the response.

### LC-6 RateLimiter (`core/rate_limit`)
- **Realizes**: SP-6, SECURITY-11.
- **Behavior**: lightweight in-process limiter (token bucket / fixed window) applied to AI endpoints; limit configurable via env; returns 429 with generic message when exceeded.

### LC-7 Sanitiser (`core/sanitiser`)
- **Realizes**: SP-2, PII rules (PII-1..3).
- **Behavior**: `sanitise_opportunity()` strips recruiter fields and cleans job text (regex denylist for `@handles`, phone numbers, social tags), trims length. Applied at data load and before Bedrock/UI output.

### LC-8 GlobalErrorHandler (`core/errors`)
- **Realizes**: SP-4, SECURITY-15.
- **Behavior**: FastAPI exception handlers; catches unhandled + known errors; fail-closed; returns generic JSON error; logs internal detail (no leak to client); ensures resource cleanup.

### LC-9 InputValidation (`api/*` via Pydantic)
- **Realizes**: SP-1, SECURITY-05.
- **Behavior**: request/response models with type + bound + format checks; body size limits; unknown ids → 404.

### LC-10 CORSPolicy (`app/main`)
- **Realizes**: SP-3, SECURITY-08.
- **Behavior**: FastAPI CORSMiddleware restricted to `ALLOWED_ORIGIN`, limited methods/headers.

### LC-11 HealthProvider (`core/health`)
- **Realizes**: RP-6, RESILIENCY-06.
- **Behavior**: shallow status (process/config); maintains a periodically-refreshed cached Bedrock-reachability flag (TTL from config) so `/api/health` never triggers a paid call per hit.

### LC-12 CaseIndex (`data/case_repository`)
- **Realizes**: PP-1, PP-2.
- **Behavior**: loads seed JSON once, sanitises opportunities (via LC-7), builds in-memory indexes (opportunities by skill/role; course keyword map); serves reads from memory.

---

## Integration diagram (logical)

```
Request
  |
  v
[LC-1 CorrelationMiddleware] --> [LC-10 CORSPolicy]
  |
  v
[LC-9 InputValidation (Pydantic)] --> API Router
  |
  +--> (AI endpoints) [LC-6 RateLimiter]
  |
  v
Service (Assessment/Gap/Roadmap/Opportunity/Chat/AgentCycle)
  |-- reads --> [LC-12 CaseIndex] (uses [LC-7 Sanitiser])
  |-- AI ------> [LC-4 AIClient wrapper] --(timeout+retry+JSON)--> Bedrock
  |                       |
  |                       +-- on failure --> [LC-5 FallbackProvider] (degraded=true)
  v
Response  (errors funnel through [LC-8 GlobalErrorHandler]; all logged via [LC-2 StructuredLogger])

/api/health --> [LC-11 HealthProvider]
```

## Mapping to functional services
- AssessmentService, GapAnalysisService, RoadmapService, OpportunityService, ChatService, AgentCycleService each depend on **LC-4 (AIClient)**, **LC-5 (fallback)**, and **LC-12 (CaseIndex)**; OpportunityService also uses the MCP mock.
- Cross-cutting LC-1, LC-2, LC-8, LC-9, LC-10, LC-6 apply at the API boundary; LC-7 applies at data load and pre-output; LC-11 backs the health route; LC-3 configures all of the above.
