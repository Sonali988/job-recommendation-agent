import type { CaseResponse, ProfileSummary } from '../types/case'
import type { YouthProfile } from '../types/youth'
import { adaptCaseToDashboard } from './adapter'

const API_BASE = '/api'
const PROFILE_KEY = 'mybharat_selected_profile'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function getSelectedProfileId(): string | null {
  return localStorage.getItem(PROFILE_KEY)
}

export function setSelectedProfileId(profileId: string): void {
  localStorage.setItem(PROFILE_KEY, profileId)
}

export async function fetchProfiles(): Promise<ProfileSummary[]> {
  return request<ProfileSummary[]>('/profiles')
}

export async function fetchCaseData(profileId?: string): Promise<CaseResponse> {
  const query = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : ''
  return request<CaseResponse>(`/youth${query}`)
}

export async function fetchYouthData(profileId?: string): Promise<YouthProfile> {
  const response = await fetchCaseData(profileId)
  return adaptCaseToDashboard(response)
}

export async function sendChatMessage(message: string, language = 'en', profileId?: string) {
  return request<{ response: string; model: string; source: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language, profile_id: profileId }),
  })
}

export async function runAssessment(language = 'en', profileId?: string) {
  return request<{ assessment: string; model: string; source: string }>('/assessment', {
    method: 'POST',
    body: JSON.stringify({ language, profile_id: profileId }),
  })
}

export async function runGapAnalysis(profileId?: string) {
  const query = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : ''
  return request<{ gaps: string[]; analysis: string; model: string; source: string }>(
    `/gap-analysis${query}`,
    { method: 'POST' }
  )
}

export async function getNextActions(profileId?: string) {
  const query = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : ''
  return request<{ actions: string; model: string; source: string }>(`/next-actions${query}`, {
    method: 'POST',
  })
}

export async function listMcpTools() {
  return request<{ tools: unknown[] }>('/mcp/tools')
}

export async function invokeMcpTool(toolName: string, params: Record<string, unknown> = {}) {
  return request<unknown>('/mcp/invoke', {
    method: 'POST',
    body: JSON.stringify({ tool_name: toolName, params }),
  })
}
