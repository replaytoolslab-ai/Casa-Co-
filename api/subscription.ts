import type { Request, Response } from 'express';

function env(name: string): string {
  const value = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value.replace(/\/$/, '');
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) return res.status(401).json({ error: 'Accesso non autorizzato.' });
    const token = authorization.slice(7).trim();
    if (!token || token.length > 8192) return res.status(401).json({ error: 'Accesso non autorizzato.' });

    const base = env('SUPABASE_URL');
    const anonKey = env('SUPABASE_ANON_KEY');
    const authResponse = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` }
    });
    if (!authResponse.ok) return res.status(401).json({ error: 'Sessione non valida.' });
    const user = await authResponse.json() as { id?: string };
    if (!user.id) return res.status(401).json({ error: 'Sessione non valida.' });

    const query = new URLSearchParams({
      user_id: `eq.${user.id}`,
      select: 'plan,status,provider,current_period_end,cancel_at_period_end,price_amount,currency',
      order: 'created_at.desc',
      limit: '1'
    });
    const response = await fetch(`${base}/rest/v1/subscriptions?${query}`, {
      headers: { apikey: env('SUPABASE_SERVICE_ROLE_KEY'), Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}` }
    });
    if (!response.ok) return res.status(502).json({ error: 'Impossibile leggere lo stato dell’abbonamento.' });
    const rows = await response.json() as Record<string, unknown>[];
    const row = rows[0];
    if (!row) return res.status(200).json({ subscription: null });
    return res.status(200).json({ subscription: row });
  } catch {
    return res.status(500).json({ error: 'Servizio abbonamenti temporaneamente non disponibile.' });
  }
}
