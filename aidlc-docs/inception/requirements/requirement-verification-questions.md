# Requirements Verification Questions — MY Bharat Personal Youth Agent (YuvaMitra)

Please answer each question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose the "Other" option and describe your preference after the tag. Let me know when you're done.

---

## Question 1
For this iteration, what is the primary scope you want delivered?

A) Full working frontend (React + Vite + Tailwind) with JSON data and a simulated/mock AI layer (Bedrock calls stubbed) — runs locally end-to-end without AWS credentials

B) Frontend + real Amazon Bedrock integration wired in (requires AWS credentials/config at runtime)

C) Frontend + real Bedrock + AgentCore Memory + MCP tool orchestration (full cloud integration)

D) Frontend UI only (screens and navigation), data and AI layer as later phases

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
How should the AI layer behave in this deliverable so it runs reliably during the workshop/demo?

A) Abstract "AI service" interface with a mock/local implementation by default, plus a Bedrock implementation that activates when AWS config is present (recommended for a resilient demo)

B) Always call Amazon Bedrock directly (no mock fallback)

C) Mock only for now; add Bedrock later

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
Where does the youth JSON data live and how is it edited?

A) Static seed JSON files bundled in the app; user actions update an in-memory/browser (localStorage) copy during the session

B) Static seed JSON files only, read-only (no persistence of changes across reloads)

C) A small local backend (Node/Express) that reads and writes JSON files on disk

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4
Which languages should the multilingual experience support in this iteration?

A) English + Hindi

B) English + Hindi + 2-3 additional Indian languages (please name in Other if you want specific ones)

C) English only for now; multilingual scaffolding (i18n framework) in place for later

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 5
Is there any real authentication/login required, or is this a single demo youth profile?

A) No auth — single/selectable demo youth profile(s) loaded from JSON

B) Simple mock login (pick a youth profile, no real credentials)

C) Real authentication (please describe provider in Other)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
Which core screens/views are must-haves for this iteration? (Choose the closest set)

A) Dashboard (goal + progress), Profile, Skills & Gap Analysis, Learning Roadmap/Plan, Opportunities, Chat with Agent, Notifications/Alerts

B) A leaner set: Dashboard, Chat with Agent, Skills/Gap Analysis, Opportunities

C) Everything in A plus a Journey/Timeline history view and a Milestones/Tasks board

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
The "continuous proactive agent cycle" (detect progress, deadlines, inactivity, notify). How should it run in this iteration?

A) Client-side simulation triggered on load and on-demand (a "Run agent cycle" action) that evaluates JSON and produces alerts/next-best-actions

B) Timed/interval simulation in the browser while the app is open

C) Real backend/scheduled job (out of scope for this iteration)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
MCP tool orchestration of MY Bharat services. What level for this iteration?

A) Design a clean MCP tool interface with mocked "MY Bharat" tools (e.g., search opportunities, enroll) — real MCP wiring is future work

B) Real MCP client wiring to a running MCP server (please describe endpoint in Other)

C) Omit MCP entirely for now; note as future work

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
What is the target platform/deployment for now?

A) Local development only (`npm run dev`), with a production build (`npm run build`) that could later deploy to any static host

B) Local + explicit AWS hosting setup (e.g., S3/CloudFront or Amplify) in this iteration

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

Enabling it applies directional, design-time best practices for building resilient systems (derived from the AWS Well-Architected Reliability Pillar). It is a starting point, not a production-readiness certification.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: B
