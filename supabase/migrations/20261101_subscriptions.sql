-- FaiDaTeCasa: authoritative subscription state, written only by trusted server/webhooks.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text check (provider in ('stripe', 'paypal')),
  provider_customer_id text,
  provider_subscription_id text unique,
  plan text not null default 'base' check (plan in ('base', 'premium')),
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  price_amount integer,
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_created_at_idx
  on public.subscriptions (user_id, created_at desc);

alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from anon, authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;

create or replace function public.set_subscriptions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_subscriptions_updated_at();
