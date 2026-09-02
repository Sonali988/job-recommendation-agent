# Requirements — MY Bharat Personal Youth Agent (YuvaMitra)

## Intent Analysis Summary

- **User Request**: Build a persistent, case-managed Agentic AI platform ("MY Bharat Personal Youth Agent" / YuvaMitra) that helps every youth achieve a career objective through continuous assessment, personalised recommendations, proactive opportunities, and MCP-enabled orchestration of MY Bharat services.
- **Request Type**: New Project (greenfield)
- **Scope Estimate**: Multiple Components (React frontend + thin backend proxy + JSON data layer + AI/agent layer)
- **Complexity Estimate**: Moderate-to-Complex (agentic cycle, AI assessment, multilingual scaffolding, MCP abstraction)

## Confirmed Architecture Decision (from clarifications)

A pure static browser app cannot safely call Amazon Bedrock (it would require embedding AWS credentials in client code, which the enabled Security baseline forbids). The confirmed architecture is therefore:

```
+------------------------+        HTTP (JSON)        +-----------------------------+
|  React 18 + TS + Vite  | <-----------------------> |  Thin Backend (Node+Express)|
|  Tailwind CSS (SPA)     |                           |  - loads youth JSON         |
|  - screens + chat       |                           |  - holds AWS creds (env)    |
|  - localStorage state   |                           |  - calls Amazon Bedrock     |
+------------------------+                            |  - MCP tool interface (mock)|
                                                      +--------------+--------------+
                                                                     |
                                                                     v
                                                            +-----------------+
                                                            | Amazon Bedrock  |
                                                            | (model via env) |
                                                            +-----------------+
```

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS (single-page app).
- Backend: thin Node + Express proxy that holds AWS credentials via environment variables, loads the youth JSON, calls Amazon Bedrock, and exposes HTTP endpoints.
- Data: static seed JSON is the source of truth (read-only on disk); in-session changes persist to browser localStorage (no server-side writes).
- AI: real Amazon Bedrock (model family and region configurable via env vars, with sensible defaults).
- MCP: clean tool interface with mocked "MY Bharat" tools; real wiring is future work.
- Multilingual: English-only content now, with i18n scaffolding for later languages.

## Functional Requirements

### FR-1: Youth-Friendly Experience
- FR-1.1: The youth can define/edit a career goal in natural language.
- FR-1.2: The youth can view overall progress toward the goal (progress indicators, milestones).
- FR-1.3: The youth can interact with the AI agent through a chat interface.
- FR-1.4: The youth receives personalised alerts/notifications surfaced in the UI.
- FR-1.5: A simple mock login lets the user pick a demo youth profile (no real credentials).

### FR-2: Persistent Youth Case & Memory
- FR-2.1: The system maintains a youth case containing: profile, education, skills, interests, credentials, preferences, goals, activities, milestones, tasks, and journey history.
- FR-2.2: Seed case data is loaded from static JSON files.
- FR-2.3: In-session changes (completed tasks, generated alerts, progress updates) persist to browser localStorage and survive reloads; the on-disk seed JSON is not modified.
- FR-2.4: Journey history records key events over time (goal set, gap analysis run, actions taken, milestones reached).

### FR-3: AI-Powered Career Assessment
- FR-3.1: Profile assessment — the AI analyses the youth JSON to summarise the current profile and readiness for the stated goal.
- FR-3.2: Skills inventory — the AI derives/organises the youth's current skills.
- FR-3.3: Skill-gap analysis — the AI compares current skills against goal-required skills and identifies gaps.
- FR-3.4: Prioritisation — gaps and actions are prioritised (e.g., by impact/urgency).
- FR-3.5: Personalised learning roadmap/plan — the AI produces an ordered plan to close gaps.
- FR-3.6: Next-best-action recommendations — the AI recommends concrete next actions.

### FR-4: Continuous Proactive Agent Cycle
- FR-4.1: An agent cycle can be triggered on app load and on-demand via a "Run agent cycle" action.
- FR-4.2: The cycle detects: progress changes, new opportunities, approaching deadlines, and inactivity.
- FR-4.3: The cycle updates the case/memory (localStorage), reassesses gaps, recommends actions, and generates notifications.
- FR-4.4: The cycle's outputs (alerts, next-best-actions) are surfaced to the youth in the UI.

### FR-5: Opportunities & MCP Orchestration
- FR-5.1: The system presents relevant opportunities (from seed JSON and/or AI/tool output).
- FR-5.2: A clean MCP tool interface is defined with mocked "MY Bharat" tools (e.g., search opportunities, enroll). Real MCP wiring is future work.

### FR-6: Core Screens (must-have set)
- FR-6.1: Dashboard (goal + progress overview).
- FR-6.2: Profile.
- FR-6.3: Skills & Gap Analysis.
- FR-6.4: Learning Roadmap / Plan.
- FR-6.5: Opportunities.
- FR-6.6: Chat with Agent.
- FR-6.7: Notifications / Alerts.

