# Application Design — YuvaMitra (Consolidated)

This document consolidates the component, method, service, and dependency designs for YuvaMitra. It reflects the approved design decisions (all Q1–Q9 = A) and stays at the component/interface/service level; detailed business logic and data-model schemas are defined in Functional Design (CONSTRUCTION phase).

**Companion documents**
- `components.md` — component definitions and responsibilities
- `component-methods.md` — high-level method signatures and I/O types
- `services.md` — service layer and orchestration patterns
- `component-dependency.md` — dependency matrix, communication, and data flow

---

## 1. Design Decisions (approved)
1. Frontend organized **by feature/domain** (Q1=A).
2. State via **React Context + hooks + localStorage** persistence (Q2=A).
3. Backend exposes **REST endpoints per capability** (Q3=A).
4. Backend is **layered**: routers → services → clients → data-access (Q4=A).
5. **Backend owns all AI logic**; frontend is a thin API client (Q5=A) — keeps Bedrock credentials server-side (US-10.1).
6. Proactive **agent cycle runs in a backend service** (Q6=A) — refines the earlier client-side simulation choice.
7. **MCP tool interface lives in the backend** with mock implementations (Q7=A).
8. **YuvaMitra domain terminology** (Opportunities/Youth/Goal); the "SkillMatch AI" mockup is **visual/layout inspiration only** (Q8=A).
9. AI/MCP boundaries are **dependency-injected interfaces chosen by config** (Q9=A; NFR-7).

## 2. High-Level Architecture

```
+------------------------+       HTTP/JSON        +------------------------------+
|  Frontend (React SPA)  | <--------------------> | Backend (Python / FastAPI)   |
|  feature screens +chat |   (single trust        |  routers -> services ->      |
|  CaseContext + hooks   |    boundary)           |  clients -> data-access      |
|  ApiClient             |                        |  AIClient (boto3->Bedrock)   |
|  LocalStorageRepo      |                        |  MCPToolInterface (mock)     |
|  i18n provider         |                        |  CaseRepository (seed JSON)  |
+------------------------+                        +---------------+--------------+
                                                                  | boto3/HTTPS
                                                                  v
                                                          +-----------------+
                                                          | Amazon Bedrock  |
                                                          +-----------------+
```

## 3. Components (summary)
- **Frontend (FC-1..FC-13)**: App Shell & Nav, Mock Login, Dashboard, Profile & Case, Skills & Gap, Roadmap, Opportunities, Chat, Notifications, CaseContext/AppState, ApiClient, LocalStorageRepo, i18n Provider.
- **Backend (BC-1..BC-11)**: API Routers, AssessmentService, GapAnalysisService, RoadmapService, OpportunityService, ChatService, AgentCycleService, AIClient (Bedrock), MCPToolInterface (mock), CaseRepository, Config & Bootstrap.

Full responsibilities and interfaces: see `components.md`. Method signatures: see `component-methods.md`.

## 4. Service Layer (summary)
Six capability services plus a composite AgentCycleService, all depending on the AIClient/MCP **interfaces** and the CaseRepository. Cross-cutting concerns (validation, CORS, fail-closed errors, structured logging, timeouts) apply across the router/service layer. Orchestration patterns and the agent-cycle composition are detailed in `services.md`.

## 5. Dependencies & Data Flow (summary)
Frontend features depend on CaseContext + ApiClient (not on each other). The only cross-tier channel is HTTP/JSON via ApiClient. Backend services are wired by DI to protocol interfaces. Primary flows (load + agent cycle, gap analysis, MCP action, degradation) and the trust boundaries are detailed in `component-dependency.md`.

## 6. Requirements & Story Traceability
- **FR-1 / E1,E2,E3,E8**: App Shell, Mock Login, Dashboard, Profile, Notifications.
- **FR-2 / E3**: CaseContext, LocalStorageRepo, CaseRepository.
- **FR-3 / E4,E5**: AssessmentService, GapAnalysisService, RoadmapService.
- **FR-4 / E9**: AgentCycleService (backend, on-load + on-demand).
- **FR-5 / E6**: OpportunityService, MCPToolInterface (mock).
- **FR-6 / E1–E9**: the 7 feature screens + chat.
- **FR-7**: API Routers + BedrockAIClient (model/region via env).
- **FR-8 / E10**: i18n Provider.
- **NFR-3 (Security)**: server-side credentials, validation, CORS, fail-closed, structured logging.
- **NFR-4 (Resiliency)**: timeouts, graceful degradation, health endpoint.
- **NFR-5 (PBT Partial)**: round-trip (localStorage/JSON) + gap/prioritisation/progress invariants.
- **NFR-6/7**: accessible UI; swappable AI/MCP interfaces.

## 7. Non-Goals at this stage
- Field-level data schemas, prompt templates, and detailed algorithms (→ Functional Design).
- Cloud infrastructure (Infrastructure Design is SKIPPED this iteration).
- Real MCP wiring and non-English locales (scaffolding only).

## 8. Open Items for Functional Design
- Concrete `YouthCase` and related schemas (Assessment, SkillGap, Roadmap, Opportunity, Alert, Milestone, Task, JourneyEvent).
- Deterministic detection rules for the agent cycle (progress delta thresholds, deadline windows, inactivity period).
- Prompt/context assembly strategy for Bedrock calls (relevant-subset selection).
- PBT properties and generators (fast-check on frontend, Hypothesis on backend).
