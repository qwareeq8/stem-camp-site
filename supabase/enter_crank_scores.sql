-- RETIRED: DO NOT RUN.
--
-- This one-off draft carried superseded Crank values. The final live 2026
-- scores row already contains the six later results under the legacy PYS-03
-- key. Appending this draft would preserve those rows and add a second, older
-- CRANK set. The website now handles that exact historical batch through a
-- read-only compatibility layer; no database write is required to restore it.
--
-- Any future canonical-key migration must start from a fresh authenticated
-- export, preserve the current points, and use an explicit revision guard. This
-- retired file aborts before touching public.collections.
do $$
begin
  raise exception 'RETIRED: enter_crank_scores.sql has superseded values and performs no write.';
end $$;
