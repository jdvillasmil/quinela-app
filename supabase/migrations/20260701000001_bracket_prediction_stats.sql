-- ============================================================
-- Migration 20260701000001: bracket_prediction_stats
--
-- Same shape as get_match_prediction_stats (20260611000001) but
-- reads bracket_predictions instead of predictions, so the
-- bracket screen can show % of participants per scoreline on
-- locked R32 matches. SECURITY DEFINER to bypass per-user RLS.
-- ============================================================

create or replace function public.get_bracket_prediction_stats(p_match_ids int[])
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
  from bracket_predictions
  where match_id = any(p_match_ids)
    and predicted_home is not null
    and predicted_away is not null
  group by match_id, predicted_home, predicted_away
  order by match_id, count(*) desc;
$$;

grant execute on function public.get_bracket_prediction_stats(int[]) to authenticated;
