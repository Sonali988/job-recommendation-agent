import type { YouthProfile, ChatMessage } from '../types/youth'

const YOUTH_KEY_PREFIX = 'mybharat_youth_data_'
const CHAT_KEY_PREFIX = 'mybharat_chat_'

export function loadYouthFromStorage(profileId?: string): YouthProfile | null {
  try {
    const key = profileId ? `${YOUTH_KEY_PREFIX}${profileId}` : `${YOUTH_KEY_PREFIX}default`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveYouthToStorage(data: YouthProfile): void {
  localStorage.setItem(`${YOUTH_KEY_PREFIX}${data.id}`, JSON.stringify(data))
}

export function loadChatHistory(profileId?: string): ChatMessage[] {
  try {
    const key = profileId ? `${CHAT_KEY_PREFIX}${profileId}` : `${CHAT_KEY_PREFIX}default`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveChatHistory(messages: ChatMessage[], profileId?: string): void {
  const key = profileId ? `${CHAT_KEY_PREFIX}${profileId}` : `${CHAT_KEY_PREFIX}default`
  localStorage.setItem(key, JSON.stringify(messages))
}

export function clearSessionData(): void {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(YOUTH_KEY_PREFIX) || key.startsWith(CHAT_KEY_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}
