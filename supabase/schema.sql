-- STEM Camp Field Notebook: Supabase schema and Row Level Security.
--
-- One row per data collection, the whole collection stored as a JSONB blob. This
-- mirrors the bundled src/data/*.json model exactly, so the app's per-collection
-- editor and schema validation are unchanged. Public read; allowlisted-admin
-- write.
--
-- Run this for a new project, or rerun it safely to refresh the trigger, grants,
-- RLS, and policies without replacing collection data. Then create the single
-- admin account (Authentication -> Users -> Add user), then run
-- supabase/harden_admin.sql after replacing its email placeholder. Also disable
-- open sign-ups. Seeding is optional: the public site renders from the bundled
-- seed, and the admin console creates each row on its first Save.

create table if not exists public.collections (
  name        text primary key,
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

-- Explicit allowlist for write access. Authenticated users can see only whether
-- their own user id is listed; they cannot add or edit allowlist rows.
create table if not exists public.admin_users (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  added_at  timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "admin users read own row" on public.admin_users;
create policy "admin users read own row"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

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

-- RLS does not apply to every table privilege (notably TRUNCATE). Start from a
-- least-privilege grant set instead of relying on project-wide default grants.
revoke all on table public.collections from anon, authenticated;
grant select on table public.collections to anon, authenticated;
grant insert, update on table public.collections to authenticated;

-- Allow public reads because the leaderboard, schedule, teams, and achievements are meant to be visible without signing in.
-- Allow anon and authenticated clients to SELECT every row.
drop policy if exists "collections public read" on public.collections;
create policy "collections public read"
  on public.collections
  for select
  to anon, authenticated
  using (true);

-- Allow writes only when the signed-in user's stable auth id is allowlisted.
drop policy if exists "collections auth insert" on public.collections;
create policy "collections auth insert"
  on public.collections
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_users
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "collections auth update" on public.collections;
drop policy if exists "collections admin write" on public.collections;
create policy "collections auth update"
  on public.collections
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where user_id = (select auth.uid())
    )
  );
