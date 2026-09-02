# NFR Requirements Plan — Unit U2 (Backend)

**Unit**: U2 — Backend (FastAPI). **Enabled extensions**: Security (blocking), Resiliency (directional), PBT (Partial).
**Purpose**: Capture non-functional requirements and confirm tech-stack choices for the backend. Many NFRs are already fixed in `requirements.md` (local demo, no cloud, Python/FastAPI, Bedrock via boto3); these questions fill the remaining gaps and confirm demo-appropriate N/A calls.

---

## Pre-settled (from requirements.md — no need to re-ask)
- Tech stack: Python 3.11+ / FastAPI / Uvicorn / boto3.
- Deployment: local dev/build only; no cloud HA/DR; rollback via Git revert.
- Security baseline: blocking; server-side credentials; input validation; restrictive CORS; fail-closed; structured logging without PII.
- Resiliency: explicit timeouts, graceful degradation, health endpoint; cloud HA/DR = N/A (local).
- PBT: Partial (Hypothesis + pytest) — invariants already defined in business-rules.md.

---

## Planning Questions (please answer all `[Answer]:` tags)

### Question 1 — AI (Bedrock) call timeout
What timeout should backend apply to each Bedrock call before degrading?

A) 10 seconds (snappy demo; degrade fast)

B) 20 seconds (balanced) (recommended)

C) 30 seconds (allow slower models)

D) Other (please describe after [Answer]: tag below)

[Answer]:B

### Question 2 — Perceived performance target for non-AI endpoints
Target response time for deterministic endpoints (opportunities list, health, case load — excluding Bedrock latency)?

A) < 200 ms (recommended for local, in-memory data)

B) < 500 ms

C) No specific target for the demo

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3 — Concurrency expectation
What concurrency should the backend be designed for this iteration?

A) Single demo user at a time (workshop) — no special concurrency handling (recommended)

B) A handful of concurrent users (small classroom) — ensure requests are independent/stateless

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 4 — Rate limiting (SECURITY-11 public endpoints)
Should the backend apply rate limiting?

A) Light in-process rate limit on AI endpoints to prevent accidental Bedrock cost spikes (recommended)

B) No rate limiting for the local demo

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 5 — Logging destination (SECURITY-03)
Where should structured logs go for this local demo?

A) Structured logs to stdout/console (JSON lines), no external log service (recommended for local; documented as N/A for centralized service)

B) Log to a rotating local file

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 6 — Bedrock cost/safety guardrails
Any guardrails on Bedrock usage for the demo?

A) Cap max tokens + trim context + light rate limit; configurable via env (recommended)

B) No guardrails

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 7 — Confirm demo-appropriate N/A security/resiliency items
Several baseline rules target cloud infra not present in a local demo (load balancer/CDN logging SECURITY-02; network ACLs SECURITY-07; managed-store encryption SECURITY-01; multi-AZ/DR; alerting/retention SECURITY-14; user auth/MFA SECURITY-12 password parts). Confirm handling:

A) Mark these as N/A for the local demo and document the rationale in nfr-requirements.md (recommended)

B) I want to include some of them now (describe which in Other)

C) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Execution Checklist (after approval)

### Planning
- [x] Analyze U2 functional design + enabled extensions
- [x] Create this NFR requirements plan with checkboxes
- [x] Generate context-appropriate questions
- [x] Collect answers to all `[Answer]:` tags
- [x] Analyze answers for ambiguity; raise follow-ups if needed (none — all consistent)
- [x] Obtain explicit approval of this plan

### Generation (artifacts under construction/u2-backend/nfr-requirements/)
- [x] `nfr-requirements.md` — performance/availability/security/resiliency/maintainability NFRs for U2, with SECURITY rule applicability (compliant/N/A) and Resiliency/PBT mapping
- [x] `tech-stack-decisions.md` — confirmed backend stack + libraries (FastAPI, Uvicorn, boto3, pydantic, pytest, Hypothesis, a rate-limit/logging choice) with rationale and pinned-version intent (SECURITY-10)
- [x] Update `aidlc-state.md` and present completion for approval
