import type { Request, Response } from 'express';

const MAX_BODY_BYTES = 16 * 1024;
type JsonObject = Record<string, unknown>;

function env(name: string): string {
  const value = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value.replace(/\/$/, '');
}

function parseBody(body: unknown): JsonObject | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (new TextEncoder().encode(JSON.stringify(body)).length > MAX_BODY_BYTES) return null;
  return body as JsonObject;
}

function errorMessage(payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const value = payload as Record<string, unknown>;
    for (const key of ['msg', 'message', 'error_description', 'error']) {
      if (typeof value[key] === 'string') return value[key] as string;
    }
  }
  return 'Richiesta di autenticazione non riuscita.';
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const body = parseBody(req.body);
  if (!body || typeof body.action !== 'string') {
    return res.status(400).json({ error: 'Richiesta non valida.' });
  }

  const action = body.action;
  const baseUrl = env('SUPABASE_URL');
  const headers: Record<string, string> = {
    apikey: env('SUPABASE_ANON_KEY'),
    'Content-Type': 'application/json'
  };
  let url = '';
  let method = 'POST';
  let payload: JsonObject = {};

  switch (action) {
    case 'signup':
      if (typeof body.email !== 'string' || typeof body.password !== 'string') return res.status(400).json({ error: 'Email e password obbligatorie.' });
      url = `${baseUrl}/auth/v1/signup`;
      if (typeof body.redirectTo === 'string') url += `?redirect_to=${encodeURIComponent(body.redirectTo)}`;
      payload = { email: body.email, password: body.password, data: body.data && typeof body.data === 'object' ? body.data : {} };
      break;
    case 'login':
      if (typeof body.email !== 'string' || typeof body.password !== 'string') return res.status(400).json({ error: 'Email e password obbligatorie.' });
      url = `${baseUrl}/auth/v1/token?grant_type=password`;
      payload = { email: body.email, password: body.password };
      break;
    case 'refresh':
      if (typeof body.refresh_token !== 'string') return res.status(400).json({ error: 'Sessione non valida.' });
      url = `${baseUrl}/auth/v1/token?grant_type=refresh_token`;
      payload = { refresh_token: body.refresh_token };
      break;
    case 'user':
      if (typeof body.access_token !== 'string') return res.status(401).json({ error: 'Sessione scaduta.' });
      url = `${baseUrl}/auth/v1/user`;
      method = 'GET';
      headers.Authorization = `Bearer ${body.access_token}`;
      break;
    case 'update':
      if (typeof body.access_token !== 'string') return res.status(401).json({ error: 'Sessione scaduta.' });
      url = `${baseUrl}/auth/v1/user`;
      method = 'PUT';
      headers.Authorization = `Bearer ${body.access_token}`;
      payload = {};
      if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) payload.data = body.data;
      if (typeof body.password === 'string' && body.password.length >= 8) payload.password = body.password;
      if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'Nessun dato valido da aggiornare.' });
      break;
    case 'recover':
      if (typeof body.email !== 'string') return res.status(400).json({ error: 'Email obbligatoria.' });
      url = `${baseUrl}/auth/v1/recover`;
      if (typeof body.redirectTo === 'string') url += `?redirect_to=${encodeURIComponent(body.redirectTo)}`;
      payload = { email: body.email };
      break;
    case 'logout':
      if (typeof body.access_token !== 'string') return res.status(401).json({ error: 'Sessione non valida.' });
      url = `${baseUrl}/auth/v1/logout`;
      headers.Authorization = `Bearer ${body.access_token}`;
      break;
    default:
      return res.status(400).json({ error: 'Operazione non supportata.' });
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      ...(method === 'GET' || action === 'logout' ? {} : { body: JSON.stringify(payload) })
    });
    const raw = await response.text();
    let result: unknown = null;
    try { result = raw ? JSON.parse(raw) : null; } catch { result = null; }
    if (!response.ok) return res.status(response.status).json({ error: errorMessage(result) });
    return res.status(response.status === 204 ? 200 : response.status).json(result ?? { success: true });
  } catch {
    return res.status(502).json({ error: 'Servizio di autenticazione temporaneamente non disponibile.' });
  }
}
