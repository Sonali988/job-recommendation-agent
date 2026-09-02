// LC-F3 LocalStorageRepo — session persistence, namespaced per profile.
import type { PersistedState } from "../types/models";

const KEY_PREFIX = "yuvamitra:session:";
const LAST_PROFILE_KEY = "yuvamitra:lastProfile";

export const localRepo = {
  save(state: PersistedState): void {
    localStorage.setItem(KEY_PREFIX + state.profileId, JSON.stringify(state));
    localStorage.setItem(LAST_PROFILE_KEY, state.profileId);
  },
  load(profileId: string): PersistedState | null {
    const raw = localStorage.getItem(KEY_PREFIX + profileId);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedState;
    } catch {
      return null;
    }
  },
  lastProfileId(): string | null {
    return localStorage.getItem(LAST_PROFILE_KEY);
  },
  clear(profileId: string): void {
    localStorage.removeItem(KEY_PREFIX + profileId);
  },
};
