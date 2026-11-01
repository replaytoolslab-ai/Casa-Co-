import { AuthSession } from './authService';

export interface UserPreferences {
  savedProjectIds: string[];
}

export const preferencesService = {
  async load(session: AuthSession): Promise<UserPreferences> {
    const response = await fetch('/api/preferences', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store'
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Impossibile caricare i preferiti.');
    const ids = result?.preferences?.savedProjectIds;
    return { savedProjectIds: Array.isArray(ids) ? ids.filter((id: unknown): id is string => typeof id === 'string') : [] };
  },

  async save(session: AuthSession, preferences: UserPreferences): Promise<void> {
    const response = await fetch('/api/preferences', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Impossibile salvare i preferiti.');
  }
};
