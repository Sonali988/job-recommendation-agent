# Unit of Work Plan — YuvaMitra

**Purpose**: Decompose YuvaMitra into units of work (development groupings) based on the approved requirements, user stories (E1–E10), and application design (13 frontend + 11 backend components). Determine unit boundaries, dependencies, story mapping, and the greenfield code-organization strategy.

**Terminology**: "Unit of Work" = a logical grouping of stories/components for development. This iteration is a local demo with two deployables (frontend SPA + FastAPI backend); units are logical groupings that map to those deployables and their internal modules.

---

## Proposed Units (draft — confirm via questions below)

- **U1 — Frontend SPA** (React 18 + TS + Vite + Tailwind): all feature screens, CaseContext, ApiClient, LocalStorageRepo, i18n. Stories: E1–E9 UI + E10 UI-visible (US-10.2 UX, US-10.3, US-10.4).
- **U2 — Backend Core & AI Services** (FastAPI): routers, Assessment/GapAnalysis/Roadmap/Opportunity/Chat/AgentCycle services, AIClient (Bedrock), CaseRepository, Config/Bootstrap, security/resiliency behaviors. Stories: E4, E5, E7, E9 backend + US-7.x, US-9.x, US-10.1, US-10.2 (server side).
- **U3 — MCP Tool Interface (mock)**: MCPToolInterface + MockMCPTools, consumed by U2's OpportunityService. Stories: US-6.2 (+ supports US-6.1).
- **U4 — Seed Data & Case Model**: youth-case seed JSON + shared case schema/types. Stories: US-1.1, US-1.2 (data), US-2.x, US-3.x (data), FR-2.

---

## Planning Questions (please answer all `[Answer]:` tags)

### Question 1 — Unit granularity
How finely should we decompose the system into units?

A) Two units — Frontend (U1) + Backend (U2, includes MCP mock and data) (coarsest)

B) Three units — Frontend (U1) + Backend core/AI (U2) + Data/Case-model (U4); MCP mock folded into U2

C) Four units — Frontend (U1) + Backend core/AI (U2) + MCP mock (U3) + Data/Case-model (U4) (as drafted above) (recommended — clean boundaries, keeps MCP and data swappable/independent)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 2 — Greenfield code organization / repository layout
How should the code be laid out in the workspace?

A) Two-folder monorepo — `frontend/` (Vite app) + `backend/` (FastAPI app) at the workspace root; shared docs stay in aidlc-docs (recommended, clean separation of the two runtimes)

B) Single-folder with subfolders — everything under `src/` with `src/frontend` and `src/backend`

C) Separate `apps/frontend` + `apps/backend` (apps/ convention)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3 — Shared case schema/types
The youth-case model is used by both frontend (TS types) and backend (Python types). How to handle it?

A) Define independently in each side (TS interfaces + Python models) kept in sync manually; seed JSON is the contract (recommended for a small demo — no build coupling)

B) Generate types from a single JSON Schema / OpenAPI source of truth

C) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 4 — Inter-unit communication (frontend ↔ backend contract)
How should the API contract between U1 and U2 be defined/kept consistent?

A) FastAPI auto-generated OpenAPI schema as the reference; frontend ApiClient typed manually against it (recommended)

B) Hand-written shared contract doc only

C) Generate a typed client from OpenAPI

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 5 — Development / build order
In what order should units be built during Code Generation?

A) Data/Case-model (U4) → Backend+MCP (U2/U3) → Frontend (U1) — bottom-up, backend ready before UI wiring (recommended)

B) Frontend first (U1) against mocked API, then backend

C) Parallel where possible, integrate last

D) Other (please describe after [Answer]: tag below)

[Answer]:C 

### Question 6 — Per-unit CONSTRUCTION treatment
The CONSTRUCTION phase runs per unit (Functional Design, NFR, Code Gen). How to sequence units through it?

A) Complete each unit fully (design → code) before the next, in the build order from Q5 (recommended — matches the per-unit loop)

B) Do Functional/NFR design for all units first, then code all units

C) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Follow-up Clarification (resolve before generation)

I detected a contradiction between your Q5 and Q6 answers:
- **Q5 = C**: build units in parallel, integrate last.
- **Q6 = A**: complete each unit fully (design → code) before the next, *in the build order from Q5*.

Q6 assumes an ordered sequence, but Q5 chose parallel (no fixed order). With only 2 units (Q1 = A: U1 Frontend, U2 Backend incl. MCP + data), please pick how CONSTRUCTION should actually run:

### Follow-up Question 5/6
How should the two units move through the CONSTRUCTION phase (Functional Design → NFR → Code Gen)?

A) Sequential, Backend (U2) first, then Frontend (U1) — backend contract/OpenAPI ready before UI wiring (recommended; supersedes the parallel choice)

B) Sequential, Frontend (U1) first against a mocked API, then Backend (U2)

C) Design both units first (Functional + NFR for U1 and U2), then generate code for both — a design-first split

D) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Execution Checklist (executed after plan approval)

### Part 1 — Planning
- [x] Create this unit-of-work plan with checkboxes
- [x] Include mandatory unit artifacts in plan
- [x] Generate context-appropriate questions
- [x] Collect answers to all `[Answer]:` tags
- [x] Analyze answers for ambiguity; raise follow-ups if needed (Q5/Q6 contradiction resolved via follow-up = A)
- [x] Obtain explicit approval of this plan

### Part 2 — Generation (mandatory artifacts)
- [x] `application-design/unit-of-work.md` — unit definitions, responsibilities, + greenfield code-organization strategy
- [x] `application-design/unit-of-work-dependency.md` — inter-unit dependency matrix
- [x] `application-design/unit-of-work-story-map.md` — stories mapped to units (all E1–E10 assigned)
- [x] Validate unit boundaries and dependencies
- [x] Ensure every story is assigned to a unit
- [x] Update `aidlc-state.md` and present completion for approval

---

## Reference — Greenfield structure patterns (from code-generation rules)
- Greenfield single unit: `src/`, `tests/`, `config/` at root.
- Greenfield multi-unit (microservices): `{unit-name}/src/`, `{unit-name}/tests/`.
- Greenfield multi-unit (monolith): `src/{unit-name}/`, `tests/{unit-name}/`.
- For YuvaMitra (two runtimes), a two-folder layout (`frontend/`, `backend/`) fits the microservices-style pattern with runtime-appropriate internals.
