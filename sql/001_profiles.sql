-- Run once in the Velarion project: Supabase Dashboard, SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  justmarkets_email text,
  mt5_account_id text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Members may change only their MT5 account ID. They cannot change status.
revoke update on public.profiles from authenticated, anon;
grant update (mt5_account_id) on public.profiles to authenticated;
grant select on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, justmarkets_email)
  values (new.id, new.email, new.raw_user_meta_data ->> 'justmarkets_email')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Approve a member (run by you, in the SQL Editor):
-- update public.profiles set status = 'approved' where email = 'member@example.com';
