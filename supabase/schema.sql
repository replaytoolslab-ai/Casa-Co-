-- FaiDaTeCasa: private project persistence (Supabase PostgreSQL)
-- Run this script in the Supabase SQL Editor for the project connected to Vercel.

create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_projects_user_updated_idx
  on public.user_projects (user_id, updated_at desc);

create or replace function public.set_user_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_projects_updated_at on public.user_projects;
create trigger user_projects_updated_at
before update on public.user_projects
for each row execute function public.set_user_projects_updated_at();

alter table public.user_projects enable row level security;

-- Browser clients receive no direct table grants in this first version.
-- All reads/writes go through /api/projects after server-side token validation.
revoke all on public.user_projects from anon, authenticated;
grant select, insert, update, delete on public.user_projects to service_role;
