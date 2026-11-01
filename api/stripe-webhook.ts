import type { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { api: { bodyParser: false } };

function env(name: string): string {
  const value = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value.replace(/\/$/, '');
}

async function rawBody(req: Request): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifySignature(body: Buffer, header: string, secret: string): boolean {
  const parts = header.split(',').map(part => part.split('=', 2));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(timestamp + '.' + body.toString('utf8')).digest();
  return signatures.some(signature => {
    if (!/^[a-f0-9]{64}$/i.test(signature || '')) return false;
    const supplied = Buffer.from(signature, 'hex');
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}

async function stripeGet(path: string) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}` }
  });
  if (!response.ok) throw new Error('Stripe API request failed');
  return response.json() as Promise<Record<string, any>>;
}

async function saveSubscription(subscriptionId: string, fallbackUserId?: string) {
  const sub = await stripeGet(`subscriptions/${encodeURIComponent(subscriptionId)}`);
  const userId = sub.metadata?.user_id || sub.metadata?.userId || fallbackUserId;
  if (!userId) throw new Error('Subscription missing user metadata');
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  const periodEnd = item?.current_period_end || sub.current_period_end;
  const amount = price?.unit_amount ?? null;
  const currency = price?.currency ?? null;
  const row = {
    user_id: userId,
    provider: 'stripe',
    provider_customer_id: customerId || null,
    provider_subscription_id: sub.id,
    plan: sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due' ? 'premium' : 'base',
    status: sub.status === 'unpaid' ? 'past_due' : sub.status === 'incomplete_expired' ? 'expired' : sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    price_amount: amount,
    currency
  };
  const base = env('SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(`${base}/rest/v1/subscriptions?on_conflict=provider_subscription_id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(row)
  });
  if (!response.ok) throw new Error('Could not persist subscription state');
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  try {
    const body = await rawBody(req);
    const signature = req.headers['stripe-signature'];
    if (typeof signature !== 'string' || !verifySignature(body, signature, env('STRIPE_WEBHOOK_SECRET'))) {
      return res.status(400).send('Invalid signature');
    }
    const event = JSON.parse(body.toString('utf8')) as { type: string; data: { object: Record<string, any> } };
    const object = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const id = typeof object.subscription === 'string' ? object.subscription : object.subscription?.id;
        if (id) await saveSubscription(id, object.client_reference_id || object.metadata?.user_id);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await saveSubscription(object.id);
        break;
      case 'invoice.payment_failed': {
        const id = typeof object.subscription === 'string' ? object.subscription : object.subscription?.id;
        if (id) await saveSubscription(id);
        break;
      }
    }
    return res.status(200).json({ received: true });
  } catch {
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
}
