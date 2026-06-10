-- STEM Camp Field Notebook: Supabase schema and Row Level Security.
--
-- One row per data collection, the whole collection stored as a JSONB blob. This
-- mirrors the bundled src/data/*.json model exactly, so the app's per-collection
-- editor and schema validation are unchanged. Public read; authenticated write.
--
-- Run this once in the Supabase SQL editor for your project. Then create the
-- single admin account (Authentication -> Users -> Add user) and disable open
-- sign-ups (Authentication -> Providers -> Email -> turn off "Enable sign ups"),
-- so the only account that can write is the camp admin. Seeding the rows is
-- optional: the public site renders from the bundled seed, and the admin
-- console creates each row on its first Save. supabase/seed.sql, if present,
-- pre-populates the rows from the current src/data JSON.

create table if not exists public.collections (
  name        text primary key,
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- Keep updated_at server-authoritative: the database stamps every insert and
-- update, so client clock skew never reaches the table.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists collections_touch on public.collections;
create trigger collections_touch
  before insert or update on public.collections
  for each row execute function public.touch_updated_at();

alter table public.collections enable row level security;

-- Allow public reads because the leaderboard, schedule, teams, and achievements are meant to be visible without signing in.
-- Allow anon and authenticated clients to SELECT every row.
drop policy if exists "collections public read" on public.collections;
create policy "collections public read"
  on public.collections
  for select
  to anon, authenticated
  using (true);

-- Allow authenticated writes only, so only a signed-in admin may insert or update rows.
--
-- IMPORTANT: this policy alone trusts every authenticated account. It is safe
-- only because the camp creates exactly one account and disables open
-- sign-ups (see the header). If sign-ups could ever be enabled, or more
-- accounts exist, switch to the email-restricted policy at the bottom of this
-- file, which pins writes to the single admin address.
drop policy if exists "collections auth insert" on public.collections;
create policy "collections auth insert"
  on public.collections
  for insert
  to authenticated
  with check (true);

drop policy if exists "collections auth update" on public.collections;
create policy "collections auth update"
  on public.collections
  for update
  to authenticated
  using (true)
  with check (true);

-- Recommended hardening: restrict writes to the one admin email so the gate
-- holds even if sign-ups are ever re-enabled or a second account appears.
-- Replace the two write policies above with the policy below (fill in the
-- real admin address). The app needs no change.
--
-- drop policy if exists "collections auth insert" on public.collections;
-- drop policy if exists "collections auth update" on public.collections;
-- create policy "collections admin write"
--   on public.collections
--   for all
--   to authenticated
--   using (auth.jwt() ->> 'email' = 'admin@example.com')
--   with check (auth.jwt() ->> 'email' = 'admin@example.com');
