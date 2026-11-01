import type { Request, Response } from 'express';

function env(name: string): string {
  const value = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value.replace(/\/$/, '');
}

async function authenticate(req: Request): Promise<{ id: string; email?: string } | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return null;
  const response = await fetch(`${env('SUPABASE_URL')}/auth/v1/user`, {
    headers: { apikey: env('SUPABASE_ANON_KEY'), Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string; email?: string };
  return user.id ? { id: user.id, email: user.email } : null;
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  try {
    const user = await authenticate(req);
    if (!user) return res.status(401).json({ error: 'Accedi al tuo account per continuare.' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const interval = body?.interval;
    if (interval !== 'month' && interval !== 'year') {
      return res.status(400).json({ error: 'Piano non valido.' });
    }

    const priceId = env(interval === 'month' ? 'STRIPE_PRICE_MONTHLY' : 'STRIPE_PRICE_YEARLY');
    const appUrl = env('APP_URL');
    const success = new URL('/?subscription=success', appUrl).toString();
    const cancel = new URL('/?subscription=cancel', appUrl).toString();
    const form = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      customer_email: user.email || '',
      client_reference_id: user.id,
      'metadata[user_id]': user.id,
      'metadata[plan]': 'premium',
      'metadata[interval]': interval,
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][plan]': 'premium',
      success_url: success,
      cancel_url: cancel,
      allow_promotion_codes: 'true'
    });
    if (!user.email) form.delete('customer_email');

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    });
    const payload = await stripeResponse.json() as { url?: string; error?: { message?: string } };
    if (!stripeResponse.ok || !payload.url) {
      return res.status(502).json({ error: payload.error?.message || 'Impossibile avviare il pagamento.' });
    }
    return res.status(200).json({ url: payload.url });
  } catch {
    return res.status(500).json({ error: 'Pagamenti non ancora configurati. Riprova più tardi.' });
  }
}
