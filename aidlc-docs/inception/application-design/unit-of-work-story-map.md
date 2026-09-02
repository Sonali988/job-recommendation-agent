# Units of Work — Story Map

Maps every user story (E1–E10) to the owning unit(s). Stories with both a UI and a backend aspect are **split**: the UI part → U1, the AI/logic/data part → U2.

**Units**: U1 (Frontend SPA), U2 (Backend: FastAPI incl. MCP mock + seed data + case model).

---

## Story-to-Unit Assignments

| Story | Title | U1 Frontend | U2 Backend | Notes |
|---|---|:---:|:---:|---|
| US-1.1 | Select demo profile (mock login) | ✔ | ✔ | UI selector (U1); `list_profiles` + case load (U2) |
| US-1.2 | Resume my session | ✔ |  | localStorage restore (U1) |
| US-2.1 | See goal + overall progress | ✔ | ✔ | Dashboard UI (U1); assessment/progress data (U2) |
| US-2.2 | Milestones + recent activity | ✔ |  | Rendered from case/journey (U1) |
| US-3.1 | Define/edit goal (NL) | ✔ | ✔ | Editor UI (U1); goal stored in case, used by AI (U2) |
| US-3.2 | View profile & case | ✔ |  | Case rendering (U1); data served by U2 |
| US-3.3 | Update case in session | ✔ |  | localStorage persistence (U1) |
| US-4.1 | AI profile assessment | ✔ | ✔ | Screen (U1); AssessmentService + Bedrock (U2) |
| US-4.2 | Skills inventory | ✔ | ✔ | Screen (U1); AssessmentService (U2) |
| US-4.3 | Prioritized skill gaps | ✔ | ✔ | Screen (U1); GapAnalysisService (U2) |
| US-5.1 | Personalized roadmap | ✔ | ✔ | Screen (U1); RoadmapService (U2) |
| US-5.2 | Next-best actions | ✔ | ✔ | Screen + mark-done (U1); RoadmapService (U2) |
| US-6.1 | Discover opportunities | ✔ | ✔ | Screen (U1); OpportunityService (U2) |
| US-6.2 | Act on opportunity (MCP mock) | ✔ | ✔ | UI action (U1); OpportunityService + MCP mock (U2) |
| US-7.1 | Chat with agent | ✔ | ✔ | Chat UI (U1); ChatService + Bedrock (U2) |
| US-7.2 | Chat grounded in case | ✔ | ✔ | Rendering (U1); relevant-context assembly (U2) |
| US-8.1 | See personalized alerts | ✔ |  | Alerts UI + indicator (U1); alerts produced by U2 cycle |
| US-8.2 | Manage alerts | ✔ |  | Read/dismiss + persist (U1) |
| US-9.1 | Agent cycle on load | ✔ | ✔ | Trigger on load (U1); AgentCycleService (U2) |
| US-9.2 | Run agent cycle on demand | ✔ | ✔ | Action (U1); AgentCycleService (U2) |
| US-9.3 | Cycle detects changes | |  ✔ | Detection + reassessment logic (U2) |
| US-10.1 | Bedrock creds in backend | ✔ | ✔ | U1 never calls Bedrock; U2 holds creds (env) |
| US-10.2 | Graceful degradation | ✔ | ✔ | Degraded UX (U1); timeouts/fail-closed + health (U2) |
| US-10.3 | Accessible, responsive UI | ✔ |  | U1 only |
| US-10.4 | i18n-ready interface | ✔ |  | U1 only |

---

## Coverage Summary
- **All 24 stories (E1–E10) are assigned.** No story is unmapped.
- **U1 owns or co-owns**: 23 stories (all except US-9.3 which is backend-only).
- **U2 owns or co-owns**: 15 stories (all AI/logic/data/security/resiliency-backend stories).
- **Backend-only**: US-9.3.
- **Frontend-only**: US-1.2, US-2.2, US-3.2, US-3.3, US-8.1, US-8.2, US-10.3, US-10.4.

## Epic → Unit rollup
| Epic | Primary Unit(s) |
|---|---|
| E1 Access & Session | U1 (+U2 for profile/case load) |
| E2 Dashboard & Progress | U1 (+U2 data) |
| E3 Profile & Case | U1 (+U2 data) |
| E4 Skills & Gap Analysis | U1 + U2 |
| E5 Learning Roadmap | U1 + U2 |
| E6 Opportunities & MCP | U1 + U2 |
| E7 Chat with Agent | U1 + U2 |
| E8 Notifications & Alerts | U1 (alerts sourced from U2 cycle) |
| E9 Proactive Agent Cycle | U2 (triggered by U1) |
| E10 Non-Functional Enablers | U1 + U2 |

## Implication for CONSTRUCTION order
Because most stories are co-owned and U1 depends on U2's contract, **U2 is built first**, then U1 wires its screens to the finished endpoints — consistent with the approved sequencing (follow-up A).
