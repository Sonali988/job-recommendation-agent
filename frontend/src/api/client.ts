// LC-F1 ApiClient — typed fetch wrapper with timeout + typed results.
// Never carries secrets; talks only to U2 over HTTP (US-10.1).
import type {
  AgentCycleResult, Assessment, ChatMessage, NextBestAction, Opportunity,
  PrioritizedGap, ProfileSummary, Roadmap, SessionState, SkillsInventory, YouthCase,
} from "../types/models";

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000";
const TIMEOUT_MS = 25000;

export interface Result<T> { data?: T; error?: string; degraded: boolean; }

async function call<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(BASE + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      signal: controller.signal,
    });
    const body = resp.status === 204 ? null : await resp.json().catch(() => null);
    if (!resp.ok) {
      return { error: (body && body.detail) || `HTTP ${resp.status}`, degraded: true };
    }
    const degraded = Boolean(body && (body as { degraded?: boolean }).degraded);
    return { data: body as T, degraded };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "network_error", degraded: true };
  } finally {
    clearTimeout(timer);
  }
}

interface CaseBody { case_id: string; goal_text?: string; session?: SessionState; }

export const api = {
  health: () => call<{ status: string; bedrock: string; version: string }>("/api/health"),
  profiles: () => call<ProfileSummary[]>("/api/profiles"),
  getCase: (id: string) => call<YouthCase>(`/api/case/${encodeURIComponent(id)}`),
  assessment: (b: CaseBody) =>
    call<{ assessment: Assessment; inventory: SkillsInventory; degraded: boolean }>(
      "/api/assessment", { method: "POST", body: JSON.stringify(b) }),
  gapAnalysis: (b: CaseBody) =>
    call<{ gaps: PrioritizedGap[]; requiredSkills: string[]; degraded: boolean }>(
      "/api/gap-analysis", { method: "POST", body: JSON.stringify(b) }),
  roadmap: (b: CaseBody) =>
    call<{ roadmap: Roadmap; nextBestActions: NextBestAction[]; degraded: boolean }>(
      "/api/roadmap", { method: "POST", body: JSON.stringify(b) }),
  opportunities: (caseId: string) =>
    call<{ opportunities: Opportunity[]; degraded: boolean }>(
      `/api/opportunities?case_id=${encodeURIComponent(caseId)}`),
  actOnOpportunity: (b: { action: string; opportunity_id?: string; query?: string; case_id: string }) =>
    call<{ action: string; opportunities?: Opportunity[]; status?: string; message?: string }>(
      "/api/opportunities/act", { method: "POST", body: JSON.stringify(b) }),
  chat: (b: { case_id: string; goal_text?: string; messages: ChatMessage[] }) =>
    call<{ message: ChatMessage; degraded: boolean }>(
      "/api/chat", { method: "POST", body: JSON.stringify(b) }),
  agentCycle: (b: CaseBody) =>
    call<{ result: AgentCycleResult; degraded: boolean }>(
      "/api/agent-cycle", { method: "POST", body: JSON.stringify(b) }),
};
