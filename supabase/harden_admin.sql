-- Restrict collection writes to one existing Supabase Auth user.
--
-- Before running: replace ADMIN_EMAIL@example.com below with the exact email of
-- the existing camp admin. The script refuses to change write policies when the
-- placeholder remains or when the email does not identify exactly one user.

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

do $$
declare
  target_email constant text := 'ADMIN_EMAIL@example.com';
  matches integer;
  target_user_id uuid;
begin
  if target_email = ('ADMIN_EMAIL' || '@example.com') then
    raise exception 'Replace ADMIN_EMAIL@example.com before running this script';
  end if;

  select count(*) into matches
  from auth.users
  where lower(email) = lower(target_email);

  if matches <> 1 then
    raise exception 'Expected exactly one auth user for %, found %', target_email, matches;
  end if;

  select id into target_user_id
  from auth.users
  where lower(email) = lower(target_email);

  -- Enforce the single-admin invariant on every run. Changing the configured
  -- email replaces the prior allowlist entry instead of silently retaining it.
  delete from public.admin_users where user_id <> target_user_id;
  insert into public.admin_users (user_id) values (target_user_id)
  on conflict (user_id) do nothing;
end
$$;

alter table public.collections enable row level security;
revoke all on table public.collections from anon, authenticated;
grant select on table public.collections to anon, authenticated;
grant insert, update on table public.collections to authenticated;

-- PostgreSQL combines permissive policies with OR. Remove every existing
-- write-capable policy so an older or manually added rule cannot remain as an
-- alternate authorization path, then install only the allowlist policies.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collections'
      and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
  loop
    execute format('drop policy %I on public.collections', existing_policy.policyname);
  end loop;
end
$$;

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
