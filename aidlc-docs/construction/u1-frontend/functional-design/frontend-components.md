# Frontend Components — Unit U1

Component hierarchy, props/state, interaction flows, validation, and API integration points. Decisions: Q1..Q7 = A (React Router + left-nav; ApiClient+hooks+context; on-demand AI + cycle-on-load; localStorage apply/save + tracker; non-blocking degraded banner; reusable Tailwind components; landing mock login).

---

## Component Hierarchy
```
main.tsx
└── App (Router + I18nProvider + CaseProvider)
    ├── LoginScreen                     (route "/", when no profile selected)
    └── AppLayout                       (protected; renders when profile selected)
        ├── SideNav                     (Dashboard, Profile, Skills, Roadmap, Opportunities, Chat, Notifications, Settings)
        ├── TopBar                      (greeting, search box [visual], AlertIndicator)
        ├── DegradedBanner              (shown when any AI call reports degraded)
        └── <Outlet> (routed screens)
            ├── DashboardScreen
            ├── ProfileScreen
            ├── SkillsGapScreen
            ├── RoadmapScreen
            ├── OpportunitiesScreen
            ├── ChatScreen
            └── NotificationsScreen
```

### Shared presentational components (Tailwind, `components/`)
`Card`, `StatTile`, `ProgressRing`, `Badge`, `Button`, `MatchScoreRing`, `Spinner`, `EmptyState`, `Banner`. All interactive elements carry stable `data-testid` (e.g., `login-profile-<id>`, `opportunity-apply-button`).

---

## Component Specs (props / state / API / flow)

### LoginScreen (US-1.1)
- **Props**: none. **State**: `profiles`, `loading`, `error`.
- **API**: `GET /api/profiles` on mount.
- **Flow**: render profile cards -> on select, `CaseContext.selectProfile(id)` loads case (`GET /api/case/{id}`), persists to localStorage, navigate to `/dashboard`.

### AppLayout / SideNav / TopBar (FC-1)
- **Props**: none (consume context). **State**: active route.
- **TopBar** shows greeting (`case.name`), an AlertIndicator (unread alert count from context).

### DashboardScreen (US-2.1, US-2.2, US-9.1)
- **State (from context)**: `case`, `progress`, `alerts`, `agentResult`.
- **API**: `POST /api/agent-cycle` on first load (cycle-on-load), `POST /api/assessment` (for readiness/strength tiles) — both cached in context.
- **Renders**: goal + `ProgressRing`, `StatTile`s (matches found / applied / interviews-equiv=tasks), top match cards (`MatchScoreRing`), Recommended Skills list, activity/alert summary, top companies row.

### ProfileScreen (US-3.1, US-3.2, US-3.3)
- **State**: editable `goalText`; case sections read from context.
- **Flow**: edit goal -> validate (non-empty, <=500) -> `CaseContext.setGoal(text)` (persists to localStorage, records journey event). No backend write.

### SkillsGapScreen (US-4.1, US-4.2, US-4.3)
- **API**: `POST /api/assessment` and `POST /api/gap-analysis` (on open, cached).
- **Renders**: assessment summary + readiness, `SkillsInventory` groups, prioritized gaps with demand `Badge`s (mockup "Recommended Skills to Improve").

### RoadmapScreen (US-5.1, US-5.2)
- **API**: `POST /api/roadmap` (on open).
- **Renders**: ordered steps with suggested courses; NextBestActions list; "mark done" -> updates `completedTaskIds` in localStorage + recompute progress.

### OpportunitiesScreen (US-6.1, US-6.2)
- **API**: `GET /api/opportunities?case_id=...`; `POST /api/opportunities/act` for search/enroll.
- **Renders**: opportunity cards (match ring, org, reasons, apply/save buttons) + an ApplicationTracker (applied/saved from localStorage) styled like the mockup tracker.

### ChatScreen (US-7.1, US-7.2)
- **State**: `messages` (session). **API**: `POST /api/chat` with `{case_id, goal_text, messages}`.
- **Flow**: submit message (validate non-empty, cap length) -> append -> call -> render assistant reply; if `degraded`, show inline notice.

### NotificationsScreen (US-8.1, US-8.2)
- **State**: `alerts` from context (sourced from agent-cycle). 
- **Flow**: mark read / dismiss -> persist `read`/`dismissedAlertIds` to localStorage; drives AlertIndicator.

### DegradedBanner (US-10.2)
- **Props**: `visible`. Shown when any recent AI response had `degraded: true` or a call failed; non-blocking.

---

## Form Validation Rules
- **Goal editor**: required, trimmed length 1..500; disable save when invalid.
- **Chat composer**: required, trimmed length 1..2000; disable send when empty; cap history sent to 50 messages (matches backend bound).
- **Profile select**: must choose a listed profile before proceeding.

## API Integration Map
| Screen | Endpoint(s) |
|---|---|
| Login | GET /api/profiles, GET /api/case/{id} |
| Dashboard | POST /api/agent-cycle, POST /api/assessment |
| Skills & Gap | POST /api/assessment, POST /api/gap-analysis |
| Roadmap | POST /api/roadmap |
| Opportunities | GET /api/opportunities, POST /api/opportunities/act |
| Chat | POST /api/chat |
| Notifications | (data from agent-cycle result in context) |
| (all) | GET /api/health (startup probe for banner) |

## Accessibility & i18n (US-10.3/10.4)
- Semantic landmarks (`nav`, `main`), keyboard-focusable interactives, adequate contrast, `aria-label`s on icon buttons.
- All display strings via `t()` from I18nProvider; English shipped; structure ready for more locales.
