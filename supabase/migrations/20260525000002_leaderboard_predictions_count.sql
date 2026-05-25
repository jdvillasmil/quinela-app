-- Migration 20260525000002: add predictions_count to get_leaderboard()
-- Counts group-phase predictions per user so the leaderboard can show X/72 picks.
-- SECURITY DEFINER bypasses RLS on predictions (users can only see their own rows).

create or replace function public.get_leaderboard()
returns table (
  user_id           uuid,
  username          text,
  first_name        text,
  last_name         text,
  avatar_url        text,
  total_points      bigint,
  group_points      bigint,
  knockout_points   bigint,
  special_points    bigint,
  rank              bigint,
  predictions_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  with
    match_pts as (
      select
        p.user_id,
        coalesce(sum(p.points_earned) filter (where m.phase = 'groups'),  0) as grp_match,
        coalesce(sum(p.points_earned) filter (where m.phase <> 'groups'), 0) as ko_match
      from predictions p
      join matches m on m.id = p.match_id
      group by p.user_id
    ),

    grp_standing_pts as (
      select user_id, coalesce(sum(points_earned), 0) as pts
      from group_predictions
      group by user_id
    ),

    bracket_pts as (
      select user_id, coalesce(sum(points_earned), 0) as pts
      from bracket_predictions
      group by user_id
    ),

    special_pts as (
      select user_id, coalesce(points_earned, 0) as pts
      from special_predictions
    ),

    pred_cnt as (
      select p.user_id, count(*) as cnt
      from predictions p
      join matches m on m.id = p.match_id
      where m.phase = 'groups'
      group by p.user_id
    ),

    totals as (
      select
        pr.id                                                                as user_id,
        pr.username,
        pr.first_name,
        pr.last_name,
        pr.avatar_url,
        coalesce(mp.grp_match, 0) + coalesce(gsp.pts, 0)                   as group_points,
        coalesce(mp.ko_match,  0) + coalesce(bp.pts,  0)                   as knockout_points,
        coalesce(sp.pts, 0)                                                 as special_points,
        coalesce(pc.cnt, 0)                                                 as predictions_count
      from profiles pr
      left join match_pts        mp  on mp.user_id  = pr.id
      left join grp_standing_pts gsp on gsp.user_id = pr.id
      left join bracket_pts      bp  on bp.user_id  = pr.id
      left join special_pts      sp  on sp.user_id  = pr.id
      left join pred_cnt         pc  on pc.user_id  = pr.id
      where pr.role = 'user'
    )

  select
    user_id,
    username,
    first_name,
    last_name,
    avatar_url,
    (group_points + knockout_points + special_points)::bigint as total_points,
    group_points::bigint,
    knockout_points::bigint,
    special_points::bigint,
    rank() over (
      order by (group_points + knockout_points + special_points) desc
    )::bigint as rank,
    predictions_count::bigint
  from totals
  order by total_points desc, username asc;
$$;

-- Refresh the convenience view
create or replace view public.leaderboard as
  select * from public.get_leaderboard();

grant execute on function public.get_leaderboard() to authenticated;
grant select on public.leaderboard to authenticated;