### FR-7: AI Integration (Backend)
- FR-7.1: The backend exposes HTTP endpoints the frontend calls for assessment, gap analysis, roadmap, chat, and agent-cycle operations.
- FR-7.2: The backend calls Amazon Bedrock; model family and AWS region are configurable via environment variables with sensible defaults.
- FR-7.3: The backend loads youth JSON and includes relevant case data as context in Bedrock requests.

### FR-8: Multilingual Scaffolding
- FR-8.1: UI text runs through an i18n framework with English as the only shipped locale for this iteration.
- FR-8.2: The structure supports adding additional Indian languages later without refactoring UI components.

## Non-Functional Requirements

### NFR-1: Technology Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS.
- Backend: Node.js + Express (thin proxy).
- AI: Amazon Bedrock via AWS SDK (server-side).
- Data: JSON files (seed) + browser localStorage (session state).

### NFR-2: Runtime & Deployment
- Local development: `npm run dev` for frontend; a documented command to run the backend.
- Production build available via `npm run build` (static host capable); no cloud hosting setup required this iteration.
- Rollback strategy: revert Git commit (RESILIENCY-04).

### NFR-3: Security (Security Baseline extension — ENABLED, blocking)
- No AWS credentials or secrets in frontend or committed source; credentials supplied to the backend via environment variables (SECURITY-12, SECURITY-09).
- Backend input validation on all API parameters (SECURITY-05).
- Structured application logging without secrets/PII (SECURITY-03).
- Restrictive CORS on the backend limited to the local frontend origin (SECURITY-08).
- Global error handling that fails closed and returns generic errors (SECURITY-15).
- HTTP security headers on any HTML/API responses as applicable (SECURITY-04).
- Dependency pinning via lock file and trusted registries (SECURITY-10).
- Applicability of individual SECURITY rules is assessed per stage; cloud-infra-only rules (e.g., load balancer/CDN logging, multi-AZ network ACLs) are expected to be N/A for a local demo and will be documented as such.

### NFR-4: Resiliency (Resiliency Baseline extension — ENABLED, directional)
- RTO/RPO: N/A for this local demo; seed JSON lives in source control, process is restartable (RESILIENCY-02, user choice A).
- Change management: Git-only for this workshop project (RESILIENCY-03, user choice A).
- CI/CD & deployment: none this iteration; local dev/build only; rollback via Git revert (RESILIENCY-04, user choice A).
- Incident response: informal/ad hoc for this workshop project (RESILIENCY-15, user choice A).
- Application-level resiliency still applies where relevant: explicit timeouts on Bedrock/MCP calls, graceful degradation when the AI backend is unavailable, health check endpoint on the backend (RESILIENCY-06, RESILIENCY-10).
- Cloud HA/DR rules (multi-AZ, multi-region, backups, failover runbooks) are expected N/A for a local single-process demo and will be documented as such per stage.

### NFR-5: Testing (Property-Based Testing extension — ENABLED, Partial mode)
- Partial PBT enforcement applies rules PBT-02, PBT-03, PBT-07, PBT-08, PBT-09 as blocking; others advisory.
- Round-trip properties (PBT-02): JSON case (de)serialization and localStorage save/load round-trips.
- Invariant properties (PBT-03): e.g., gap analysis never returns skills already satisfied; prioritisation preserves the set of items; progress within [0,100].
- Generator quality (PBT-07), shrinking/reproducibility (PBT-08), framework selection (PBT-09): use fast-check with the chosen JS/TS test runner.

### NFR-6: Usability & Accessibility
- Responsive, clean UI using Tailwind.
- Accessible components (semantic markup, keyboard navigation, adequate contrast) as a baseline.

### NFR-7: Maintainability
- Clear separation: UI components, an AI-service client (frontend), backend AI/agent services, MCP tool interface, and data-access utilities.
- The AI-service and MCP-tool boundaries are interfaces so real Bedrock/MCP implementations can evolve without UI changes.

## Out of Scope (this iteration)
- Real authentication with external identity providers.
- Real MCP server wiring to live MY Bharat services (interface + mocks only).
- Cloud hosting/infrastructure provisioning (S3/CloudFront/Amplify/Lambda) and multi-region DR.
- AgentCore Memory as a managed service — persistence is via localStorage; a memory abstraction is designed so AgentCore can be added later.
- Languages beyond English (scaffolding only).

## Key Requirements Summary
YuvaMitra is a React 18 + TypeScript + Vite + Tailwind single-page app backed by a thin Node/Express proxy that securely calls Amazon Bedrock (model/region configurable). It loads youth data from seed JSON, persists session changes to localStorage, and delivers seven core screens plus an AI chat. The AI layer performs profile assessment, skills inventory, skill-gap analysis, prioritisation, a learning roadmap, and next-best-action recommendations, driven by a proactive agent cycle (on-load and on-demand). MCP orchestration and multilingual support are scaffolded with mocks/i18n for future expansion. Security is enforced as a blocking baseline; resiliency is applied as directional guidance with demo-appropriate N/A decisions; property-based testing runs in Partial mode with fast-check.
