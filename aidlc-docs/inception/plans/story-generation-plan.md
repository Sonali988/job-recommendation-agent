# Story Generation Plan — YuvaMitra

**Role**: Product Owner
**Purpose**: Convert the approved requirements (FR-1..FR-8, NFR-1..NFR-7) into user-centered stories with acceptance criteria and supporting personas.

---

## Planning Questions (please answer all `[Answer]:` tags)

These decisions shape how the stories are written. Answer each by filling in the letter after `[Answer]:`. If none fit, choose the last option and describe.

### Question 1 — Story Breakdown Approach
How should the user stories be organized?

A) Feature-Based — stories grouped around system features/screens (Dashboard, Profile, Skills & Gap, Roadmap, Opportunities, Chat, Notifications, Agent Cycle)

B) User Journey-Based — stories follow the core journey (Goal → Profile → Skills → Gap → Plan → Actions → Progress → Reassessment → Next Best Action)

C) Persona-Based — stories grouped by actor (Youth vs. the AI Agent system actor)

D) Epic-Based — hierarchical epics (one per requirement area FR-1..FR-8) with sub-stories

E) Hybrid — Epic-Based epics aligned to FR areas, with stories inside written in user-journey order (recommended)

F) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 2 — Personas to Include
Which personas should `personas.md` define?

A) One primary persona: the Youth (career-seeker)

B) Youth + a secondary "AI Agent" system actor persona (captures proactive/autonomous behavior)

C) Youth + AI Agent + Workshop Operator/Demo Admin (the person running the demo)

D) Multiple youth archetypes (e.g., student, recent graduate, early-career switcher) + AI Agent

E) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 3 — Acceptance Criteria Format
What format should acceptance criteria use?

A) Given/When/Then (Gherkin-style) — precise, testable, maps well to later tests

B) Bulleted checklist of conditions

C) Given/When/Then for behavioral stories + checklist for simple UI stories (hybrid)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 4 — Story Granularity
What level of granularity do you want?

A) Coarse — one story per screen/capability (fewer, larger stories)

B) Medium — screens broken into a few focused stories each (balanced) (recommended)

C) Fine — many small stories per screen/interaction

D) Other (please describe after [Answer]: tag below)

[Answer]:B

### Question 5 — AI/Agent Behavior Stories
How should the AI-driven behaviors (assessment, gap analysis, roadmap, next-best-action, agent cycle) be captured?

A) As first-class user stories from the Youth's perspective ("As a youth, I want the agent to analyze my skill gaps...")

B) As system/agent stories from the AI Agent's perspective ("As the AI agent, I detect approaching deadlines and notify the youth")

C) Both — youth-facing value stories plus agent-perspective behavior stories where autonomy matters (recommended)

D) Other (please describe after [Answer]: tag below)

[Answer]:A

### Question 6 — Non-Functional Coverage in Stories
Should NFRs (security, resiliency/graceful degradation, multilingual scaffolding, accessibility) appear as stories?

A) Yes — include dedicated NFR/technical-enabler stories with acceptance criteria (e.g., "AI backend unavailable → graceful degradation")

B) No — keep stories purely functional; NFRs remain only in requirements.md

C) Only the user-visible ones (graceful degradation, accessibility, language switch), skip the rest

D) Other (please describe after [Answer]: tag below)

[Answer]:A with bedrock creds in the backend

### Question 7 — Prioritization / Sizing Signals
Should each story carry lightweight prioritization and sizing hints?

A) Yes — add MoSCoW priority (Must/Should/Could) and a relative size (S/M/L) per story

B) Priority only (MoSCoW), no sizing

C) No — keep stories free of priority/size for now

D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Execution Checklist (executed after the plan is approved)

### Part 1 — Planning
- [ ] Assume Product Owner role
- [ ] Assess user-stories need (done: `user-stories-assessment.md`)
- [ ] Generate context-appropriate planning questions (this file)
- [ ] Collect answers to all `[Answer]:` tags
- [ ] Analyze answers for ambiguity; raise follow-up clarifications if needed
- [ ] Obtain explicit approval of this plan

### Part 2 — Generation (methodology)
- [ ] Derive personas from approved persona decision (Q2) → `personas.md`
- [ ] Map requirements FR-1..FR-8 to epics/story groups using approved breakdown (Q1)
- [ ] Write user stories using approved granularity (Q4) and INVEST criteria
- [ ] Write acceptance criteria in approved format (Q3)
- [ ] Add AI/agent behavior stories per approved approach (Q5)
- [ ] Add NFR/enabler stories per approved coverage (Q6)
- [ ] Add priority/sizing hints per approved decision (Q7)
- [ ] Map personas to their relevant stories
- [ ] Verify all stories are Independent, Negotiable, Valuable, Estimable, Small, Testable
- [ ] Produce `stories.md` and `personas.md` in `aidlc-docs/inception/user-stories/`
- [ ] Update `aidlc-state.md` and present completion for approval

---

## Mandatory Story Artifacts
- [ ] `stories.md` — user stories following INVEST criteria, each with acceptance criteria
- [ ] `personas.md` — user archetypes/actors with characteristics and goals
- [ ] Persona-to-story mapping included

## Story Breakdown Approaches (reference for Q1)
- **User Journey-Based**: follows user workflows; great for end-to-end clarity, can blur feature boundaries.
- **Feature-Based**: organized by screens/capabilities; maps cleanly to UI build order.
- **Persona-Based**: grouped by actor; highlights differing needs, can duplicate cross-cutting flows.
- **Domain-Based**: organized by business domain; useful for large systems, overkill for a single-persona demo.
- **Epic-Based**: hierarchical epics with sub-stories; strong traceability to requirement areas.
- **Hybrid (recommended)**: Epic-Based epics tied to FR-1..FR-8, with stories inside ordered along the user journey — combines traceability with flow.
