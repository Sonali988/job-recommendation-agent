# Application Design — Services & Orchestration

**Scope**: Backend service layer definitions and how they orchestrate AI, MCP, and data-access to fulfill the user stories. Layering per Q4: routers → services → clients → data-access.

---

## Service Inventory

| Service | Responsibility | Depends on | Serves stories |
|---|---|---|---|
| AssessmentService (BC-2) | Profile assessment + skills inventory | AIClient, CaseRepository | US-4.1, US-4.2 |
| GapAnalysisService (BC-3) | Skill-gap analysis + prioritisation | AIClient (reasoning), deterministic compare | US-4.3 |
| RoadmapService (BC-4) | Ordered plan + next-best actions | AIClient, GapAnalysisService | US-5.1, US-5.2 |
| OpportunityService (BC-5) | Relevant opportunities + MCP actions | MCPToolInterface, CaseRepository | US-6.1, US-6.2 |
| ChatService (BC-6) | Grounded conversational responses | AIClient, CaseRepository | US-7.1, US-7.2 |
| AgentCycleService (BC-7) | Proactive detection + reassessment + alerts | GapAnalysis, Roadmap, Opportunity, AIClient | US-9.1, US-9.2, US-9.3 |

Cross-cutting: input validation, CORS, fail-closed error handling, structured logging (no secrets/PII), and explicit AI timeouts apply across all services (NFR-3, NFR-4).

---

## Orchestration Patterns

### Pattern 1: Single-capability request (assessment / gap / roadmap / chat / opportunities)
```
Frontend --> Router --> Service --> (AIClient | MCPToolInterface) --> Service --> Router --> Frontend
                          |
                          +--> CaseRepository (load read-only case context)
```
- Router validates input and injects the case (via CaseRepository) into the service.
- Service builds a focused prompt/context (not the whole dataset) and calls AIClient or MCP as needed.
- On AI failure/timeout, the service returns a degraded result; the router maps it to a generic response (US-10.2, SECURITY-15).

### Pattern 2: Agent cycle (composite orchestration) — US-9.x
```
Frontend (on load / on demand)
    |
    v
Router /api/agent-cycle
    |
    v
AgentCycleService.run_cycle(case, goal)
    |-- deterministic detection: progress delta, deadlines, inactivity, new opportunities
    |-- GapAnalysisService.analyze_gaps + prioritize   (reassess)
    |-- RoadmapService.next_best_actions               (refresh actions)
    |-- OpportunityService.list_opportunities          (surface relevant)
    |-- AIClient.generate                              (reasoning / phrasing of alerts)
    v
AgentCycleResult { alerts[], nextBestActions[], reassessedGaps[], progress }
    |
    v
Frontend persists to localStorage + surfaces alerts/actions
```
- The cycle composes other services rather than duplicating their logic (keeps them independent/testable).
- Detection is deterministic (unit + property testable); Bedrock is used for reasoning/wording.

### Pattern 3: Opportunity action via MCP — US-6.2
```
Frontend --> Router /api/opportunities/act --> OpportunityService.act_on_opportunity
    --> MCPToolInterface (MockMCPTools) --> OpportunityResult --> Frontend
```
- MCP is behind an interface (Q7, Q9) so real MY Bharat tools can replace mocks without touching services' callers or the UI.

---

## Dependency Injection & Configuration (Q9, NFR-7)
- `Config & Bootstrap` (BC-11) reads env (model id, region, allowed origin, timeouts) and constructs concrete `AIClient` and `MCPToolInterface` implementations.
- Services receive their dependencies via constructor injection, referencing the `AIClient` / `MCPToolInterface` protocols — never concrete Bedrock/MCP classes directly.
- This makes it a config change (not a code change) to swap Bedrock models or wire real MCP later.

## Resiliency behaviors in the service layer (NFR-4)
- Explicit timeouts on all AIClient/MCP calls (RESILIENCY-06).
- Graceful degradation: services catch AI/MCP failures and return safe, generic degraded results (RESILIENCY-10, US-10.2).
- Health endpoint (BC-11) reports service status.

## Security behaviors in the service/router layer (NFR-3)
- Server-side-only credentials for Bedrock (US-10.1, SECURITY-12/09).
- Input validation on all endpoints (SECURITY-05).
- Restrictive CORS to the local frontend origin (SECURITY-08).
- Fail-closed global error handling with generic messages (SECURITY-15).
- Structured logging without secrets/PII (SECURITY-03).
