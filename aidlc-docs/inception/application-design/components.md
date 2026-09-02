# Application Design — Components

**Scope**: High-level component identification and responsibilities for YuvaMitra. Detailed business logic and data models are defined later in Functional Design (CONSTRUCTION phase).

**Design decisions applied** (from application-design-plan.md):
- Frontend organized by feature/domain (Q1=A).
- State via React Context + hooks + localStorage persistence layer (Q2=A).
- Backend exposes REST endpoints per capability (Q3=A).
- Backend layered: routers → services → clients → data-access (Q4=A).
- Backend owns all AI logic; frontend is a thin API client (Q5=A).
- Agent cycle runs in a backend agent service (Q6=A).
- Backend hosts the mocked MCP tool interface (Q7=A).
- Domain terms follow YuvaMitra (Opportunities, Youth, Goal); the mockup is visual inspiration only (Q8=A).
- AI/MCP boundaries are dependency-injected interfaces chosen by config (Q9=A).

---

## Component Map (overview)

```
+-------------------------------------------------------------+
|                     FRONTEND (React SPA)                    |
|  +-----------------+   +-----------------+                  |
|  | Feature UIs     |   | AppState /      |                  |
|  | (7 screens+chat)|   | CaseContext     |                  |
|  +--------+--------+   +--------+--------+                   |
|           |                    |                            |
|           v                    v                            |
|  +-----------------+   +-----------------+                  |
|  | ApiClient       |   | LocalStorageRepo|                  |
|  +--------+--------+   +-----------------+                   |
+-----------|-------------------------------------------------+
            | HTTP (JSON)
            v
+-------------------------------------------------------------+
|                   BACKEND (Python / FastAPI)                |
|  +-----------------+                                        |
|  | API Routers     |                                        |
|  +--------+--------+                                        |
|           v                                                 |
|  +-----------------+   +-----------------+                  |
|  | AssessmentSvc   |   | AgentCycleSvc   |                  |
|  | GapAnalysisSvc  |   | ChatService     |                  |
|  | RoadmapSvc      |   | OpportunitySvc  |                  |
|  +--------+--------+   +--------+--------+                   |
|           |                    |                            |
|           v                    v                            |
|  +-----------------+   +-----------------+   +------------+  |
|  | AIClient        |   | MCPToolInterface|   | CaseRepo   |  |
|  | (Bedrock/boto3) |   | (mock impls)    |   | (JSON load)|  |
|  +-----------------+   +-----------------+   +------------+  |
+-------------------------------------------------------------+
```

---

## Frontend Components

### FC-1: App Shell & Navigation
- **Purpose**: Application layout, routing, and left-nav navigation mirroring the mockup (Dashboard, Profile, Skills & Gap, Roadmap, Opportunities, Chat, Notifications, Settings).
- **Responsibilities**: Route between feature screens; render persistent nav and header (greeting, search placeholder, alert indicator); guard routes until a demo profile is selected.
- **Interface**: React Router routes; layout components consuming CaseContext.

### FC-2: Mock Login / Profile Selector
- **Purpose**: Let the user pick a demo youth profile (US-1.1).
- **Responsibilities**: List demo profiles from seed data; on selection, load the case and route to Dashboard.
- **Interface**: `ProfileSelector` component reading available profiles via ApiClient/seed.

### FC-3: Dashboard
- **Purpose**: Goal + progress overview (US-2.1, US-2.2), styled after the mockup dashboard.
- **Responsibilities**: Show goal, profile-strength/progress ring, stat tiles (e.g., matches/tasks/milestones), top opportunity match cards, recommended skills, activity/alert summary.
- **Interface**: `Dashboard` screen consuming CaseContext + assessment results.

### FC-4: Profile & Case View
- **Purpose**: View/edit profile, goal, and case data (US-3.1, US-3.2, US-3.3).
- **Responsibilities**: Render case sections; edit goal (natural language); persist in-session edits via LocalStorageRepo.
- **Interface**: `ProfileScreen`, `GoalEditor` components.

### FC-5: Skills & Gap Analysis
- **Purpose**: Show AI assessment, skills inventory, and prioritized gaps (US-4.1, US-4.2, US-4.3).
- **Responsibilities**: Request assessment/gap analysis via ApiClient; render inventory and prioritized gaps with demand-style tags (mockup "Recommended Skills to Improve").
- **Interface**: `SkillsScreen`, `GapList`, `SkillsInventory`.

### FC-6: Learning Roadmap
- **Purpose**: Ordered plan + next-best actions (US-5.1, US-5.2).
- **Responsibilities**: Request roadmap via ApiClient; render ordered steps mapped to gaps; allow marking actions done (persists + journey event).
- **Interface**: `RoadmapScreen`, `NextBestActions`.

### FC-7: Opportunities
- **Purpose**: Present relevant opportunities and MCP actions (US-6.1, US-6.2), styled like mockup job-match/tracker cards.
- **Responsibilities**: Show opportunities with match info; invoke mocked MCP tool actions (search/enroll) via ApiClient; reflect results.
- **Interface**: `OpportunitiesScreen`, `OpportunityCard`, `OpportunityTracker`.

### FC-8: Chat with Agent
- **Purpose**: Conversational interface (US-7.1, US-7.2).
- **Responsibilities**: Send messages to backend chat endpoint with case context; render conversation.
- **Interface**: `ChatScreen`, `MessageList`, `Composer`.

