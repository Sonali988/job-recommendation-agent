# Requirements Clarification Questions — YuvaMitra

Thanks for the answers. Before I write the requirements document, I need to resolve one architectural contradiction and capture a few mandatory decisions required by the Security and Resiliency extensions you enabled.

Please fill in the `[Answer]:` tags and let me know when done.

---

## Contradiction 1: Bedrock called directly from the browser vs. security + local-only

You chose:
- Q1 = B and Q2 = B: the app calls **Amazon Bedrock directly**, and Bedrock reads the youth JSON data.
- Q9 = A: **local dev only**, a static React/Vite frontend.
- Security extension = **Yes (blocking)**, which forbids hardcoded credentials/secrets in frontend source (SECURITY-12).

A pure browser (static frontend) cannot safely call Amazon Bedrock, because it would require embedding long-lived AWS credentials in client-side code — which the enabled security rules explicitly prohibit, and which is unsafe even for a demo. Bedrock also does not accept CORS browser calls with a signed request safely from static hosting.

The standard resolution is a **thin backend/proxy** (a small Node/Express or serverless function) that holds AWS credentials server-side, calls Bedrock, and passes the youth JSON to the model. The React frontend talks to this backend over HTTP.

### Clarification Question 1
How should the app reach Amazon Bedrock?

A) Add a thin local backend (Node + Express) that holds AWS credentials via environment variables, loads the youth JSON, calls Bedrock, and exposes HTTP endpoints the React app calls. (Recommended — satisfies security rules, keeps Q1/Q2 "real Bedrock" intent, runs locally.)

B) Serverless proxy (AWS Lambda + API Gateway) instead of a local Express server — more setup, closer to cloud deployment.

C) Keep it browser-only and accept entering temporary AWS credentials in the UI at runtime (NOT stored in source). Higher risk, weaker security posture, credentials live in browser memory.

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Clarification Question 2
Which Amazon Bedrock model family should the AI layer use?

A) Anthropic Claude on Bedrock (e.g., Claude 3.5 Sonnet / Claude 3 Haiku) — strong reasoning for assessment and recommendations

B) Amazon Nova (e.g., Nova Pro / Nova Lite)

C) Meta Llama on Bedrock

D) You decide / no preference — pick a sensible default and make it configurable via env var

X) Other (please describe after [Answer]: tag below)

[Answer]: D

### Clarification Question 3
Which AWS region should Bedrock use?

A) us-east-1

B) us-west-2

C) ap-south-1 (Mumbai)

D) No preference — make it configurable via env var with a sensible default

X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Resiliency Extension — Required Decisions (you enabled resiliency = Yes)

These decisions are mandated by the resiliency baseline and must come from you, not me. Given this is a local demo/workshop build, lightweight answers are fine.

### Clarification Question 4 (RTO/RPO & DR strategy — RESILIENCY-02)
What recovery targets apply to this workload?

A) N/A — local demo/single environment, no cross-region DR needed; rely on process being restartable and JSON seed data in source control

B) RPO/RTO in hours — Backup & Restore (lowest cost)

C) RPO/RTO in minutes — Warm Standby

D) Near real-time — Active/Active

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Clarification Question 5 (Change management — RESILIENCY-03)
How should changes to this project be governed?

A) N/A / exempt — this is a workshop/demo project; changes tracked via Git only

B) Use our existing organizational change management process (name it in Other)

C) Propose a lightweight process (change record + approval + rollback note)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Clarification Question 6 (CI/CD & deployment — RESILIENCY-04)
What deployment/CI approach applies now?

A) None for this iteration — local `npm run dev` / `npm run build` only; rollback = revert Git commit

B) Propose a CI/CD pipeline (e.g., GitHub Actions) appropriate to the stack

C) Use our existing pipeline (name it in Other)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Clarification Question 7 (Incident response — RESILIENCY-15)
How are issues handled for this workload?

A) N/A / informal — workshop project, issues handled ad hoc

B) Use our existing incident response process (name it in Other)

C) Propose a lightweight incident response + correction-of-errors note

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Confirmation on JSON persistence (from Q3 = B, read-only)

### Clarification Question 8
You chose Q3 = B (static seed JSON, read-only, no persistence across reloads). But several features imply state changes (marking tasks done, agent cycle producing new alerts, progress updates). Confirm the behavior:

A) Confirmed: seed JSON is read-only; any in-session changes (completed tasks, generated alerts, progress) live only in React state and reset on reload

B) Actually, allow in-session changes to persist to browser localStorage so a reload keeps progress (still no server writes)

X) Other (please describe after [Answer]: tag below)

[Answer]: B
