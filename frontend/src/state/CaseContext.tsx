// LC-F2 CaseProvider + hooks — session state, cached AI results, persistence, degraded flag.
import {
  createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode,
} from "react";
import { api } from "../api/client";
import { localRepo } from "../storage/localRepo";
import {
  emptySession, type AgentCycleResult, type Assessment, type PrioritizedGap,
  type Opportunity, type Roadmap, type NextBestAction, type SessionState,
  type SkillsInventory, type YouthCase,
} from "../types/models";

interface CachedAI {
  assessment?: Assessment;
  inventory?: SkillsInventory;
  gaps?: PrioritizedGap[];
  roadmap?: Roadmap;
  nextBestActions?: NextBestAction[];
  opportunities?: Opportunity[];
  agent?: AgentCycleResult;
}

interface CaseState {
  loaded: boolean;
  profileId: string | null;
  youthCase: YouthCase | null;
  goalText: string;
  session: SessionState;
  ai: CachedAI;
  degraded: boolean;
}

interface CaseApi extends CaseState {
  selectProfile: (id: string) => Promise<void>;
  setGoal: (text: string) => void;
  markTaskDone: (id: string) => void;
  toggleApplied: (oppId: number) => void;
  toggleSaved: (oppId: number) => void;
  dismissAlert: (id: string) => void;
  markAlertRead: (id: string) => void;
  setAI: (patch: Partial<CachedAI>) => void;
  runAgentCycle: () => Promise<void>;
  setDegraded: (v: boolean) => void;
}

const Ctx = createContext<CaseApi | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CaseState>({
    loaded: false, profileId: null, youthCase: null, goalText: "",
    session: emptySession(), ai: {}, degraded: false,
  });
  const cycleRan = useRef(false);

  const persist = useCallback((next: CaseState) => {
    if (next.profileId) {
      localRepo.save({ profileId: next.profileId, goalText: next.goalText, session: next.session });
    }
  }, []);

  const update = useCallback((patch: Partial<CaseState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, [persist]);

  const selectProfile = useCallback(async (id: string) => {
    const saved = localRepo.load(id);
    const res = await api.getCase(id);
    setState((prev) => {
      const next: CaseState = {
        ...prev,
        loaded: true,
        profileId: id,
        youthCase: res.data ?? null,
        goalText: saved?.goalText ?? res.data?.goal?.text ?? "",
        session: { ...emptySession(), ...(saved?.session ?? {}), lastActiveAt: new Date().toISOString() },
        ai: {},
        degraded: res.degraded,
      };
      persist(next);
      return next;
    });
    cycleRan.current = false;
  }, [persist]);

  const setGoal = useCallback((text: string) => update({ goalText: text }), [update]);

  const mutateSession = useCallback((fn: (s: SessionState) => SessionState) => {
    setState((prev) => {
      const next = { ...prev, session: fn(prev.session) };
      persist(next);
      return next;
    });
  }, [persist]);

  const markTaskDone = useCallback((id: string) =>
    mutateSession((s) => s.completedTaskIds.includes(id) ? s
      : { ...s, completedTaskIds: [...s.completedTaskIds, id] }), [mutateSession]);

  const toggleApplied = useCallback((oppId: number) =>
    mutateSession((s) => ({
      ...s,
      appliedIds: s.appliedIds.includes(oppId)
        ? s.appliedIds.filter((x) => x !== oppId) : [...s.appliedIds, oppId],
    })), [mutateSession]);

  const toggleSaved = useCallback((oppId: number) =>
    mutateSession((s) => ({
      ...s,
      savedIds: s.savedIds.includes(oppId)
        ? s.savedIds.filter((x) => x !== oppId) : [...s.savedIds, oppId],
    })), [mutateSession]);

  const dismissAlert = useCallback((id: string) =>
    mutateSession((s) => s.dismissedAlertIds.includes(id) ? s
      : { ...s, dismissedAlertIds: [...s.dismissedAlertIds, id] }), [mutateSession]);

  const markAlertRead = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.ai.agent) return prev;
      const alerts = prev.ai.agent.alerts.map((a) => a.id === id ? { ...a, read: true } : a);
      return { ...prev, ai: { ...prev.ai, agent: { ...prev.ai.agent, alerts } } };
    });
  }, []);

  const setAI = useCallback((patch: Partial<CachedAI>) =>
    setState((prev) => ({ ...prev, ai: { ...prev.ai, ...patch } })), []);

  const setDegraded = useCallback((v: boolean) => setState((prev) => ({ ...prev, degraded: v })), []);

  const runAgentCycle = useCallback(async () => {
    if (!state.profileId) return;
    const res = await api.agentCycle({ case_id: state.profileId, goal_text: state.goalText, session: state.session });
    if (res.data) {
      setState((prev) => ({ ...prev, ai: { ...prev.ai, agent: res.data!.result }, degraded: res.degraded }));
      mutateSession((s) => ({ ...s, lastCycleAt: new Date().toISOString() }));
    } else {
      setDegraded(true);
    }
    cycleRan.current = true;
  }, [state.profileId, state.goalText, state.session, mutateSession, setDegraded]);

  const value = useMemo<CaseApi>(() => ({
    ...state, selectProfile, setGoal, markTaskDone, toggleApplied, toggleSaved,
    dismissAlert, markAlertRead, setAI, runAgentCycle, setDegraded,
  }), [state, selectProfile, setGoal, markTaskDone, toggleApplied, toggleSaved,
      dismissAlert, markAlertRead, setAI, runAgentCycle, setDegraded]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCase(): CaseApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCase must be used within CaseProvider");
  return ctx;
}

export function useProgress(): number {
  const { ai } = useCase();
  const p = ai.agent?.progress ?? 0;
  return Math.max(0, Math.min(100, p));
}

export function useAlerts() {
  const { ai, session } = useCase();
  const all = ai.agent?.alerts ?? [];
  return all.filter((a) => !session.dismissedAlertIds.includes(a.id));
}
