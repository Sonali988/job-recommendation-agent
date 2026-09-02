# NFR Requirements — Unit U2 (Backend)

Non-functional requirements for the FastAPI backend. Decisions: Q1=B (20s AI timeout), Q2=A (<200ms non-AI), Q3=A (single demo user), Q4=A (light AI rate limit), Q5=A (structured JSON to stdout), Q6=A (Bedrock guardrails), Q7=A (cloud-infra rules N/A, documented).

---

## Performance
- **NFR-U2-P1**: Deterministic endpoints (`/api/opportunities`, `/api/case`, `/api/health`, gap/roadmap compute excluding Bedrock) respond in **< 200 ms** on local hardware with in-memory seed data.
- **NFR-U2-P2**: Bedrock-backed endpoints apply a **20 s** timeout; on breach, degrade gracefully (return deterministic fallback / generic degraded response).
- **NFR-U2-P3**: Seed data loaded once at startup and indexed in memory; no per-request file I/O for reads.

## Scalability / Concurrency
- **NFR-U2-S1**: Designed for **a single demo user** at a time (workshop). No horizontal scaling this iteration.
- **NFR-U2-S2**: All request handling is **stateless** (Q6 functional decision) so concurrent requests remain independent should a few users connect.

## Availability / Resiliency (Resiliency baseline — directional)
- **NFR-U2-R1**: Explicit timeouts on all Bedrock/MCP calls (RESILIENCY-06).
- **NFR-U2-R2**: Graceful degradation — AI/MCP failure yields a safe default; UI stays usable (RESILIENCY-10, US-10.2).
- **NFR-U2-R3**: `/api/health` returns status + best-effort Bedrock reachability without a paid call per hit.
- **NFR-U2-R4**: Restartable process; seed data in source control; rollback via Git revert (RESILIENCY-02/04).
- **N/A (local demo)**: multi-AZ/multi-region HA, warm standby, failover runbooks, RTO/RPO targets — documented N/A per Q7.

## Security (Security baseline — blocking). Applicability matrix:
| Rule | Applies to U2? | How addressed / rationale |
|---|---|---|
| SECURITY-01 Encryption at rest/in transit | Partial | No managed data store (read-only seed JSON in repo). Bedrock calls over TLS (boto3/HTTPS). Local store encryption **N/A**. |
| SECURITY-02 Access logging on LB/CDN/API-GW | **N/A** | No load balancer/CDN/API Gateway in local demo. |
| SECURITY-03 Application logging | **Applies** | Structured JSON logs to stdout with timestamp, request/correlation id, level, message; **no secrets/PII** (recruiter + youth contact fields excluded). |
| SECURITY-04 HTTP security headers | Partial | Backend serves JSON (not HTML); apply `X-Content-Type-Options: nosniff` and safe defaults. HTML-specific headers primarily on the frontend (U1). |
| SECURITY-05 Input validation | **Applies** | Pydantic models + explicit bounds on all endpoints; reject unknown ids/oversized payloads. |
| SECURITY-06 Least-privilege IAM | Partial | AWS credentials (env) should be scoped to Bedrock invoke only; documented as a deployment note. |
| SECURITY-07 Restrictive network config | **N/A** | No cloud network/VPC/security groups in local demo. |
| SECURITY-08 App access control + CORS | **Applies (partial)** | No user auth (mock profile selection, per requirements). **CORS restricted** to the local frontend origin (env). Object-level auth N/A (single demo user, no cross-tenant data). |
| SECURITY-09 Hardening / no default creds / safe errors | **Applies** | No default creds; generic production errors (no stack traces); no sample endpoints; pinned runtime. |
| SECURITY-10 Supply chain | **Applies** | Pinned deps via lock file; vulnerability scan step documented in build instructions; trusted registries; no `latest` tags. |
| SECURITY-11 Secure design / rate limiting | **Applies** | Security-relevant logic isolated (config/DI, sanitisation module); **light rate limit on AI endpoints** (Q4); misuse case = accidental Bedrock cost spike addressed by guardrails. |
| SECURITY-12 Auth & credential mgmt | Partial | No user authentication in scope (documented). **No hardcoded credentials**; AWS creds from env only (US-10.1). Password/MFA parts **N/A** (no user auth). |
| SECURITY-13 Integrity verification | Partial | Safe JSON parsing of seed data (no unsafe deserialization). SRI/CDN parts belong to U1. |
| SECURITY-14 Alerting & monitoring | **N/A (local)** | No centralized log service/alerting in local demo; documented N/A. Console logs used for the workshop. |
| SECURITY-15 Exception handling / fail-safe | **Applies** | Global error handler; all external calls (Bedrock/MCP/file) wrapped; **fail closed**; generic user-facing errors; resource cleanup. |

- No **blocking** security findings: every applicable rule is addressed by design; N/A items are cloud-infra/auth features out of scope for the local demo (Q7).

## Maintainability (NFR-7)
- **NFR-U2-M1**: Layered structure (routers/services/clients/data/core); AI and MCP behind protocol interfaces (DI) for swappability.
- **NFR-U2-M2**: Type hints + Pydantic models throughout; docstrings on services.
- **NFR-U2-M3**: Property-based tests (Hypothesis, Partial mode) cover the invariants in business-rules.md (INV-1..INV-5).

## Testing (PBT — Partial)
- **NFR-U2-T1**: PBT-02 round-trip (case/opportunity (de)serialization).
- **NFR-U2-T2**: PBT-03 invariants (no satisfied skill in gaps; prioritise preserves set; progress ∈ [0,100]; matchScore ∈ [0,1]).
- **NFR-U2-T3**: PBT-07/08/09 — quality generators, reproducible shrinking, Hypothesis + pytest.

## Cost / Guardrails (Q6)
- **NFR-U2-C1**: Bedrock calls cap `max_tokens`, trim/limit context size, and are behind the light rate limit — all configurable via env.
