-- ============================================================
-- Migration 0007: leaderboard
--
-- Built as a SECURITY DEFINER function so it can aggregate
-- points across ALL users without violating the per-user RLS
-- policies on the prediction tables. A convenience view wraps
-- the function so the client can use `supabase.from('leaderboard')`.
--
-- Point categories:
--   group_points    = predictions (group matches) + group_predictions
--   knockout_points = predictions (knockout matches) + bracket_predictions
--   special_points  = special_predictions
-- ============================================================

create or replace function public.get_leaderboard()
returns table (
  user_id         uuid,
  username        text,
  first_name      text,
  last_name       text,
  avatar_url      text,
  total_points    bigint,
  group_points    bigint,
  knockout_points bigint,
  special_points  bigint,
  rank            bigint
)
language sql
security definer
stable
set search_path = public
as $$
  with
    -- Points from individual match score predictions, split by phase
    match_pts as (
      select
        p.user_id,
        coalesce(sum(p.points_earned) filter (where m.phase = 'groups'),  0) as grp_match,
        coalesce(sum(p.points_earned) filter (where m.phase <> 'groups'), 0) as ko_match
      from predictions p
      join matches m on m.id = p.match_id
      group by p.user_id
    ),

    -- Points from 1st / 2nd place group standings
    grp_standing_pts as (
      select user_id, coalesce(sum(points_earned), 0) as pts
      from group_predictions
      group by user_id
    ),

    -- Points from knockout bracket winner predictions
    bracket_pts as (
      select user_id, coalesce(sum(points_earned), 0) as pts
      from bracket_predictions
      group by user_id
    ),

    -- Points from special (end-of-tournament) predictions
    special_pts as (
      select user_id, coalesce(points_earned, 0) as pts
      from special_predictions
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
        coalesce(sp.pts, 0)                                                 as special_points
      from profiles pr
      left join match_pts        mp  on mp.user_id  = pr.id
      left join grp_standing_pts gsp on gsp.user_id = pr.id
      left join bracket_pts      bp  on bp.user_id  = pr.id
      left join special_pts      sp  on sp.user_id  = pr.id
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
    )::bigint as rank
  from totals
  order by total_points desc, username asc;
$$;

-- Convenience view so the client can use supabase.from('leaderboard').select(...)
create or replace view public.leaderboard as
  select * from public.get_leaderboard();

-- ── Grants ───────────────────────────────────────────────────────────────────

grant execute on function public.get_leaderboard() to authenticated;
grant select on public.leaderboard to authenticated;
