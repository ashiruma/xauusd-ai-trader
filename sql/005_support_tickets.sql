-- Run in Supabase SQL editor to create the support tickets table
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  user_email text,
  account_id text,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

-- Users can view their own tickets
drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own" on public.support_tickets
  for select to authenticated using (auth.uid() = user_id);

-- Anyone authenticated or anon can submit a support ticket
drop policy if exists "support_tickets_insert_any" on public.support_tickets;
create policy "support_tickets_insert_any" on public.support_tickets
  for insert with check (true);

-- Admins can view and update all tickets
drop policy if exists "support_tickets_admin_all" on public.support_tickets;
create policy "support_tickets_admin_all" on public.support_tickets
  for all to authenticated using (
    coalesce((select is_admin from public.profiles where id = auth.uid()), false)
  );
