# Application Design — Component Methods

**Scope**: High-level method signatures and I/O types per component. Detailed business rules, validation specifics, and data-model fields are defined in Functional Design (CONSTRUCTION phase). Types below are indicative (TS for frontend, Python type hints for backend).

---

## Frontend Method Signatures (TypeScript, indicative)

### FC-11 ApiClient
```ts
getProfiles(): Promise<ProfileSummary[]>
getCase(profileId: string): Promise<YouthCase>
getAssessment(caseId: string): Promise<Assessment>
getGapAnalysis(caseId: string): Promise<PrioritizedGap[]>
getRoadmap(caseId: string): Promise<Roadmap>
getNextBestActions(caseId: string): Promise<NextBestAction[]>
listOpportunities(caseId: string): Promise<Opportunity[]>
actOnOpportunity(action: OpportunityAction): Promise<OpportunityResult>
chat(caseId: string, messages: ChatMessage[]): Promise<ChatMessage>
runAgentCycle(caseId: string): Promise<AgentCycleResult>
health(): Promise<HealthStatus>
```
- All methods apply a client timeout and map failures to a `DegradedResult` state (US-10.2). Never call Bedrock directly (US-10.1).

### FC-10 CaseContext / AppState (hooks)
```ts
useCase(): { case: YouthCase; setGoal(text: string): void; markTaskDone(taskId: string): void; ... }
useAlerts(): { alerts: Alert[]; markRead(id: string): void; dismiss(id: string): void }
useProgress(): { overall: number /* 0..100 */; milestones: Milestone[] }
runAgentCycleOnLoad(): void   // US-9.1
```

### FC-12 LocalStorageRepo
```ts
save(state: PersistedState): void     // PBT-02 round-trip safe
load(): PersistedState | null
clear(): void
```

### FC-13 i18n Provider
```ts
t(key: string, params?: Record<string, string>): string
setLocale(locale: string): void   // scaffolding; English shipped
```

---

## Backend Method Signatures (Python type hints, indicative)

### BC-1 API Routers (FastAPI)
```python
GET  /api/profiles            -> list[ProfileSummary]
GET  /api/case/{profile_id}   -> YouthCase
POST /api/assessment          (body: {case_id}) -> Assessment
POST /api/gap-analysis        (body: {case_id}) -> list[PrioritizedGap]
POST /api/roadmap             (body: {case_id}) -> Roadmap
POST /api/next-best-actions   (body: {case_id}) -> list[NextBestAction]
GET  /api/opportunities       (query: case_id)  -> list[Opportunity]
POST /api/opportunities/act   (body: OpportunityAction) -> OpportunityResult
POST /api/chat                (body: {case_id, messages}) -> ChatMessage
POST /api/agent-cycle         (body: {case_id}) -> AgentCycleResult
GET  /api/health              -> HealthStatus
```
- Each route: validate input (SECURITY-05), apply CORS (SECURITY-08), catch-all → generic error (SECURITY-15).

### BC-2 AssessmentService
```python
def assess(self, case: YouthCase, goal: Goal) -> Assessment: ...
def skills_inventory(self, case: YouthCase) -> SkillsInventory: ...
```

### BC-3 GapAnalysisService
```python
def analyze_gaps(self, case: YouthCase, goal: Goal) -> list[SkillGap]: ...
def prioritize(self, gaps: list[SkillGap]) -> list[PrioritizedGap]: ...
# Invariants (PBT-03): no already-satisfied skill in gaps; prioritize preserves the gap set; progress in [0,100]
```

### BC-4 RoadmapService
```python
def build_roadmap(self, gaps: list[PrioritizedGap], case: YouthCase) -> Roadmap: ...
def next_best_actions(self, case: YouthCase, roadmap: Roadmap) -> list[NextBestAction]: ...
```

### BC-5 OpportunityService
```python
def list_opportunities(self, case: YouthCase, goal: Goal) -> list[Opportunity]: ...
def act_on_opportunity(self, action: OpportunityAction) -> OpportunityResult: ...
```

### BC-6 ChatService
```python
def chat(self, messages: list[ChatMessage], case: YouthCase) -> ChatMessage: ...
# Builds relevant (not full) case context (US-7.2)
```

### BC-7 AgentCycleService
```python
def run_cycle(self, case: YouthCase, goal: Goal) -> AgentCycleResult: ...
# Detects: progress change, new opportunities, approaching deadlines, inactivity (US-9.3)
# Returns: updated alerts + reassessed gaps + refreshed next-best actions
```

### BC-8 AIClient (protocol + BedrockAIClient)
```python
class AIClient(Protocol):
    def generate(self, prompt: str, context: dict) -> AIResult: ...

class BedrockAIClient(AIClient):
    def __init__(self, model_id: str, region: str, timeout_s: float): ...
    def generate(self, prompt: str, context: dict) -> AIResult: ...
    # model_id/region from env (FR-7.2); explicit timeout (RESILIENCY-06);
    # credentials from env only (US-10.1, SECURITY-12); no secrets logged (SECURITY-03)
```

### BC-9 MCPToolInterface (protocol + MockMCPTools)
```python
class MCPToolInterface(Protocol):
    def search_opportunities(self, query: OpportunityQuery) -> list[Opportunity]: ...
    def enroll(self, opportunity_id: str) -> EnrollResult: ...

class MockMCPTools(MCPToolInterface): ...  # deterministic mock responses
```

### BC-10 CaseRepository
```python
def get_case(self, profile_id: str) -> YouthCase: ...   # read-only seed JSON
def list_profiles(self) -> list[ProfileSummary]: ...
# PBT-02: JSON (de)serialization round-trip
```

### BC-11 Config & Bootstrap
```python
class Settings:  # from env
    bedrock_model_id: str
    aws_region: str
    allowed_origin: str
    ai_timeout_s: float

def build_ai_client(settings: Settings) -> AIClient: ...   # DI selection (Q9)
def build_mcp_tools(settings: Settings) -> MCPToolInterface: ...
def health() -> HealthStatus: ...
```

---

## Notes
- Concrete field-level schemas for `YouthCase`, `Assessment`, `SkillGap`, `Roadmap`, `Opportunity`, `Alert`, etc. are defined in Functional Design.
- All AI-backed methods degrade gracefully when the AI backend/Bedrock is unavailable (US-10.2): timeouts, generic errors, and a usable UI.
