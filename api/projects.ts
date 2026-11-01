import type { Request, Response } from 'express';

const MAX_BODY_BYTES = 256 * 1024;
const PROJECTS_TABLE = 'user_projects';

type JsonObject = Record<string, unknown>;

function getEnv(name: string): string {
  const value = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value.replace(/\/$/, '');
}

function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

function parseBody(body: unknown): JsonObject | null {
  if (typeof body === 'string') {
    if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) return null;
    try {
      const parsed: unknown = JSON.parse(body);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as JsonObject : null;
    } catch {
      return null;
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (new TextEncoder().encode(JSON.stringify(body)).length > MAX_BODY_BYTES) return null;
  return body as JsonObject;
}

async function supabaseRequest(path: string, key: string, init: RequestInit = {}) {
  const baseUrl = getEnv('SUPABASE_URL');
  return fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      // Supabase sb_secret_* keys are API keys, not JWTs.
      // Send them via apikey only; do not put them in Authorization: Bearer.
      apikey: key,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
}

async function authenticate(req: Request): Promise<string | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;

  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return null;

  const response = await fetch(`${getEnv('SUPABASE_URL')}/auth/v1/user`, {
    headers: {
      apikey: getEnv('SUPABASE_ANON_KEY'),
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) return null;
  const user: unknown = await response.json();
  if (!user || typeof user !== 'object' || !('id' in user) || typeof user.id !== 'string') return null;
  return user.id;
}

/**
 * Vercel serverless API for private user projects.
 * The service-role key is used only on the server, after validating the user's access token.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');

  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method || '')) {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return sendError(res, 405, 'Metodo non consentito.');
  }

  try {
    const userId = await authenticate(req);
    if (!userId) return sendError(res, 401, 'Accesso non autorizzato. Effettua nuovamente il login.');

    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const query = new URLSearchParams({ select: 'id,title,data,created_at,updated_at' });

    if (req.method === 'GET') {
      query.set('user_id', `eq.${userId}`);
      query.set('order', 'updated_at.desc');
      const response = await supabaseRequest(`${PROJECTS_TABLE}?${query.toString()}`, serviceKey);
      if (!response.ok) return sendError(res, 502, 'Impossibile caricare i progetti.');
      return res.status(200).json({ projects: await response.json() });
    }

    const body = parseBody(req.body);
    if (!body) return sendError(res, 400, 'Corpo della richiesta non valido o troppo grande.');

    if (req.method === 'POST') {
      const title = typeof body.title === 'string' ? body.title.trim().slice(0, 160) : '';
      const data = body.data;
      if (!title || !data || typeof data !== 'object' || Array.isArray(data)) {
        return sendError(res, 400, 'Sono richiesti titolo e dati del progetto.');
      }
      const response = await supabaseRequest(PROJECTS_TABLE, serviceKey, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{ user_id: userId, title, data }])
      });
      if (!response.ok) return sendError(res, 502, 'Impossibile salvare il progetto.');
      const rows = await response.json() as unknown[];
      return res.status(201).json({ project: rows[0] });
    }

    const projectId = typeof body.id === 'string' ? body.id : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) {
      return sendError(res, 400, 'Identificativo progetto non valido.');
    }

    query.set('id', `eq.${projectId}`);
    query.set('user_id', `eq.${userId}`);

    if (req.method === 'DELETE') {
      const response = await supabaseRequest(`${PROJECTS_TABLE}?${query.toString()}`, serviceKey, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' }
      });
      if (!response.ok) return sendError(res, 502, 'Impossibile eliminare il progetto.');
      return res.status(204).end();
    }

    const updates: JsonObject = {};
    if (typeof body.title === 'string') {
      const title = body.title.trim().slice(0, 160);
      if (!title) return sendError(res, 400, 'Il titolo non può essere vuoto.');
      updates.title = title;
    }
    if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
      updates.data = body.data;
    }
    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'Nessun campo valido da aggiornare.');
    }

    const response = await supabaseRequest(`${PROJECTS_TABLE}?${query.toString()}`, serviceKey, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return sendError(res, 502, 'Impossibile aggiornare il progetto.');
    const rows = await response.json() as unknown[];
    if (rows.length === 0) return sendError(res, 404, 'Progetto non trovato.');
    return res.status(200).json({ project: rows[0] });
  } catch {
    return sendError(res, 500, 'Servizio temporaneamente non disponibile.');
  }
}
