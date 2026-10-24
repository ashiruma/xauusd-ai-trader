-- ==============================================================================
-- SQL MIGRATION: Add is_funded column to public.profiles
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

alter table public.profiles add column if not exists is_funded boolean not null default false;

-- Admins are automatically verified and funded
update public.profiles
set is_funded = true
where is_admin = true;
