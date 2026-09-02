# Functional Design Plan — Unit U2 (Backend)

**Unit**: U2 — Backend (FastAPI, incl. MCP mock + seed data + case model).
**Stories**: US-1.1 (case load), US-2.1, US-3.1 (goal/case data), US-4.1/4.2/4.3, US-5.1/5.2, US-6.1/6.2, US-7.1/7.2, US-9.1/9.2/9.3, US-10.1, US-10.2 (backend side).
**Purpose**: Design the detailed, technology-agnostic business logic, domain entities, and business rules for the backend — grounded in the real seed data in `assets/`.

---

## Real Seed Data (source of truth for the domain model)

- **`assets/mybharat_youth_agent_10_users_updated.json`** → `{ schemaVersion, users:[ ... ] }`. Each user (the **YouthCase** source) has: `userId`, `profileId`, `name`, `email`, `mobile`, `gender`, `dob`, `location{state,district,pincode,areaType}`, `youthType`, `education{course,specialization,status,institution,percentage}`, `interests[]`, `languages[]`, `skills[{name,level,years}]`, `certifications[]`, `careerPreferences{roles,industries,locations,workMode,employmentTypes,minSalary,maxSalary,willingToRelocate}`, `jobProfile{status,experienceYears,primarySkills,secondarySkills}`.
- **`assets/updated_job_sheet.json`** → array of `{_source:{ jobTitle, organizationName, functionalArea, requiredSkills[], minSalary, maxSalary, minAge, maxAge, minExperience, maxExperience, jobType, jobLocations[], educationPreferences[], jobPostUrl, jobDescription, recruiter* (PII), status, ... }}` → the **Opportunity** source.
- **`assets/courses.json`** → flat `{id, parent_id, course_name}` taxonomy tree → education/course reference for roadmap mapping.

**Data note (security)**: job records contain recruiter PII (name/mobile/email) and promotional spam. Design must exclude PII from logs (SECURITY-03) and sanitize/trim descriptions before sending to Bedrock or the UI.

---

## Planning Questions (please answer all `[Answer]:` tags)

### Question 1 — Goal & skills for gap analysis
The seed data has `careerPreferences.roles` and `jobProfile.primarySkills/secondarySkills` but no explicit "required skills for goal". How should the goal's required skills be derived for gap analysis?

A) Derive goal-required skills from matching jobs in `updated_job_sheet.json` (aggregate `requiredSkills` of jobs matching the youth's target role) (recommended — uses real data)

B) Ask Bedrock to infer required skills for the stated goal/role

C) Both — start from job-derived skills, let Bedrock augment/refine

D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2 — Opportunity matching / relevance
How should backend select and rank relevant opportunities (jobs) for a youth?

A) Deterministic scoring: skill overlap + role/industry match + location + salary/age/education eligibility, then Bedrock explains top matches (recommended — testable, PBT-friendly)

B) Send candidate jobs + case to Bedrock and let it rank

C) Simple filter only (eligibility), no scoring

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3 — Course/roadmap mapping
How should the learning roadmap use `courses.json`?

A) Map each skill gap to relevant course(s) from the taxonomy by name/keyword match; Bedrock orders them into a plan (recommended)

B) Bedrock generates roadmap freely; courses.json used only as an optional reference list

C) Don't use courses.json for roadmap (skills-only roadmap)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4 — Agent cycle detection rules (deterministic thresholds)
The agent cycle detects progress/opportunities/deadlines/inactivity. For a demo with static seed data, which detections are meaningful?

A) All four, using session-derived signals: progress delta (from completed tasks in localStorage sent to backend), new/expiring opportunities (job `expiredAt` window), inactivity (last-active timestamp), new matches since last cycle (recommended)

B) Only opportunities + deadlines (job expiry), skip progress/inactivity for the demo

C) Bedrock decides what to surface from the case each cycle (non-deterministic)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5 — Bedrock output format
How should services parse Bedrock responses reliably?

A) Prompt Bedrock to return strict JSON matching a schema per capability; validate + fall back to a safe default on parse failure (recommended, resilient)

B) Free-text responses, displayed as-is (chat) and lightly parsed elsewhere

C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6 — "Applied/Saved" job state (mockup showed Applied Jobs / Saved Jobs)
The UI mockup has Applied Jobs / Saved Jobs; seed jobs have `isSaved`. Where does apply/save state live?

A) Session-only in localStorage (frontend), backend stays stateless; backend just returns opportunities + MCP mock enroll result (recommended — matches read-only seed + no server writes)

B) Backend tracks applied/saved per profile in memory for the session

C) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7 — Progress metric definition
"Overall progress" (0–100) needs a definition. How is it computed?

A) Weighted blend: profile completeness + skills-vs-goal coverage + tasks completed (recommended; deterministic, PBT invariant [0,100])

B) Simply % of roadmap tasks completed

C) Bedrock estimates a readiness score

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Execution Checklist (after approval)

### Planning
- [x] Analyze unit context (U2) + real seed data
- [x] Create this functional design plan with checkboxes
- [x] Generate context-appropriate questions
- [x] Collect answers to all `[Answer]:` tags
- [x] Analyze answers for ambiguity; raise follow-ups if needed (none — all consistent)
- [x] Obtain explicit approval of this plan

### Generation (artifacts under construction/u2-backend/functional-design/)
- [x] `domain-entities.md` — YouthCase, Skill, Education, CareerPreferences, JobProfile, Opportunity(Job), Course, Assessment, SkillGap, Roadmap, RoadmapStep, NextBestAction, Alert, AgentCycleResult, JourneyEvent (mapped to real JSON fields)
- [x] `business-logic-model.md` — algorithms: assessment, skills inventory, gap analysis, prioritisation, opportunity matching/scoring, roadmap building, next-best-action, agent-cycle detection, chat context assembly, Bedrock JSON parsing + fallback
- [x] `business-rules.md` — validation, eligibility rules, PII/sanitisation rules, invariants (PBT-03: no satisfied skill in gaps; prioritise preserves set; progress in [0,100]), timeouts/degradation behavior
- [x] Validate design completeness & consistency
- [x] Update `aidlc-state.md` and present completion for approval

**Note**: U2 has no UI, so `frontend-components.md` is N/A here (created during U1 functional design).
