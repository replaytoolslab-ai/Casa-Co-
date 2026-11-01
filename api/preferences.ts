import type { Request, Response } from 'express';

type JsonObject = Record<string, unknown>;
const TABLE = 'user_preferences';

function env(name: string): string {
  const value = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value.replace(/\/$/, '');
}

function parseBody(body: unknown): JsonObject | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (new TextEncoder().encode(JSON.stringify(body)).length > 32 * 1024) return null;
  return body as JsonObject;
}

async function authenticate(req: Request): Promise<string | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return null;
  const response = await fetch(`${env('SUPABASE_URL')}/auth/v1/user`, {
    headers: { apikey: env('SUPABASE_ANON_KEY'), Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const user: unknown = await response.json();
  return user && typeof user === 'object' && 'id' in user && typeof user.id === 'string' ? user.id : null;
}

async function db(path: string, init: RequestInit = {}) {
  return fetch(`${env('SUPABASE_URL')}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PUT'].includes(req.method || '')) {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  try {
    const userId = await authenticate(req);
    if (!userId) return res.status(401).json({ error: 'Accesso non autorizzato.' });

    const query = new URLSearchParams({ user_id: `eq.${userId}`, select: 'data' });
    if (req.method === 'GET') {
      const response = await db(`${TABLE}?${query.toString()}`);
      if (!response.ok) return res.status(502).json({ error: 'Impossibile caricare le preferenze.' });
      const rows = await response.json() as { data?: JsonObject }[];
      return res.status(200).json({ preferences: rows[0]?.data ?? {} });
    }

    const body = parseBody(req.body);
    if (!body || !Array.isArray(body.savedProjectIds) ||
        body.savedProjectIds.length > 500 ||
        !body.savedProjectIds.every(id => typeof id === 'string' && id.length <= 120)) {
      return res.status(400).json({ error: 'Preferenze non valide.' });
    }

    const response = await db(`${TABLE}?on_conflict=user_id`, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{ user_id: userId, data: { savedProjectIds: [...new Set(body.savedProjectIds)] } }])
    });
    if (!response.ok) return res.status(502).json({ error: 'Impossibile salvare le preferenze.' });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Servizio preferenze temporaneamente non disponibile.' });
  }
}
