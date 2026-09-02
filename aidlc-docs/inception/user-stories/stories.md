# User Stories — YuvaMitra

**Breakdown**: Feature-Based (Q1=A), organized into epics by screen/capability.
**Persona**: Youth / Aarav (Q2=A) — all stories are from the youth's perspective, including AI/agent behaviors (Q5=A).
**Acceptance criteria**: Given/When/Then (Q3=A).
**Granularity**: Medium — a few focused stories per feature (Q4=B).
**NFR coverage**: Dedicated enabler stories included (Q6=A), including server-side Bedrock credentials.
**Priority/sizing**: Not included this iteration (Q7=C).

All stories follow INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable). Traceability to requirements (FR/NFR) is noted per story.

---

## Epic E1 — Access & Session
*Traces to: FR-1.5*

### US-1.1 — Select a demo youth profile (mock login)
**As** a youth, **I want** to pick a demo profile to sign in with, **so that** I can start using the platform without real credentials.

**Acceptance Criteria**
- **Given** the app is loaded and no profile is selected, **When** I open the app, **Then** I see a mock login screen listing selectable demo youth profiles.
- **Given** the mock login screen, **When** I select a profile, **Then** the app loads that youth's case and routes me to the Dashboard.
- **Given** no real credentials are involved, **When** I sign in, **Then** no password or external identity provider is required.

### US-1.2 — Resume my session
**As** a youth, **I want** the app to remember my selected profile and progress, **so that** I continue where I left off after a reload.
*Traces to: FR-2.3*

**Acceptance Criteria**
- **Given** I previously used the app and made changes, **When** I reload the browser, **Then** my selected profile and in-session changes are restored from localStorage.
- **Given** a restored session, **When** the app loads, **Then** the seed JSON on disk is not modified.

---

## Epic E2 — Dashboard & Progress
*Traces to: FR-1.2, FR-6.1*

### US-2.1 — See my goal and overall progress
**As** a youth, **I want** a dashboard showing my career goal and overall progress, **so that** I understand my status at a glance.

**Acceptance Criteria**
- **Given** a signed-in youth with a defined goal, **When** I open the Dashboard, **Then** I see my current career goal and an overall progress indicator.
- **Given** progress data exists, **When** the Dashboard renders, **Then** the progress value is displayed within a valid range (0–100%).
- **Given** no goal is set yet, **When** I open the Dashboard, **Then** I am prompted to define a career goal.

### US-2.2 — See milestones and recent activity
**As** a youth, **I want** the Dashboard to summarize milestones and recent activity, **so that** I can see momentum and what happened recently.
*Traces to: FR-2.4, FR-1.4*

**Acceptance Criteria**
- **Given** milestones exist in my case, **When** I view the Dashboard, **Then** I see achieved and upcoming milestones.
- **Given** recent journey events exist, **When** I view the Dashboard, **Then** I see a short recent-activity summary.
- **Given** active alerts exist, **When** I view the Dashboard, **Then** the most relevant alerts are surfaced.

---

## Epic E3 — Profile & Case
*Traces to: FR-1.1, FR-2.1, FR-2.2, FR-6.2*

### US-3.1 — Define or edit my career goal in natural language
**As** a youth, **I want** to state my career goal in plain language, **so that** the platform can tailor everything to it.

**Acceptance Criteria**
- **Given** the Profile (or Dashboard) screen, **When** I enter a goal in natural language and save, **Then** the goal is stored in my case and reflected across the app.
- **Given** an existing goal, **When** I edit and save it, **Then** the updated goal replaces the previous one and a journey event is recorded.

### US-3.2 — View my profile and case data
**As** a youth, **I want** to view my profile, education, skills, interests, credentials, and preferences, **so that** I can confirm the platform has an accurate picture of me.

**Acceptance Criteria**
- **Given** a loaded youth case, **When** I open the Profile screen, **Then** I see profile, education, skills, interests, credentials, and preferences from the seed data.
- **Given** the case contains structured fields, **When** rendering, **Then** each section is clearly labeled and legible.

### US-3.3 — Update case data during my session
**As** a youth, **I want** in-session edits (like completing tasks or preferences) to persist, **so that** my progress is not lost on reload.
*Traces to: FR-2.3*

**Acceptance Criteria**
- **Given** I change a case value (e.g., mark a task complete), **When** the change is applied, **Then** it is saved to localStorage.
- **Given** a saved change, **When** I reload, **Then** the change persists and the on-disk seed JSON remains unchanged.

---

## Epic E4 — Skills & Gap Analysis
*Traces to: FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-6.3, FR-7.1, FR-7.3*

### US-4.1 — See an AI assessment of my profile
**As** a youth, **I want** an AI summary of my current profile and readiness for my goal, **so that** I understand where I stand.

