# Functional Design Plan — Unit U1 (Frontend)

**Unit**: U1 — Frontend SPA (React 18 + TS + Vite + Tailwind).
**Stories (UI side)**: US-1.1/1.2, US-2.1/2.2, US-3.1/3.2/3.3, US-4.1/4.2/4.3, US-5.1/5.2, US-6.1/6.2, US-7.1/7.2, US-8.1/8.2, US-9.1/9.2, US-10.2/10.3/10.4.
**Purpose**: Design the frontend component hierarchy, props/state, interaction flows, form validation, and API-integration points — against the finished U2 OpenAPI contract and the "SkillMatch AI" mockup (visual inspiration; YuvaMitra terms in code per Q8=A).

---

## Inputs
- **U2 API** (base): `/api/profiles`, `/api/case/{id}`, `/api/assessment`, `/api/gap-analysis`, `/api/roadmap`, `/api/opportunities`, `/api/opportunities/act`, `/api/chat`, `/api/agent-cycle`, `/api/health`. AI endpoints return a `degraded` flag.
- **App design** (U1 components FC-1..FC-13): feature-based screens, CaseContext + hooks, ApiClient, LocalStorageRepo, i18n.
- **UI mockup**: dashboard with left nav, greeting header, profile-strength ring, stat tiles, match cards with score rings, recommended skills, application/opportunity tracker, alerts, top companies.

---

## Planning Questions (please answer all `[Answer]:` tags)

### Question 1 — Routing & navigation
How should screens be routed?

A) React Router with a persistent left-nav layout (Dashboard, Profile, Skills & Gap, Roadmap, Opportunities, Chat, Notifications, Settings) mirroring the mockup (recommended)

B) Tabbed single-page (no router)

C) Other (please describe after [Answer]: tag below)

[Answer]:

### Question 2 — Data fetching strategy
How should the frontend call U2 and manage async state?

A) A typed ApiClient (fetch wrapper) + custom hooks, results held in CaseContext; simple loading/error/degraded flags (recommended, no extra deps)

B) TanStack Query (react-query) for caching/retries

C) Other (please describe after [Answer]: tag below)

[Answer]:

### Question 3 — When to call AI endpoints
AI calls cost latency/tokens. When should the app trigger them?

A) On-demand per screen (open Skills -> gap-analysis; open Roadmap -> roadmap; agent-cycle on load + button) with results cached in context for the session (recommended)

B) Eagerly prefetch everything on login

C) Other (please describe after [Answer]: tag below)

[Answer]:

### Question 4 — Applied/Saved job state (confirmed backend-stateless, Q6 earlier)
Where and how is apply/save tracked in the UI?

A) localStorage via LocalStorageRepo (applied/saved sets per profile), reflected in an Application Tracker view like the mockup (recommended)

B) Ephemeral React state only (lost on reload)

C) Other (please describe after [Answer]: tag below)

[Answer]:

### Question 5 — Degraded/offline UX (US-10.2)
How should the UI behave when the backend/AI returns degraded or is unreachable?

A) Show a non-blocking banner ("AI temporarily unavailable"); render deterministic data (opportunities, case) normally; disable only the AI-dependent action (recommended)

B) Full-screen error

C) Other (please describe after [Answer]: tag below)

[Answer]:

### Question 6 — Styling/component approach
How should UI be built with Tailwind?

A) Small set of reusable presentational components (Card, StatTile, ProgressRing, Badge, Button) + feature components; Tailwind utility classes; data-testid on interactives (recommended)

B) A component library (e.g., shadcn/ui, MUI)

C) Other (please describe after [Answer]: tag below)

[Answer]:

### Question 7 — Mock login (US-1.1)
How should demo profile selection work?

A) Landing screen lists profiles from `/api/profiles`; selecting one loads the case and sets it in context + localStorage (recommended)

B) A dropdown in the header, no dedicated screen

C) Other (please describe after [Answer]: tag below)

[Answer]:

---

## Execution Checklist (after approval)

### Planning
- [x] Analyze U1 unit + stories + U2 API + mockup
- [x] Create this functional design plan with checkboxes
- [x] Generate context-appropriate questions
- [x] Collect answers to all `[Answer]:` tags (all defaults = A)
- [x] Analyze answers for ambiguity; raise follow-ups if needed (none)
- [x] Obtain explicit approval of this plan

### Generation (artifacts under construction/u1-frontend/functional-design/)
- [x] `frontend-components.md` — component hierarchy, props/state per component, interaction flows, form validation rules, API integration points (endpoint per component)
- [x] `business-logic-model.md` — client-side logic: context/state model, localStorage persistence + apply/save sets, agent-cycle-on-load orchestration, progress/alert display derivation, degraded handling
- [x] `business-rules.md` — client validation (goal length, message bounds), localStorage round-trip (PBT-02 on client), no-secrets rule (US-10.1), accessibility + i18n rules
- [x] Update `aidlc-state.md` and present completion for approval
