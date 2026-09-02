# Frontend Business Rules — Unit U1

Client-side validation, constraints, and invariants.

---

## Validation Rules
- **FVR-1 Goal**: trimmed length 1..500; save disabled when invalid.
- **FVR-2 Chat message**: trimmed length 1..2000; send disabled when empty; history sent capped at 50 messages (matches backend bound).
- **FVR-3 Profile select**: a listed profile id must be chosen before entering the app.
- **FVR-4 Opportunity action**: apply/save/enroll only enabled for opportunities present in the loaded list.

## Persistence Rules
- **FPR-1 (PBT-02 round-trip)**: `PersistedState` serialises/deserialises to localStorage without loss.
- **FPR-2**: every mutating action persists immediately; a reload restores the same session (US-1.2, US-3.3, US-8.2).
- **FPR-3**: session state is namespaced by `profileId`; switching profiles does not mix state.
- **FPR-4**: the client never writes to any server-side store (backend is stateless).

## Security Rules (client)
- **FSR-1 (US-10.1)**: no AWS credentials or secrets in the frontend bundle or code; all AI goes through U2.
- **FSR-2**: only send necessary fields to U2 (case_id, goal_text, session, messages) — no unnecessary PII echoed.
- **FSR-3**: treat all backend responses as data (render as text; no HTML injection).

## Resiliency Rules (client)
- **FRR-1 (US-10.2)**: on AI failure/degraded, show a non-blocking banner and keep the app usable; never a full-screen crash.
- **FRR-2**: network calls have timeouts and surface a retry affordance; loading states on every async view.

## Accessibility Rules (US-10.3)
- **FAR-1**: all interactive elements keyboard-reachable and operable; visible focus.
- **FAR-2**: icon-only buttons have `aria-label`; images have alt text; adequate colour contrast.
- **FAR-3**: semantic landmarks (`nav`, `main`, headings hierarchy).

## i18n Rules (US-10.4)
- **FIR-1**: no hard-coded display strings in components; all via `t()`.
- **FIR-2**: adding a locale requires only a new bundle, no component refactor.

## Invariants (client PBT — fast-check, Partial mode)
- **CINV-1 (FPR-1)**: PersistedState round-trip is lossless.
- **CINV-2**: applied/saved sets contain only valid opportunity ids; no duplicates.
- **CINV-3**: displayed progress is clamped to [0,100] (defensive, even though backend guarantees it).
