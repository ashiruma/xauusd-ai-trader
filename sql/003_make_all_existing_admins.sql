-- ==============================================================================
-- SQL MIGRATION: Make all currently existing registered accounts approved admins
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure any accounts in auth.users are inserted into public.profiles
insert into public.profiles (id, email, justmarkets_email, status, is_admin)
select id, email, raw_user_meta_data ->> 'justmarkets_email', 'approved', true
from auth.users
on conflict (id) do update set
  is_admin = true,
  status = 'approved';

-- 2. Update all existing profile records to approved and is_admin = true
update public.profiles
set is_admin = true,
    status = 'approved';
