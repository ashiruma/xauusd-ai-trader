-- Run once after 001_profiles.sql: Supabase Dashboard, SQL Editor.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Create profile rows for accounts that signed up before the table existed.
insert into public.profiles (id, email, justmarkets_email)
select id, email, raw_user_meta_data ->> 'justmarkets_email' from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated using (public.is_admin());

create or replace function public.admin_set_status(target uuid, new_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if new_status not in ('pending', 'approved', 'rejected') then raise exception 'bad status'; end if;
  update public.profiles set status = new_status where id = target;
end;
$$;
revoke all on function public.admin_set_status(uuid, text) from public, anon;
grant execute on function public.admin_set_status(uuid, text) to authenticated;

-- Make yourself the first admin. Run this line once with your email:
-- update public.profiles set is_admin = true, status = 'approved' where email = 'you@example.com';