**Acceptance Criteria**
- **Given** a youth with a goal and case data, **When** I open Skills & Gap Analysis, **Then** the app requests an assessment from the backend and shows a readable summary of my current profile and readiness.
- **Given** the assessment is generated, **When** it completes, **Then** it reflects data from my case (skills, education, goal).

### US-4.2 — See my skills inventory
**As** a youth, **I want** my current skills organized into an inventory, **so that** I can see what I already have.

**Acceptance Criteria**
- **Given** case data with skills, **When** the Skills view loads, **Then** my current skills are listed/organized.
- **Given** skills are derived by the AI, **When** displayed, **Then** they are grouped in a clear, scannable way.

### US-4.3 — See my prioritized skill gaps
**As** a youth, **I want** the AI to identify and prioritize my skill gaps, **so that** I know which gaps matter most for my goal.

**Acceptance Criteria**
- **Given** my current skills and my goal's required skills, **When** gap analysis runs, **Then** I see the skills I am missing.
- **Given** a computed gap list, **When** displayed, **Then** gaps are prioritized (e.g., by impact/urgency).
- **Given** a skill I already have, **When** gap analysis runs, **Then** that skill does not appear as a gap.

---

## Epic E5 — Learning Roadmap
*Traces to: FR-3.5, FR-3.6, FR-6.4, FR-7.1*

### US-5.1 — Get a personalized learning roadmap
**As** a youth, **I want** an ordered learning plan that closes my gaps, **so that** I have a concrete path to my goal.

**Acceptance Criteria**
- **Given** identified skill gaps, **When** I open the Roadmap screen, **Then** the app produces an ordered plan of steps to close those gaps.
- **Given** a generated roadmap, **When** displayed, **Then** each step maps to one or more identified gaps.

### US-5.2 — See and act on my next-best actions
**As** a youth, **I want** clear next-best-action recommendations, **so that** I always know my single most useful next step.

**Acceptance Criteria**
- **Given** an assessment and roadmap, **When** I view recommendations, **Then** I see concrete next actions.
- **Given** a recommended action, **When** I mark it done, **Then** my progress updates and the change persists (localStorage) with a journey event recorded.

---

## Epic E6 — Opportunities & MCP
*Traces to: FR-5.1, FR-5.2, FR-6.5*

### US-6.1 — Discover relevant opportunities
**As** a youth, **I want** to see opportunities relevant to my goal and gaps, **so that** I can take advantage of programs, courses, or openings.

**Acceptance Criteria**
- **Given** my goal and gaps, **When** I open the Opportunities screen, **Then** I see relevant opportunities from seed data and/or AI/tool output.
- **Given** an opportunity is shown, **When** I view it, **Then** I can see its key details (title, relevance, action).

### US-6.2 — Act on an opportunity via a MY Bharat tool (mocked)
**As** a youth, **I want** to trigger an action on an opportunity (e.g., search/enroll), **so that** I can progress without leaving the app.

**Acceptance Criteria**
- **Given** the Opportunities screen, **When** I invoke an action (e.g., "enroll"), **Then** a mocked MCP tool responds and the result is reflected in the UI.
- **Given** the MCP tool interface, **When** it is called, **Then** it uses a clean, well-defined interface so real MY Bharat tools can replace mocks later without UI changes.

---

## Epic E7 — Chat with Agent
*Traces to: FR-1.3, FR-6.6, FR-7.1, FR-7.2, FR-7.3*

### US-7.1 — Ask the agent questions in natural language
**As** a youth, **I want** to chat with the AI agent, **so that** I can ask about my goal, gaps, plan, or opportunities conversationally.

**Acceptance Criteria**
- **Given** the Chat screen, **When** I send a message, **Then** the backend calls Amazon Bedrock with relevant case context and returns a response shown in the conversation.
- **Given** an ongoing conversation, **When** I send follow-up messages, **Then** the exchange is displayed in order.

### US-7.2 — Chat answers are grounded in my case
**As** a youth, **I want** the agent's answers to reflect my actual profile and goal, **so that** the guidance is personalized.

**Acceptance Criteria**
- **Given** a question about my situation, **When** the agent responds, **Then** the response reflects data from my case (goal, skills, gaps).
- **Given** case context is included, **When** the request is built, **Then** only relevant case data is sent (not the entire dataset indiscriminately).

---

## Epic E8 — Notifications & Alerts
*Traces to: FR-1.4, FR-6.7, FR-4.4*

### US-8.1 — See personalized alerts
**As** a youth, **I want** personalized alerts surfaced in the UI, **so that** I don't miss important nudges.

**Acceptance Criteria**
- **Given** alerts have been generated (e.g., by the agent cycle), **When** I open the Notifications screen, **Then** I see the list of current alerts.
- **Given** alerts exist, **When** I am on any screen, **Then** an alert indicator reflects unread/active alerts.

### US-8.2 — Manage my alerts
**As** a youth, **I want** to dismiss or mark alerts as read, **so that** I can keep my notifications relevant.

