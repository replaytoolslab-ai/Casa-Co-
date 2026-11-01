export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

const SESSION_KEY = 'faidatecasa.auth.session';

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as AuthSession;
    return value?.access_token && value?.refresh_token && value?.user?.id ? value : null;
  } catch {
    return null;
  }
}

function storeSession(session: AuthSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result && typeof result.error === 'string' ? result.error : 'Operazione non riuscita.';
    throw new Error(message);
  }
  return result as T;
}

function toSession(value: Partial<AuthSession> & { expires_in?: number }): AuthSession {
  if (!value.access_token || !value.refresh_token || !value.user?.id) {
    throw new Error('Accesso non completato. Controlla la tua email per la conferma dell’account.');
  }
  return {
    access_token: value.access_token,
    refresh_token: value.refresh_token,
    expires_at: value.expires_at ?? Math.floor(Date.now() / 1000) + (value.expires_in ?? 3600),
    user: value.user
  };
}

export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    const result = await request<Partial<AuthSession> & { expires_in?: number; user?: AuthUser }>({
      action: 'signup',
      email,
      password,
      data: { display_name: displayName },
      redirectTo: window.location.origin
    });
    if (result.access_token) storeSession(toSession(result));
    return { session: result.access_token ? toSession(result) : null, user: result.user ?? null };
  },

  async signIn(email: string, password: string) {
    const result = await request<Partial<AuthSession> & { expires_in?: number }>({
      action: 'login', email, password
    });
    const session = toSession(result);
    storeSession(session);
    return session;
  },

  async restoreSession(): Promise<AuthSession | null> {
    const current = readSession();
    if (!current) return null;
    try {
      let session = current;
      if (current.expires_at <= Math.floor(Date.now() / 1000) + 60) {
        const refreshed = await request<Partial<AuthSession> & { expires_in?: number }>({
          action: 'refresh', refresh_token: current.refresh_token
        });
        session = toSession(refreshed);
        storeSession(session);
      }
      const user = await request<AuthUser>({ action: 'user', access_token: session.access_token });
      session = { ...session, user };
      storeSession(session);
      return session;
    } catch {
      storeSession(null);
      return null;
    }
  },

  async updateProfile(session: AuthSession, data: Record<string, unknown>) {
    const result = await request<AuthUser>({
      action: 'update', access_token: session.access_token, data
    });
    const updated = { ...session, user: result };
    storeSession(updated);
    return updated;
  },

  async updatePassword(session: AuthSession, password: string) {
    const result = await request<AuthUser>({
      action: 'update', access_token: session.access_token, password
    });
    const updated = { ...session, user: result };
    storeSession(updated);
    return updated;
  },

  async sendPasswordReset(email: string) {
    await request({ action: 'recover', email, redirectTo: window.location.origin });
  },

  async signOut(session: AuthSession | null) {
    try {
      if (session?.access_token) await request({ action: 'logout', access_token: session.access_token });
    } finally {
      storeSession(null);
    }
  }
};
