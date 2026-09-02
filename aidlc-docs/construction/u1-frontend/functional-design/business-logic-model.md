# Frontend Business Logic Model — Unit U1

Client-side logic and orchestration. All AI/data comes from U2 over HTTP; the client never calls Bedrock (US-10.1).

---

## 1. State model (CaseContext)
- Holds: `case` (YouthCase incl. goal), `sessionState` (completedTaskIds, applied/saved sets, dismissedAlertIds, lastActiveAt, lastCycleAt), and cached AI results (`assessment`, `gaps`, `roadmap`, `opportunities`, `agentResult`), plus `degraded` flag.
- Exposes actions: `selectProfile(id)`, `setGoal(text)`, `markTaskDone(id)`, `apply(oppId)`, `save(oppId)`, `markAlertRead(id)`, `dismissAlert(id)`, `runAgentCycle()`, cache setters.
- Hooks: `useCase()`, `useAlerts()`, `useProgress()`, `useDegraded()`.

## 2. Persistence (LocalStorageRepo)
- Persisted shape `PersistedState { profileId, goalText, sessionState }`.
- `save()` after every mutating action; `load()` on startup to restore session (US-1.2).
- Round-trip safe (PBT-02 on client); on-disk seed never touched (there is none client-side).
- Namespaced per `profileId` so switching demo profiles keeps separate session state.

## 3. Login & load flow (US-1.1/1.2)
1. On startup, `load()`; if a `profileId` exists, fetch `GET /api/case/{id}`, hydrate context, route to dashboard.
2. Else show LoginScreen -> `GET /api/profiles` -> select -> load case -> persist -> dashboard.

## 4. Agent-cycle-on-load (US-9.1)
- On first dashboard mount per session, call `POST /api/agent-cycle` with `{case_id, goal_text, session}`.
- Store `agentResult` (alerts, nextBestActions, reassessedGaps, progress) in context; merge alerts with locally dismissed ids; update `lastCycleAt`.
- "Run agent cycle" button repeats on demand (US-9.2).

## 5. AI call orchestration (Q3=A)
- Each AI-backed screen calls its endpoint on first open and caches the result in context for the session (re-fetch on explicit refresh or goal change).
- Every AI response includes `degraded`; if true, set global degraded flag (drives banner) and still render whatever data returned.

## 6. Apply/Save + Application Tracker (Q4=A, US-6.2)
- `apply(oppId)` / `save(oppId)` update sets in `sessionState`, persist to localStorage; Opportunities screen reflects state; ApplicationTracker lists applied/saved with status.
- `enroll` action additionally calls `POST /api/opportunities/act {action:"enroll"}` (mock) and shows the returned message.

## 7. Progress & alerts display
- Progress ring uses `agentResult.progress` (backend-computed, [0,100]); falls back to 0 until first cycle.
- AlertIndicator counts unread, non-dismissed alerts.

## 8. Degraded handling (US-10.2)
- A startup `GET /api/health` sets initial reachability; failed calls or `degraded:true` show the non-blocking banner.
- Deterministic data (case, opportunities list) renders normally even when AI features degrade; only AI-dependent actions show inline "unavailable" states.

## 9. i18n
- `I18nProvider` supplies `t(key)`; all UI copy keyed; English bundle shipped; adding a locale = adding a bundle (no component change).
