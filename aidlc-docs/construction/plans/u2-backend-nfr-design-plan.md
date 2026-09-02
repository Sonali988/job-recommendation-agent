# NFR Design Plan — Unit U2 (Backend)

**Unit**: U2 — Backend (FastAPI). **Purpose**: Turn the U2 NFR requirements into concrete design patterns and logical components (resilience, performance, security), technology-aware but implementation-light.

**Already settled** (requirements + U2 NFR requirements): 20s Bedrock timeout, <200ms non-AI, single-user, light AI rate limit, structured JSON logs to stdout, Bedrock guardrails (token cap/context trim), cloud-infra/DR rules N/A for local demo. Resiliency user-decisions from Requirements: RTO/RPO N/A, Git-only change mgmt, no CI/CD (local), informal incident response.

---

## Planning Questions (please answer all `[Answer]:` tags)

### Question 1 — Circuit breaker vs simple timeout+fallback (RESILIENCY-10)
For Bedrock/MCP calls, what failure-isolation pattern?

A) Timeout + try/except + deterministic fallback per capability (no breaker) — simplest, sufficient for a single-process demo (recommended)

B) Add a lightweight circuit breaker (open after N consecutive failures, half-open retry) on the Bedrock client

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 2 — Retry policy for Bedrock
Should transient Bedrock errors be retried?

A) One bounded retry with short backoff on transient/throttling errors, within the overall timeout budget (recommended)

B) No retries — fail fast to fallback

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3 — Health check depth (RESILIENCY-06)
What should `/api/health` verify?

A) Shallow only — process up + config loaded (recommended; avoids paid Bedrock calls per hit)

B) Shallow + cached deep check (periodic, cached Bedrock reachability flag)

C) Deep every call (live Bedrock ping) — not recommended (cost)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 4 — Caching strategy (performance)
Should backend cache anything?

A) In-memory cache of seed data + indexes at startup only; no per-request AI caching (recommended)

B) Also cache recent AI results per (profile, capability) for the session to cut Bedrock calls

C) No caching

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 5 — Request correlation / observability (RESILIENCY-05, SECURITY-03)
How should requests be traced in logs?

A) Generate a correlation id per request (middleware), include in every log line; metrics via simple timing logs (recommended for local)

B) Add OpenTelemetry tracing now

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 6 — Resiliency testing approach (RESILIENCY-14 — user decision required)
How will resiliency mechanisms (timeout/fallback/degradation) be validated?

A) Propose a lightweight test plan now (unit tests simulating Bedrock timeout/error → assert graceful degradation), executed in Build and Test (recommended)

B) Use an existing org DR/chaos practice (name it in Other)

C) Defer to Operations phase (capture scenarios only)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 7 — Input sanitisation component (SECURITY-05, PII rules)
Where should job-text sanitisation + PII stripping live?

A) A dedicated `sanitiser` module in `core/`, applied at data load and before Bedrock/UII output (recommended — isolates security-critical logic, SECURITY-11)

B) Inline within each service

C) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Execution Checklist (after approval)

### Planning
- [x] Analyze U2 NFR requirements + resiliency baseline
- [x] Create this NFR design plan with checkboxes
- [x] Generate context-appropriate questions (incl. RESILIENCY-14 user decision)
- [x] Collect answers to all `[Answer]:` tags (all recommended = A)
- [x] Analyze answers for ambiguity; raise follow-ups if needed (none)
- [x] Obtain explicit approval of this plan

### Generation (artifacts under construction/u2-backend/nfr-design/)
- [x] `nfr-design-patterns.md` — resilience (timeout/fallback/optional breaker/retry/degradation), performance (startup indexing/caching), security (validation, CORS, sanitiser, fail-closed, rate limit), observability (correlation id/logging), with RESILIENCY + SECURITY rule mapping
- [x] `logical-components.md` — logical components realizing the patterns (AIClient wrapper w/ timeout+retry+fallback, RateLimiter, Sanitiser, ErrorHandler, HealthProvider, Logger/CorrelationMiddleware, CaseIndex cache) and how they integrate
- [x] Update `aidlc-state.md` and present completion for approval
