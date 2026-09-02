# NFR Design Patterns — Unit U2 (Backend)

Concrete design patterns realizing the U2 NFR requirements. Decisions: Q1=A (timeout+fallback), Q2=A (one bounded retry), Q3=A (shallow health), Q4=A (startup indexing cache), Q5=A (correlation id + timing logs), Q6=A (lightweight resiliency tests in Build and Test), Q7=A (dedicated sanitiser module).

---

## Resilience Patterns (RESILIENCY-06, 10)
- **RP-1 Timeout everywhere**: every Bedrock/MCP call uses an explicit timeout (botocore connect/read → 20 s budget). No unbounded waits.
- **RP-2 Bounded retry**: one retry with short backoff on transient/throttling errors, kept within the total timeout budget (Q2).
- **RP-3 Fallback per capability**: on timeout/error/parse-failure, each service returns its deterministic fallback (assessment, gaps, roadmap, matches, cycle) so the API still responds (Q1).
- **RP-4 Graceful degradation**: AI-dependent responses carry a `degraded: true` flag when fallback was used; chat returns a friendly "temporarily unavailable" message. UI stays usable (US-10.2).
- **RP-5 No circuit breaker** this iteration (single-process demo) — documented as a deliberate simplification; can be added later behind the AIClient wrapper.
- **RP-6 Shallow health** (`/api/health`): reports process-up + config-loaded + a cached Bedrock-reachability flag (never a paid ping per hit) (Q3, RESILIENCY-06).

## Performance Patterns (NFR-U2-P1..P3)
- **PP-1 Startup load + index**: seed JSON loaded once at boot; build in-memory indexes (opportunities by skill/role, course keyword map) so deterministic endpoints stay < 200 ms (Q4).
- **PP-2 No per-request file I/O**: all reads served from memory.
- **PP-3 Context trimming**: prompts include only the relevant case subset + capped candidate lists → lower latency and token cost.
- **PP-4 No AI result caching** this iteration (fresh results); revisit if cost/latency needs it.

## Security Patterns (SECURITY-03, 05, 08, 09, 11, 15)
- **SP-1 Validation at the edge**: Pydantic models validate every request; unknown ids → 404, oversized payloads rejected (SECURITY-05).
- **SP-2 Sanitiser module** (`core/sanitiser`): strips recruiter PII and promotional spam from job text at load and before any Bedrock/UI output; isolates security-critical logic (Q7, SECURITY-11, PII rules).
- **SP-3 Restrictive CORS**: origin from env, limited methods (SECURITY-08).
- **SP-4 Fail-closed error handling**: global exception handler returns generic messages, logs internally (SECURITY-15).
- **SP-5 Secrets via env only**: AWS credentials from the standard credential chain; never in code/logs (US-10.1, SECURITY-12).
- **SP-6 Rate limiting**: light in-process limiter on AI endpoints to cap Bedrock cost (SECURITY-11, guardrails).
- **SP-7 Safe JSON parsing**: strict-schema parse of Bedrock output; no unsafe deserialization (SECURITY-13).

## Observability Patterns (RESILIENCY-05, SECURITY-03)
- **OP-1 Correlation id**: middleware assigns a request id, attached to every structured JSON log line (Q5).
- **OP-2 Timing logs**: per-request duration + per-Bedrock-call duration logged (basic metrics) without OpenTelemetry for this iteration.
- **OP-3 No PII/secrets in logs**: enforced by the logger + sanitiser.

## Testing Patterns (PBT Partial + RESILIENCY-14)
- **TP-1 Property tests** (Hypothesis): INV-1..INV-5 from business-rules.md.
- **TP-2 Resiliency tests** (Q6, RESILIENCY-14): unit tests mock Bedrock timeout/error and assert each capability returns its fallback with `degraded: true`; executed in Build and Test.

---

## Rule Compliance Mapping
| Rule | Pattern(s) | Status |
|---|---|---|
| RESILIENCY-06 Health checks | RP-6 | Compliant (shallow + cached deep flag) |
| RESILIENCY-10 Dependency isolation | RP-1, RP-2, RP-3, RP-4 | Compliant (timeout+retry+fallback+degradation; breaker N/A documented) |
| RESILIENCY-05 Observability | OP-1, OP-2 | Compliant (local-appropriate; centralized service N/A) |
| RESILIENCY-14 Resiliency testing | TP-2 | Compliant (lightweight plan, run in Build and Test) |
| RESILIENCY-01/02/08/09/11/12/13 | — | N/A (local single-process demo; documented) |
| SECURITY-03/05/08/09/11/13/15 | OP-3, SP-1..SP-7 | Compliant |
| SECURITY-02/07/14 | — | N/A (no cloud infra) |