### FC-9: Notifications & Alerts
- **Purpose**: Surface and manage alerts (US-8.1, US-8.2).
- **Responsibilities**: List alerts; mark read/dismiss (persisted); drive header alert indicator.
- **Interface**: `NotificationsScreen`, `AlertItem`.

### FC-10: CaseContext / AppState
- **Purpose**: Central client-side state for the youth case, alerts, progress, and derived AI results.
- **Responsibilities**: Hold current case; expose update actions; coordinate persistence via LocalStorageRepo; trigger agent cycle on load (US-9.1).
- **Interface**: `CaseProvider`, `useCase()`, `useAlerts()` hooks.

### FC-11: ApiClient
- **Purpose**: Thin typed client for all backend endpoints (Q3, Q5).
- **Responsibilities**: Call `/api/*` endpoints; handle timeouts and errors; surface graceful-degradation states (US-10.2). Never contacts Bedrock directly (US-10.1).
- **Interface**: methods per endpoint (see component-methods.md).

### FC-12: LocalStorageRepo
- **Purpose**: Session persistence of in-memory case/alerts/progress (US-1.2, US-3.3, US-8.2).
- **Responsibilities**: Serialize/deserialize case to localStorage (round-trip safe, PBT-02); never write to disk seed JSON.
- **Interface**: `save(caseState)`, `load()`, `clear()`.

### FC-13: i18n Provider
- **Purpose**: Multilingual scaffolding (US-10.4, FR-8).
- **Responsibilities**: Route UI strings through i18n; ship English locale; allow adding locales without component refactor.
- **Interface**: `I18nProvider`, `t()` helper.

---

## Backend Components

### BC-1: API Routers
- **Purpose**: FastAPI routers exposing REST endpoints per capability (Q3, Q4).
- **Responsibilities**: Validate input (SECURITY-05), enforce restrictive CORS (SECURITY-08), delegate to services, fail closed with generic errors (SECURITY-15).
- **Interface**: routes for assessment, gap-analysis, roadmap, chat, agent-cycle, opportunities, health.

### BC-2: AssessmentService
- **Purpose**: Profile assessment and skills inventory (US-4.1, US-4.2).
- **Responsibilities**: Build prompt/context from case; call AIClient; parse structured result.
- **Interface**: `assess(case, goal)`, `skills_inventory(case)`.

### BC-3: GapAnalysisService
- **Purpose**: Skill-gap analysis + prioritisation (US-4.3).
- **Responsibilities**: Compare current vs goal-required skills; ensure satisfied skills are excluded (invariant, PBT-03); prioritise gaps.
- **Interface**: `analyze_gaps(case, goal)`, `prioritize(gaps)`.

### BC-4: RoadmapService
- **Purpose**: Learning roadmap + next-best actions (US-5.1, US-5.2).
- **Responsibilities**: Produce ordered plan mapping steps to gaps; derive next-best actions.
- **Interface**: `build_roadmap(gaps, case)`, `next_best_actions(case, roadmap)`.

### BC-5: OpportunityService
- **Purpose**: Relevant opportunities + MCP actions (US-6.1, US-6.2).
- **Responsibilities**: Select relevant opportunities (seed + tool output); invoke MCPToolInterface for search/enroll.
- **Interface**: `list_opportunities(case, goal)`, `act_on_opportunity(action, params)`.

### BC-6: ChatService
- **Purpose**: Conversational agent (US-7.1, US-7.2).
- **Responsibilities**: Assemble relevant (not full) case context; call AIClient; return grounded response.
- **Interface**: `chat(messages, case)`.

### BC-7: AgentCycleService
- **Purpose**: Proactive agent cycle (US-9.1, US-9.2, US-9.3).
- **Responsibilities**: Detect progress/opportunities/deadlines/inactivity (deterministic) + Bedrock reasoning; reassess gaps; produce alerts + next-best actions.
- **Interface**: `run_cycle(case, goal)`.

### BC-8: AIClient (interface + Bedrock impl)
- **Purpose**: Swappable AI abstraction (Q5, Q9; NFR-7).
- **Responsibilities**: `BedrockAIClient` calls Amazon Bedrock via boto3; model/region from env (FR-7.2); explicit timeouts (RESILIENCY-06); no secrets in logs (SECURITY-03). Credentials from env only (US-10.1, SECURITY-12).
- **Interface**: `AIClient` protocol: `generate(prompt, context)`.

### BC-9: MCPToolInterface (interface + mock impl)
- **Purpose**: Swappable MCP tools (Q7, Q9; FR-5.2).
- **Responsibilities**: Define clean tool contract; `MockMCPTools` implements search-opportunities/enroll; real wiring is future work.
- **Interface**: `MCPToolInterface`: `search_opportunities(query)`, `enroll(opportunity_id)`.

### BC-10: CaseRepository (JSON data-access)
- **Purpose**: Load seed youth-case JSON (FR-2.2).
- **Responsibilities**: Read seed JSON read-only; provide typed case objects; never write to disk.
- **Interface**: `get_case(profile_id)`, `list_profiles()`.

### BC-11: Config & Bootstrap
- **Purpose**: Env-based configuration + dependency injection wiring (Q9).
- **Responsibilities**: Read env (model, region, allowed origin); select concrete AIClient/MCP impls; expose health status.
- **Interface**: `Settings`, DI providers, `health()`.
