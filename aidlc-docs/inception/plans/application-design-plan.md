# Application Design Plan — YuvaMitra

**Role**: Application Architect
**Purpose**: Identify the main functional components, their responsibilities, method signatures (high-level), the service layer, and component dependencies for YuvaMitra — based on the approved requirements (FR-1..FR-8, NFR-1..NFR-7), user stories (E1..E10), and the shared "SkillMatch AI" UI mockup reference.

**Note**: Detailed business logic and data-model design happen later in Functional Design (CONSTRUCTION phase). This stage stays at the component/interface/service level.

---

## Context Summary (inputs)
- **Architecture**: React 18 + TS + Vite + Tailwind SPA  ↔  thin Python/FastAPI backend (boto3 → Amazon Bedrock).
- **Data**: read-only seed JSON + browser localStorage for session state.
- **Key capabilities**: profile/case, AI assessment, skills inventory, gap analysis, prioritisation, learning roadmap, next-best-action, opportunities + mocked MCP, chat, notifications, proactive agent cycle.
- **UI reference (mockup)**: dashboard-centric layout — left nav, greeting header + search, profile-strength ring, stat tiles, job/opportunity match cards with match scores, recommended-skills list, application/opportunity tracker, career-guidance CTA, job alerts, top companies row.

---

## Planning Questions (please answer all `[Answer]:` tags)

### Question 1 — Frontend component organization
How should frontend components be organized?

A) By feature/domain — folders per feature (dashboard, profile, skills, roadmap, opportunities, chat, notifications) each with its components (recommended, matches feature-based stories)

B) By type — flat folders (components/, pages/, hooks/, services/)

C) Atomic design — atoms/molecules/organisms/templates/pages

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 2 — Frontend state management
How should app/session state (youth case, alerts, progress in localStorage) be managed?

A) React Context + hooks + a thin localStorage persistence layer (lightweight, no extra deps) (recommended for this scale)

B) Redux Toolkit (with redux-persist)

C) Zustand (small global store with persist middleware)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3 — Frontend ↔ backend API shape
What API style should the backend expose?

A) REST-style JSON endpoints, one per capability (/api/assessment, /api/gap-analysis, /api/roadmap, /api/chat, /api/agent-cycle, /api/health) (recommended)

B) A single RPC-style endpoint (/api/invoke) with an action field

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 4 — Backend internal structure (FastAPI)
How should the backend be structured internally?

A) Layered: routers (API) → services (AI/agent orchestration) → clients (Bedrock/boto3, MCP) → data-access (JSON loader) (recommended)

B) Flat modules per endpoint

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 5 — AI service abstraction
The frontend and backend both reference "AI". Where should the AI abstraction live?

A) Backend owns all AI logic; frontend has a thin API client only (no AI interface on the client) (recommended — keeps Bedrock creds server-side per US-10.1)

B) Both have an AIService interface (frontend interface calls backend; backend interface calls Bedrock)

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 6 — Agent cycle placement
The proactive agent cycle (detect progress/opportunities/deadlines/inactivity) — where does it run?

A) Backend agent service (deterministic detection + Bedrock reasoning), triggered by frontend on load and on-demand (recommended — centralizes logic, testable)

B) Frontend client-side simulation over the case JSON (per original verification Q7=A)

C) Hybrid — frontend triggers; backend performs detection + reasoning and returns alerts/actions

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 7 — MCP tool interface placement
Where should the mocked MCP tool interface live?

A) Backend — an MCPToolInterface with mock implementations (search opportunities, enroll), callable by the agent/services (recommended)

B) Frontend — mocked tools in the client

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 8 — Terminology alignment with the UI mockup
The mockup uses "Job Matches / Applied Jobs / SkillMatch AI"; requirements use "Opportunities / YuvaMitra". How should we reconcile?

A) Keep YuvaMitra domain terms (Opportunities, Youth, Goal) in code/design; treat the mockup purely as visual/layout inspiration (recommended)

B) Adopt the mockup's job-centric terminology (Jobs, Matches, Applications) as the domain model

C) Hybrid — opportunities are modeled generically but the demo UI presents them as "job matches"

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 9 — Design pattern for AI/MCP swappability
NFR-7 wants AI and MCP boundaries to be replaceable interfaces. Which pattern?

A) Dependency-injected interfaces (protocol/ABC in Python, TS interfaces on client) with concrete impls chosen by config (recommended)

B) Simple module functions, refactor later if needed

C) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Execution Checklist (executed after plan approval)

### Planning
- [x] Analyze context (requirements + stories + UI mockup)
- [x] Create this design plan with checkboxes
- [x] Include mandatory design artifacts in plan
- [x] Generate context-appropriate questions
- [x] Collect answers to all `[Answer]:` tags
- [x] Analyze answers for ambiguity; raise follow-ups if needed (none needed — all A, consistent)
- [x] Obtain explicit approval of this plan

### Generation (mandatory artifacts)
- [x] `application-design/components.md` — components, purposes, responsibilities, interfaces
- [x] `application-design/component-methods.md` — method signatures + I/O types (no detailed business rules yet)
- [x] `application-design/services.md` — service definitions, responsibilities, orchestration
- [x] `application-design/component-dependency.md` — dependency matrix, communication patterns, data flow
- [x] `application-design/application-design.md` — consolidated design document
- [x] Validate design completeness and consistency
- [x] Update `aidlc-state.md` and present completion for approval