**Acceptance Criteria**
- **Given** an alert, **When** I dismiss or mark it read, **Then** its state updates and persists to localStorage.
- **Given** a dismissed alert, **When** I reload, **Then** it does not reappear as unread.

---

## Epic E9 — Proactive Agent Cycle
*Traces to: FR-4.1, FR-4.2, FR-4.3, FR-4.4*

### US-9.1 — The agent runs a proactive cycle on load
**As** a youth, **I want** the agent to evaluate my situation when I open the app, **so that** I immediately see fresh nudges without doing anything.

**Acceptance Criteria**
- **Given** I open/reload the app with a loaded case, **When** the app initializes, **Then** an agent cycle runs automatically.
- **Given** the cycle runs, **When** it completes, **Then** any new alerts and next-best actions are surfaced in the UI.

### US-9.2 — I can run the agent cycle on demand
**As** a youth, **I want** a "Run agent cycle" action, **so that** I can refresh recommendations whenever I want.

**Acceptance Criteria**
- **Given** any screen with the action available, **When** I trigger "Run agent cycle", **Then** the cycle re-evaluates my case and updates alerts, gaps, and recommendations.
- **Given** the cycle finishes, **When** results are ready, **Then** updated outputs are shown and persisted to localStorage.

### US-9.3 — The cycle detects progress, opportunities, deadlines, and inactivity
**As** a youth, **I want** the cycle to detect meaningful changes, **so that** I'm nudged about what matters.

**Acceptance Criteria**
- **Given** my case has changed progress, **When** the cycle runs, **Then** it detects progress changes and reflects them.
- **Given** approaching deadlines or new opportunities exist, **When** the cycle runs, **Then** it generates corresponding alerts.
- **Given** a period of inactivity, **When** the cycle runs, **Then** it generates a re-engagement nudge.
- **Given** the cycle updates my case, **When** it completes, **Then** it reassesses gaps and refreshes next-best actions.

---

## Epic E10 — Non-Functional Enablers
*Traces to: NFR-3 (Security), NFR-4 (Resiliency), NFR-6 (Accessibility), FR-8 (Multilingual)*

### US-10.1 — Bedrock credentials stay in the backend
**As** a youth, **I want** the platform to keep AWS/Bedrock credentials on the server side, **so that** my use of the app is secure and no secrets are exposed in the browser.
*Traces to: NFR-3 (SECURITY-12, SECURITY-09); reflects Q6 addendum.*

**Acceptance Criteria**
- **Given** the frontend needs AI features, **When** it calls the AI, **Then** it calls the Python/FastAPI backend over HTTP and never contacts Amazon Bedrock directly.
- **Given** the backend, **When** it calls Bedrock via boto3, **Then** AWS credentials are read from environment variables and are never present in frontend code or committed source.
- **Given** any client-side bundle, **When** inspected, **Then** it contains no AWS credentials or secrets.

### US-10.2 — Graceful degradation when the AI backend is unavailable
**As** a youth, **I want** the app to stay usable if the AI backend is down, **so that** I'm never stuck on a broken screen.
*Traces to: NFR-4 (RESILIENCY-06, RESILIENCY-10).*

**Acceptance Criteria**
- **Given** the backend is unreachable or a Bedrock call times out, **When** I use an AI-dependent screen, **Then** I see a clear, generic message and the rest of the app remains usable.
- **Given** an AI call is made, **When** it exceeds a configured timeout, **Then** it fails closed without exposing internal error details.
- **Given** the backend exposes a health check, **When** it is queried, **Then** it reports service status.

### US-10.3 — Accessible, responsive UI
**As** a youth, **I want** the interface to be accessible and responsive, **so that** I can use it comfortably on different devices and with assistive tech.
*Traces to: NFR-6.*

**Acceptance Criteria**
- **Given** any screen, **When** I navigate with a keyboard, **Then** all interactive elements are reachable and operable.
- **Given** the UI renders, **When** viewed on small and large screens, **Then** the layout remains usable and readable.
- **Given** text and controls, **When** displayed, **Then** contrast and semantic markup meet a baseline accessibility standard.

### US-10.4 — Interface ready for additional languages
**As** a youth, **I want** the interface built for future language support, **so that** other Indian languages can be added later without rework.
*Traces to: FR-8.*

**Acceptance Criteria**
- **Given** UI text, **When** rendered, **Then** it is routed through an i18n framework with English as the shipped locale.
- **Given** a new locale is added later, **When** translations are provided, **Then** no UI component refactoring is required to display them.

---

## INVEST & Coverage Check
- **Independent**: stories are scoped to a single capability; shared concerns are isolated in E10 enablers.
- **Negotiable / Small / Estimable**: medium granularity — a few focused stories per feature.
- **Valuable**: each story states youth value.
- **Testable**: every story has Given/When/Then acceptance criteria.
- **Requirements coverage**: FR-1..FR-8 and user-visible NFR-3/NFR-4/NFR-6 are mapped across epics E1–E10.
