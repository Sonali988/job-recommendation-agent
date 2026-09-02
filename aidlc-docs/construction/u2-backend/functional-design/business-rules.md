# Business Rules — Unit U2 (Backend)

Decision rules, validation, constraints, and invariants for the backend. Grounded in the real seed data and the enabled extensions (Security, Resiliency, PBT Partial).

---

## A. Input Validation (SECURITY-05)
- **VR-1**: `profile_id` / `case_id` must match a known seed profile; unknown → 404 with generic message.
- **VR-2**: Chat `messages` must be a non-empty list of `{role, content}` with bounded length (cap count and per-message size).
- **VR-3**: `OpportunityAction` must specify a supported action (`search`|`enroll`) and a valid `opportunity_id` present in the loaded set.
- **VR-4**: Reject payloads exceeding size limits; coerce/validate types before use.

## B. Opportunity Eligibility Rules (matching filter)
- **ER-1 Age**: if `noAgePreference` is false, youth age (from `dob`) must be within `[minAge, maxAge]`.
- **ER-2 Experience**: `jobProfile.experienceYears` within `[minExperience, maxExperience]`.
- **ER-3 Education**: if `anyEducationPreference` is false, youth `education` must satisfy one of `educationPreferences`.
- **ER-4 Gender**: `genderPreference` is `ANY` or equals youth `gender`.
- **ER-5 Freshness**: `expiredAt > now` and `status == PUBLISHED`.
- **ER-6**: A job failing any hard rule is `eligible=false` and excluded from matches (never scored).

## C. Scoring Rules (Q2=A)
- **SR-1**: `matchScore ∈ [0,1]`; weights for {skill overlap, role/industry, location, salary} are configurable and sum to 1.
- **SR-2**: Skill overlap uses case-insensitive, normalized skill names (trim, lowercase, alias map e.g. "JS"→"JavaScript").
- **SR-3**: `matchReasons` must be derived only from deterministic factors (auditable), independent of Bedrock text.

## D. Goal & Gap Rules
- **GR-1**: If goal text cannot resolve to a role, fall back to `careerPreferences.roles[0]`; if none, mark goal `targetRole=None` and surface a "set a clearer goal" nudge.
- **GR-2 (PBT-03 invariant)**: A skill the youth already holds at/above target level MUST NOT appear in gaps.
- **GR-3 (PBT-03 invariant)**: `prioritize(gaps)` returns a permutation of its input — same set, no additions/removals.
- **GR-4**: Gap `targetLevel` defaults to `INTERMEDIATE` unless job data implies higher.

## E. Progress Rules
- **PR-1 (PBT-03 invariant)**: `progress` is clamped to `[0,100]` for all inputs (including empty/missing session state → 0-based components).
- **PR-2**: Progress is deterministic — identical inputs yield identical output (no Bedrock).

## F. Agent Cycle Rules (Q4=A)
- **CR-1**: DEADLINE alerts only for opportunities expiring within the configured window (default 14 days) and still eligible.
- **CR-2**: INACTIVITY nudge only if `now − lastActiveAt ≥` inactivity window (default 7 days); if no timestamp, treat as active (no nudge).
- **CR-3**: MATCH alerts only for newly-eligible opportunities not present at `lastCycleAt`.
- **CR-4**: PROGRESS alert only when progress delta ≥ threshold (default 5 points).
- **CR-5**: The cycle never mutates seed data; it returns results the client persists to localStorage.

## G. PII & Sanitisation Rules (SECURITY-03)
- **PII-1**: `recruiterName`, `recruiterMobile`, `recruiterEmail`, `employerId`, youth `email`/`mobile` MUST NOT appear in logs.
- **PII-2**: Before sending any opportunity text to Bedrock or the UI, strip promotional handles/spam (`@...`, embedded phone numbers, social-network tags) and trim length.
- **PII-3**: Structured logs include only non-PII identifiers (e.g., `profileId`, `job id`) and event types.

## H. Bedrock / AI Rules (Q5=A)
- **AI-1**: Every capability that needs structured output prompts for strict JSON and validates against its schema.
- **AI-2**: On parse failure, timeout, or error, use the deterministic fallback for that capability (`AIResult.ok=false`).
- **AI-3**: Model id and region come from environment variables with sensible defaults (FR-7.2); credentials from env only (US-10.1, SECURITY-12).
- **AI-4**: Every Bedrock/MCP call has an explicit timeout (RESILIENCY-06).

## I. Error Handling & Degradation (SECURITY-15, RESILIENCY-10)
- **EH-1**: Global handler catches unhandled errors → generic message, no internals/stack leaked.
- **EH-2**: AI/MCP failures degrade gracefully: capability returns a safe default; endpoint returns 200 with a `degraded: true` flag where a result is expected, or a generic error where not.
- **EH-3**: `/api/health` reports `status` and best-effort Bedrock reachability without making a paid call on every hit.

## J. CORS & Transport (SECURITY-08)
- **TR-1**: CORS restricted to the configured local frontend origin (env), methods limited to those used.
- **TR-2**: Backend is the only holder of AWS credentials; the frontend never receives them (US-10.1).

## K. Statelessness (Q6=A)
- **ST-1**: Backend keeps no per-user persistent state; applied/saved job state lives in the client's localStorage.
- **ST-2**: Session-derived signals (completed tasks, timestamps) are passed in by the client per request; the backend treats them as inputs, not stored state.

---

## Invariants summary (for PBT — Hypothesis, Partial mode)
- **INV-1 (round-trip, PBT-02)**: YouthCase/Opportunity (de)serialization round-trips without loss.
- **INV-2 (GR-2)**: no satisfied skill appears in gaps.
- **INV-3 (GR-3)**: prioritise preserves the gap set (permutation).
- **INV-4 (PR-1)**: progress ∈ [0,100] for all inputs.
- **INV-5 (SR-1)**: matchScore ∈ [0,1] for all eligible jobs.
