# Business Logic Model — Unit U2 (Backend)

Technology-agnostic algorithms for each backend capability. Design principle (Q2/Q5=A): **deterministic core logic** for anything testable, **Bedrock for reasoning/explanation/wording**, with strict-JSON parsing and safe fallbacks.

---

## 0. Data loading & sanitisation (foundation)
1. `CaseRepository.load()` reads the three seed files once at startup (read-only).
2. Youth users → `YouthCase[]`; jobs `_source` → `Opportunity[]`; courses → `Course[]` taxonomy.
3. **Sanitise Opportunity** on load: strip recruiter PII fields; clean `jobTitle`/`jobDescription` of promotional handles (e.g., `@EVERYONE`, phone numbers, social tags) via a denylist/regex; trim description length for prompts.
4. Provide indexes: opportunities by required-skill and by role/functionalArea; course lookup by keyword.

---

## 1. Profile Assessment (US-4.1) — AssessmentService.assess
1. Build a compact case context (education, skills, interests, jobProfile, goal).
2. Compute deterministic `readinessScore` (see Progress, §8) and candidate strengths (ADVANCED skills) / focus areas (missing goal skills).
3. Prompt Bedrock (strict JSON schema: summary, strengths[], focusAreas[]) to phrase the narrative.
4. Validate JSON; on failure, return a deterministic fallback assessment built from step 2.

## 2. Skills Inventory (US-4.2) — AssessmentService.skills_inventory
1. Group `skills[]` by inferred category (IT, data, trades, soft-skills) using a keyword map.
2. Merge `jobProfile.primary/secondarySkills` not already present.
3. Return grouped inventory (deterministic; no Bedrock needed).

## 3. Goal-required skills derivation (Q1=C) — GoalService.required_skills
1. Resolve `goal.targetRole` from goal text (match against `careerPreferences.roles` + opportunity `functionalArea`/`jobTitle` keywords).
2. Collect Opportunities matching the target role; aggregate their `requiredSkills` with frequency.
3. Take top-N by frequency as the deterministic base set.
4. Ask Bedrock to refine/augment (strict JSON list); union with base set; validate, else keep base set.

## 4. Skill-Gap Analysis + Prioritisation (US-4.3) — GapAnalysisService
1. `currentSkills` = names from `skills[]` (+ primary/secondary) with levels.
2. `requiredSkills` = from §3.
3. `gaps` = requiredSkills not satisfied at target level. **Invariant (PBT-03): a skill already satisfied never appears in gaps.**
4. `importance(gap)` = frequency-in-matching-jobs × role-criticality weight.
5. `prioritize(gaps)` = stable sort by importance desc, assign `rank`. **Invariant: prioritise preserves the set of gaps (permutation only).**
6. Bedrock optionally adds a one-line rationale per top gap (non-authoritative).

## 5. Opportunity Matching & Ranking (Q2=A) — OpportunityService.list_opportunities
1. **Eligibility filter** (hard rules, §business-rules): age within [minAge,maxAge] unless `noAgePreference`; experience within [minExp,maxExp]; education preference satisfied unless `anyEducationPreference`; gender preference ANY or match; not expired (`expiredAt > now`); status PUBLISHED.
2. **Score** eligible jobs [0..1] = weighted sum of: skill overlap (case skills ∩ requiredSkills), role/industry match (careerPreferences), location match (jobLocations ∩ preferred/relocate), salary fit (overlap of [minSalary,maxSalary] with preference).
3. Sort desc by score; take top-K; attach `matchReasons` (deterministic).
4. Bedrock explains the top matches in friendly language (strict JSON: id → explanation); fallback = deterministic matchReasons.

## 6. Learning Roadmap (Q3=A) — RoadmapService.build_roadmap
1. For each prioritized gap, find candidate `Course`s via keyword/name match against the courses taxonomy (and its parent path for context).
2. Build deterministic step list: one step per gap (or grouped), each with `suggestedCourses` (CourseRef[]) and `addressesGaps`.
3. Ask Bedrock to **order** the steps into a sensible learning sequence and add effort estimates (strict JSON: ordered stepIds + effort); validate, else keep gap-priority order.

## 7. Next-Best Actions (US-5.2) — RoadmapService.next_best_actions
1. Candidate actions: top roadmap step (LEARN), top eligible opportunity (APPLY/ENROLL), profile completion (PROFILE) if profile incomplete.
2. Rank by expected impact (gap importance, match score, completeness delta).
3. Return top actions with rationale (deterministic; Bedrock may reword).

## 8. Progress Metric (Q7=A) — ProgressService.compute (0..100)
`progress = w1*profileCompleteness + w2*skillCoverage + w3*taskCompletion`, weights sum to 1.
- `profileCompleteness` = fraction of key case fields present.
- `skillCoverage` = 1 − (unsatisfied goal skills / total goal skills).
- `taskCompletion` = completedTaskIds / totalRoadmapTasks (from SessionState).
- **Invariant (PBT-03): result clamped to [0,100].** Deterministic; no Bedrock.

## 9. Agent Cycle (Q4=A) — AgentCycleService.run_cycle
Deterministic detection, then compose other services:
1. **Progress**: compare current progress (§8) to SessionState prior; if delta ≥ threshold → PROGRESS alert.
2. **Opportunities/Deadlines**: opportunities with `expiredAt` within N days → DEADLINE alert; brand-new eligible matches since `lastCycleAt` → MATCH/OPPORTUNITY alert.
3. **Inactivity**: `now − lastActiveAt` ≥ inactivity window → INACTIVITY nudge.
4. Reassess gaps (§4), refresh next-best actions (§7), recompute progress (§8).
5. Bedrock phrases alert messages (strict JSON); fallback = templated messages.
6. Return `AgentCycleResult`. Append `JourneyEvent(CYCLE_RUN)`.

## 10. Chat (US-7.x) — ChatService.chat
1. Assemble **relevant** case subset (goal, top gaps, top matches, recent alerts) — not the whole dataset (US-7.2).
2. Send messages + context to Bedrock; return assistant `ChatMessage` (free text is acceptable for chat, Q5 allows chat as the non-JSON case).
3. On timeout/error → degraded reply ("assistant temporarily unavailable"), UI stays usable.

## 11. Bedrock JSON contract & fallback (Q5=A) — AIClient wrapper
- Each capability defines a JSON schema; prompt instructs strict JSON only.
- Parse + validate; on parse/timeout/error → `AIResult.ok=false`, service uses its deterministic fallback.
- Explicit timeout on every call (RESILIENCY-06); no secrets/PII in logs (SECURITY-03).
