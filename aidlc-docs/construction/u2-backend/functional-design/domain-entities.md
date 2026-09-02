# Domain Entities — Unit U2 (Backend)

Technology-agnostic domain model, mapped directly to the real seed data in `assets/`. Field names follow the seed JSON so the CaseRepository can load without transformation where possible.

---

## Source → Entity mapping
| Seed file | Root shape | Entity |
|---|---|---|
| `mybharat_youth_agent_10_users_updated.json` | `{ schemaVersion, users:[...] }` | `YouthCase` (per user) |
| `updated_job_sheet.json` | `[ { _source:{...} } ]` | `Opportunity` (per `_source`) |
| `courses.json` | `[ {id,parent_id,course_name} ]` | `Course` (taxonomy node) |

---

## YouthCase (aggregate root)
Derived from a `users[]` element.

- `userId: str`
- `profileId: str`
- `name: str`
- `email: str`  *(PII — never logged)*
- `mobile: str` *(PII — never logged)*
- `gender: str`
- `dob: date`
- `location: Location`
- `youthType: enum{STUDENT, JOB_SEEKER, ...}`
- `education: Education`
- `interests: list[str]`
- `languages: list[str]`
- `skills: list[Skill]`
- `certifications: list[str]`
- `careerPreferences: CareerPreferences`
- `jobProfile: JobProfile`
- **Derived at runtime (not in seed)**: `goal: Goal | None`, `sessionState: SessionState` (from client localStorage payload)

### Location
- `state: str`, `district: str`, `pincode: str`, `areaType: enum{Urban, Rural, ...}`

### Education
- `course: str`, `specialization: str`, `status: enum{PURSUING, COMPLETED, ...}`, `institution: str`, `percentage: float`

### Skill
- `name: str`, `level: enum{BEGINNER, INTERMEDIATE, ADVANCED}`, `years: int`

### CareerPreferences
- `roles: list[str]`, `industries: list[str]`, `locations: list[str]`
- `workMode: enum{ONSITE, HYBRID, REMOTE}`, `employmentTypes: list[enum{FULL_TIME, INTERNSHIP, PART_TIME, ...}]`
- `minSalary: int`, `maxSalary: int`, `willingToRelocate: bool`

### JobProfile
- `status: enum{ACTIVELY_LOOKING, ...}`, `experienceYears: int`
- `primarySkills: list[str]`, `secondarySkills: list[str]`

---

## Goal (runtime, from US-3.1)
- `text: str` — natural-language career goal
- `targetRole: str | None` — resolved from text (matches a `careerPreferences.roles` entry when possible)
- `requiredSkills: list[str]` — derived (Q1=C): aggregated from matching Opportunities' `requiredSkills`, then refined by Bedrock

---

## Opportunity (from job `_source`)
- `id: int`
- `jobTitle: str`  *(sanitized — strip promotional spam/handles before use)*
- `organizationName: str`
- `functionalArea: str`, `functionalState: str`
- `requiredSkills: list[str]`
- `minSalary: int`, `maxSalary: int`, `hideSalaryRange: bool`
- `minAge: int`, `maxAge: int`, `noAgePreference: bool`
- `minExperience: int`, `maxExperience: int`
- `jobType: enum{FULL_TIME, PART_TIME, INTERNSHIP, ...}`
- `jobLocations: list[str]`
- `educationPreferences: list[str]`, `anyEducationPreference: bool`
- `genderPreference: enum{ANY, MALE, FEMALE}`
- `jobPostUrl: str`
- `jobDescription: str` *(sanitized/trimmed before Bedrock/UI)*
- `expiredAt: datetime`, `publishedAt: datetime`
- `status: str`, `applicantCount: int`
- **Excluded from domain use / never logged (PII)**: `recruiterName`, `recruiterMobile`, `recruiterEmail`, `employerId`
- **Derived**: `matchScore: float [0..1]`, `matchReasons: list[str]`, `eligible: bool`

### Course (taxonomy node)
- `id: int`, `parentId: int` (0 = root), `courseName: str`
- Helper: tree lookups (children of parent, path to root) for education/roadmap mapping.

---

## AI/Agent-derived Entities

### Assessment (US-4.1)
- `summary: str`, `readinessScore: float [0..100]`, `strengths: list[str]`, `focusAreas: list[str]`

### SkillsInventory (US-4.2)
- `groups: list[{ category: str, skills: list[Skill] }]`

### SkillGap / PrioritizedGap (US-4.3)
- `skill: str`, `currentLevel: enum|None`, `targetLevel: enum`, `importance: float`, `rank: int`

### RoadmapStep (US-5.1)
- `order: int`, `title: str`, `addressesGaps: list[str]`, `suggestedCourses: list[CourseRef]`, `estimatedEffort: str`

### Roadmap
- `steps: list[RoadmapStep]`

### CourseRef
- `courseId: int`, `courseName: str` (from courses.json)

### NextBestAction (US-5.2)
- `id: str`, `title: str`, `type: enum{LEARN, APPLY, PROFILE, ENROLL}`, `relatedId: str|None`, `rationale: str`

### Alert (US-8.x, produced by cycle)
- `id: str`, `type: enum{PROGRESS, OPPORTUNITY, DEADLINE, INACTIVITY, MATCH}`, `message: str`, `severity: enum{INFO, WARN}`, `createdAt: datetime`, `read: bool`, `dismissed: bool`

### AgentCycleResult (US-9.x)
- `alerts: list[Alert]`, `nextBestActions: list[NextBestAction]`, `reassessedGaps: list[PrioritizedGap]`, `progress: float [0..100]`

### JourneyEvent (FR-2.4)
- `at: datetime`, `type: enum{GOAL_SET, GAP_RUN, ACTION_DONE, MILESTONE, CYCLE_RUN}`, `detail: str`

### SessionState (from client localStorage; backend reads, never persists)
- `completedTaskIds: list[str]`, `lastActiveAt: datetime`, `lastCycleAt: datetime|None`, `dismissedAlertIds: list[str]`

---

## ChatMessage (US-7.x)
- `role: enum{user, assistant}`, `content: str`

## AIResult (BedrockAIClient return, Q5=A)
- `raw: str`, `parsed: dict|None`, `ok: bool` — services validate `parsed` against the per-capability schema and fall back safely if `ok` is false.

## HealthStatus (US-10.2)
- `status: enum{ok, degraded}`, `bedrock: enum{reachable, unknown, error}`, `version: str`
