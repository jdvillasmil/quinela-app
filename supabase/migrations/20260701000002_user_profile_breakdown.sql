-- ============================================================
-- Migration 20260701000002: user_profile_breakdown
--
-- SECURITY DEFINER: needs to read predictions/bracket_predictions
-- for other users only to compute the tournament average in
-- `comparison`. Everything else in this function is scoped to
-- p_user_id.
-- ============================================================

create or replace function public.get_user_profile_breakdown(p_user_id uuid)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  with
  -- Points by team: each scored match credits BOTH its home and away
  -- team equally with points_earned (decision: split, not 50/50).
  -- Placeholder team names (e.g. 'W147', 'L148') from unresolved
  -- knockout rounds are excluded — they aren't real teams yet.
  team_rows as (
    select m.home_team as team, p.points_earned as pts
      from predictions p join matches m on m.id = p.match_id
     where p.user_id = p_user_id
    union all
    select m.away_team, p.points_earned
      from predictions p join matches m on m.id = p.match_id
     where p.user_id = p_user_id
    union all
    select m.home_team, bp.points_earned
      from bracket_predictions bp join matches m on m.id = bp.match_id
     where bp.user_id = p_user_id
    union all
    select m.away_team, bp.points_earned
      from bracket_predictions bp join matches m on m.id = bp.match_id
     where bp.user_id = p_user_id
  ),
  team_points as (
    select team, sum(pts)::int as points
      from team_rows
     where team !~ '^[WL][0-9]+$'   -- drop unresolved bracket placeholders
     group by team
  ),

  -- Points by group: group-stage match predictions + 1st/2nd place picks
  group_points as (
    select group_name, sum(pts)::int as points
    from (
      select m.group_name, p.points_earned as pts
        from predictions p join matches m on m.id = p.match_id
       where p.user_id = p_user_id and m.phase = 'groups'
      union all
      select group_name, points_earned
        from group_predictions
       where user_id = p_user_id
    ) g
    group by group_name
  ),

  -- Accuracy: share of scored predictions that earned at least 1 pt
  -- (i.e. got the 1X2 sign right). Covers groups + knockout scorelines;
  -- excludes bracket rows with no score submitted (predicted_home null).
  accuracy as (
    select
      count(*)::int as predictions_made,
      count(*) filter (where pts > 0)::int as predictions_correct
    from (
      select points_earned as pts from predictions where user_id = p_user_id
      union all
      select points_earned from bracket_predictions
       where user_id = p_user_id and predicted_home is not null
    ) all_preds
  ),

  -- Comparison vs. tournament average — reuses the same totals as
  -- the leaderboard so the numbers can never drift apart.
  totals as (
    select user_id, total_points from get_leaderboard()
  ),
  comparison as (
    select
      (select total_points from totals where user_id = p_user_id) as user_total,
      (select avg(total_points) from totals)                      as avg_total
  )

  select jsonb_build_object(
    'team_points', coalesce(
      (select jsonb_agg(jsonb_build_object('team', team, 'points', points) order by points desc)
         from team_points),
      '[]'::jsonb
    ),
    'best_group', (
      select jsonb_build_object('group_name', group_name, 'points', points)
        from group_points order by points desc limit 1
    ),
    'worst_group', (
      select jsonb_build_object('group_name', group_name, 'points', points)
        from group_points order by points asc limit 1
    ),
    'accuracy', (
      select jsonb_build_object(
        'predictions_made', predictions_made,
        'predictions_correct', predictions_correct,
        'accuracy_pct', case when predictions_made > 0
          then round((predictions_correct::numeric / predictions_made) * 100, 1)
          else 0 end
      ) from accuracy
    ),
    'comparison', (
      select jsonb_build_object(
        'user_total', coalesce(user_total, 0),
        'avg_total',  round(coalesce(avg_total, 0), 1),
        'diff',       round(coalesce(user_total, 0) - coalesce(avg_total, 0), 1)
      ) from comparison
    )
  );
$$;

grant execute on function public.get_user_profile_breakdown(uuid) to authenticated;