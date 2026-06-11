-- ============================================================
-- Migration 20260611000001: match_prediction_stats
--
-- SECURITY DEFINER so it can aggregate predictions across ALL
-- users regardless of the per-user RLS policy on the predictions
-- table. Returns the count of each (home, away) score combo
-- for a given list of match IDs, ordered by popularity.
-- ============================================================

create or replace function public.get_match_prediction_stats(p_match_ids int[])
returns table(
  match_id         int,
  predicted_home   int,
  predicted_away   int,
  prediction_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    match_id,
    predicted_home,
    predicted_away,
    count(*)::bigint as prediction_count
  from predictions
  where match_id = any(p_match_ids)
  group by match_id, predicted_home, predicted_away
  order by match_id, count(*) desc;
$$;

grant execute on function public.get_match_prediction_stats(int[]) to authenticated;
