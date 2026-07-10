-- One-off operator action for Friday, July 10, 2026: enter the six PY-STEM
-- Crank Championship results (code CRANK, graded out of 300) into the live
-- scores collection. This is a deliberate exception to the usual rule that
-- generated SQL never touches participant collections: it edits ONLY the
-- 'scores' collection, looks up each team id by its live team name, replaces
-- any existing CRANK entries (safe to re-run), and aborts loudly if any of the
-- six team names fails to match exactly one live team. Run it in the Supabase
-- SQL editor or: psql "$DATABASE_URL" -f supabase/enter_crank_scores.sql
do $$
declare
  new_entries jsonb;
  missing text;
begin
  with team_rows as (
    select e
    from public.collections c, jsonb_array_elements(c.data) e
    where c.name = 'teams'
  ),
  wanted(team_name, pts) as (
    values
      ('Dropouts', 222),
      ('No Names', 250),
      ('Magenta Banana', 246),
      ('Dehydrated Water', 252),
      ('The Little Dogs', 215),
      ('Kale', 274)
  ),
  matched as (
    select w.team_name, w.pts, t.e ->> 'id' as team_id
    from wanted w
    left join team_rows t
      on lower(trim(t.e ->> 'name')) = lower(trim(w.team_name))
  )
  select
    jsonb_agg(jsonb_build_object('teamId', team_id, 'code', 'CRANK', 'points', pts)),
    string_agg(team_name, ', ') filter (where team_id is null)
  into new_entries, missing
  from matched;

  if missing is not null then
    raise exception 'No live team matches these names: %. Fix the names and re-run.', missing;
  end if;
  if jsonb_array_length(new_entries) <> 6 then
    raise exception 'Expected exactly 6 entries but built %. A team name matched more than one live team; resolve the duplicate and re-run.', jsonb_array_length(new_entries);
  end if;

  update public.collections
  set data = coalesce(
      (select jsonb_agg(e)
       from jsonb_array_elements(data) e
       where upper(coalesce(e ->> 'code', '')) <> 'CRANK'),
      '[]'::jsonb
    ) || new_entries
  where name = 'scores';

  raise notice 'Entered 6 CRANK scores (existing CRANK entries, if any, were replaced).';
end $$;
