import { AuthSession } from './authService';

export interface SubscriptionInfo {
  plan: 'base' | 'premium';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'incomplete';
  provider: 'stripe' | 'paypal' | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_amount: number | null;
  currency: string | null;
}

export const subscriptionService = {
  async checkout(session: AuthSession, interval: 'month' | 'year'): Promise<void> {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ interval })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) throw new Error(payload.error || 'Impossibile avviare il pagamento.');
    window.location.assign(payload.url);
  },
  async get(session: AuthSession): Promise<SubscriptionInfo | null> {
    const response = await fetch('/api/subscription', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store'
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Impossibile caricare l’abbonamento.');
    return payload.subscription as SubscriptionInfo | null;
  }
};
