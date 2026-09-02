# Application Design — Component Dependencies

**Scope**: Dependency relationships, communication patterns, and data flow between YuvaMitra components.

---

## Dependency Matrix

| Component | Depends On | Communication |
|---|---|---|
| FC-1 App Shell & Nav | FC-10 CaseContext, React Router | in-process |
| FC-2 Mock Login | FC-11 ApiClient, FC-10 CaseContext | in-process |
| FC-3 Dashboard | FC-10 CaseContext, FC-11 ApiClient | in-process |
| FC-4 Profile & Case | FC-10 CaseContext, FC-12 LocalStorageRepo | in-process |
| FC-5 Skills & Gap | FC-11 ApiClient, FC-10 CaseContext | in-process |
| FC-6 Roadmap | FC-11 ApiClient, FC-10 CaseContext | in-process |
| FC-7 Opportunities | FC-11 ApiClient | in-process |
| FC-8 Chat | FC-11 ApiClient | in-process |
| FC-9 Notifications | FC-10 CaseContext, FC-12 LocalStorageRepo | in-process |
| FC-10 CaseContext | FC-11 ApiClient, FC-12 LocalStorageRepo | in-process |
| FC-11 ApiClient | Backend API Routers (BC-1) | HTTP/JSON |
| FC-12 LocalStorageRepo | Browser localStorage | Web Storage API |
| FC-13 i18n Provider | (none) | in-process |
| BC-1 API Routers | BC-2..BC-7 services, BC-11 Config | in-process |
| BC-2 AssessmentService | BC-8 AIClient, BC-10 CaseRepository | in-process |
| BC-3 GapAnalysisService | BC-8 AIClient | in-process |
| BC-4 RoadmapService | BC-8 AIClient, BC-3 GapAnalysis | in-process |
| BC-5 OpportunityService | BC-9 MCPToolInterface, BC-10 CaseRepository | in-process |
| BC-6 ChatService | BC-8 AIClient, BC-10 CaseRepository | in-process |
| BC-7 AgentCycleService | BC-3, BC-4, BC-5, BC-8 | in-process |
| BC-8 AIClient (Bedrock) | Amazon Bedrock | AWS SDK (boto3), HTTPS |
| BC-9 MCPToolInterface | (mock) / future MCP server | in-process (mock) |
| BC-10 CaseRepository | seed JSON files | filesystem read-only |
| BC-11 Config & Bootstrap | environment variables | process env |

---

## Communication Patterns
- **Frontend internal**: React component tree + Context/hooks (in-process, synchronous state).
- **Frontend ↔ Backend**: HTTP/JSON REST over the ApiClient only (Q3, Q5). This is the single trust boundary; credentials never cross to the client (US-10.1).
- **Backend internal**: constructor-injected services calling protocol interfaces (AIClient, MCPToolInterface) — not concrete classes (Q9).
- **Backend ↔ Bedrock**: boto3 over HTTPS, credentials + model + region from env; explicit timeouts.
- **Persistence**: seed JSON is read-only on disk (backend); session mutations live only in browser localStorage (frontend).

---

## Data Flow (primary journeys)

### Flow A — Load & first render (US-1.1, US-1.2, US-9.1)
```
User selects profile
    |
    v
FC-2 --> FC-11 ApiClient.getCase --> BC-1 --> BC-10 CaseRepository (seed JSON)
    |                                              |
    |<---------------- YouthCase -------------------
    v
FC-10 CaseContext (merge with FC-12 localStorage session state)
    |
    | on load
    v
FC-11.runAgentCycle --> BC-1 --> BC-7 AgentCycleService --> {alerts, actions, gaps}
    |
    v
FC-3 Dashboard renders goal, progress, alerts, matches
```

### Flow B — Skills & gap analysis (US-4.x)
```
FC-5 --> FC-11 ApiClient.getAssessment / getGapAnalysis
    --> BC-1 --> BC-2 AssessmentService / BC-3 GapAnalysisService
        --> BC-8 AIClient.generate (Bedrock) [+ BC-10 case context]
    --> PrioritizedGap[] / Assessment --> FC-5 render
```

### Flow C — Opportunity action via MCP (US-6.2)
```
FC-7 --> FC-11 ApiClient.actOnOpportunity
    --> BC-1 --> BC-5 OpportunityService.act_on_opportunity
        --> BC-9 MCPToolInterface (MockMCPTools)
    --> OpportunityResult --> FC-7 render
```

### Flow D — Degradation path (US-10.2)
```
Any AI-backed call --> BC-8 AIClient timeout / error
    --> Service returns DegradedResult
    --> BC-1 returns generic response (no internal details)
    --> FC-11 surfaces degraded state; rest of UI stays usable
```

---

## Trust & Data Boundaries
- **Client (untrusted for secrets)**: browser holds only case/session data in localStorage; no AWS credentials, no secrets.
- **Server (trusted)**: FastAPI backend holds AWS credentials (env), performs Bedrock calls, reads seed JSON.
- **External**: Amazon Bedrock (real), MCP tools (mock now, real later).

---

## Coupling Notes
- Services depend on **interfaces** (AIClient, MCPToolInterface), keeping AI/MCP swappable (NFR-7, Q9).
- AgentCycleService composes other services rather than reimplementing them — preserves independence and testability.
- Frontend features depend on CaseContext + ApiClient, not on each other — supports feature-based organization (Q1).
