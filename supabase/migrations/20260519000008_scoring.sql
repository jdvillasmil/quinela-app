-- ============================================================
-- Migration 0008: scoring function
--
-- calculate_match_points(match_id) is called by the CRON job
-- (via service-role key, bypassing RLS) once a match finishes.
-- It computes and persists points_earned for every prediction
-- row related to that match.
--
-- Scoring rules per CLAUDE.md:
--
--   Groups (predictions table):
--     +1  correct 1X2 sign
--     +1  correct goal difference (requires correct sign)
--     +3  exact scoreline
--
--   Knockouts (bracket_predictions table):
--     r16    correct winner +2  / exact score (predictions) +4
--     qf     correct winner +3  / exact score +6
--     sf     correct winner +5  / exact score +10
--     third  correct winner +5
--     final  champion +15 / runner-up +8 (predicted finalist who lost)
--
--   Note on penalty shootouts: when home_score = away_score after
--   extra time, set matches.knockout_winner to the actual winning
--   team before calling this function. The function uses that column
--   as the authoritative winner for knockout bracket scoring.
-- ============================================================

-- Add knockout_winner to matches (nullable; set by CRON or admin for pen. shootouts)
alter table public.matches
  add column if not exists knockout_winner text;

-- ── Main scoring function ─────────────────────────────────────────────────────

create or replace function public.calculate_match_points(p_match_id int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match        matches%rowtype;
  v_sign_actual  text;   -- 'home' | 'draw' | 'away'
  v_diff_actual  int;    -- home_score - away_score
  v_winner       text;   -- authoritative winner team name (knockouts)
  v_loser        text;
  v_pts_winner   int;
  v_pts_exact    int;
begin
  select * into v_match from public.matches where id = p_match_id;

  if not found then
    raise exception 'Match % not found', p_match_id;
  end if;

  if v_match.status <> 'finished'
     or v_match.home_score is null
     or v_match.away_score is null
  then
    return;  -- nothing to score yet
  end if;

  -- ── Group-phase: score predictions ────────────────────────────────────────
  if v_match.phase = 'groups' then

    v_sign_actual := case
      when v_match.home_score > v_match.away_score then 'home'
      when v_match.home_score = v_match.away_score then 'draw'
      else 'away'
    end;
    v_diff_actual := v_match.home_score - v_match.away_score;

    update public.predictions
    set points_earned = (
      -- +1 correct 1X2 sign
      case when
        (predicted_home > predicted_away and v_sign_actual = 'home') or
        (predicted_home = predicted_away and v_sign_actual = 'draw') or
        (predicted_home < predicted_away and v_sign_actual = 'away')
      then 1 else 0 end
      +
      -- +1 correct goal difference (only when sign is also correct)
      case when
        (predicted_home > predicted_away and v_sign_actual = 'home') or
        (predicted_home = predicted_away and v_sign_actual = 'draw') or
        (predicted_home < predicted_away and v_sign_actual = 'away')
      then case when (predicted_home - predicted_away) = v_diff_actual
           then 1 else 0 end
      else 0 end
      +
      -- +3 exact scoreline
      case when predicted_home = v_match.home_score
            and predicted_away = v_match.away_score
      then 3 else 0 end
    )
    where match_id = p_match_id;

  -- ── Knockout-phase: score predictions (exact scoreline bonus) ─────────────
  else

    v_pts_exact := case v_match.phase
      when 'r16' then 4
      when 'qf'  then 6
      when 'sf'  then 10
      else 0  -- 'third' and 'final' have no exact-score bonus
    end;

    if v_pts_exact > 0 then
      update public.predictions
      set points_earned = case
        when predicted_home = v_match.home_score
         and predicted_away = v_match.away_score
        then v_pts_exact
        else 0
      end
      where match_id = p_match_id;
    end if;

    -- ── Knockout-phase: bracket winner predictions ─────────────────────────

    -- Resolve actual winner: use knockout_winner if set (penalty shootout),
    -- otherwise derive from scores.
    v_winner := coalesce(
      v_match.knockout_winner,
      case
        when v_match.home_score > v_match.away_score then v_match.home_team
        when v_match.away_score > v_match.home_score then v_match.away_team
        else null  -- true tie: admin must set knockout_winner manually
      end
    );

    if v_winner is null then
      return;  -- cannot score bracket without a winner
    end if;

    v_loser := case
      when v_winner = v_match.home_team then v_match.away_team
      else v_match.home_team
    end;

    v_pts_winner := case v_match.phase
      when 'r16'   then 2
      when 'qf'    then 3
      when 'sf'    then 5
      when 'third' then 5
      when 'final' then 15
      else 0
    end;

    update public.bracket_predictions
    set points_earned = case
      when predicted_winner = v_winner then v_pts_winner
      when predicted_winner = v_loser
       and v_match.phase = 'final'     then 8  -- runner-up bonus
      else 0
    end
    where match_id = p_match_id;

  end if;
end;
$$;

-- ── Group standings scoring ───────────────────────────────────────────────────
-- Called once the group phase is fully complete (all 48 matches finished).
-- Looks up the actual 1st/2nd place teams per group and awards points.
-- The application (admin panel) calls this after the last group match finishes.

create or replace function public.calculate_group_standing_points(p_group_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_standings record;
  v_first  text;
  v_second text;
begin
  -- Derive standings from goals scored / wins in group matches
  -- Simple ranking: wins (3pts), draws (1pt), losses (0pts); goals as tiebreaker
  select
    team,
    sum(pts)  as total_pts,
    sum(gf)   as goals_for,
    sum(gf) - sum(ga) as goal_diff
  into v_standings
  from (
    -- Home team row
    select
      home_team                                  as team,
      case when home_score > away_score then 3
           when home_score = away_score then 1
           else 0 end                            as pts,
      home_score                                 as gf,
      away_score                                 as ga
    from public.matches
    where group_name = p_group_name
      and status = 'finished'
      and home_score is not null
    union all
    -- Away team row
    select
      away_team,
      case when away_score > home_score then 3
           when away_score = home_score then 1
           else 0 end,
      away_score,
      home_score
    from public.matches
    where group_name = p_group_name
      and status = 'finished'
      and away_score is not null
  ) t
  group by team
  order by total_pts desc, goal_diff desc, goals_for desc
  limit 1;  -- just to confirm the query works; we need top 2

  -- Get actual 1st and 2nd place using a subquery
  select
    max(team) filter (where rn = 1),
    max(team) filter (where rn = 2)
  into v_first, v_second
  from (
    select team, row_number() over (
      order by total_pts desc, goal_diff desc, goals_for desc
    ) as rn
    from (
      select
        team,
        sum(pts)          as total_pts,
        sum(gf) - sum(ga) as goal_diff,
        sum(gf)           as goals_for
      from (
        select home_team as team,
          case when home_score > away_score then 3 when home_score = away_score then 1 else 0 end as pts,
          home_score as gf, away_score as ga
        from public.matches where group_name = p_group_name and status = 'finished'
        union all
        select away_team,
          case when away_score > home_score then 3 when away_score = home_score then 1 else 0 end,
          away_score, home_score
        from public.matches where group_name = p_group_name and status = 'finished'
      ) raw
      group by team
    ) ranked
  ) rowed;

  if v_first is null then return; end if;

  update public.group_predictions
  set points_earned =
    case when first_place = v_first   then 2
         when first_place = v_second  then 1
         else 0 end
    +
    case when second_place = v_second then 1
         else 0 end
  where group_name = p_group_name;
end;
$$;

-- ── Grants ───────────────────────────────────────────────────────────────────
-- These functions are called server-side via service-role key (bypasses RLS).
-- Grant execute to authenticated only if the admin panel needs to call them via
-- the anon/auth key (not recommended — prefer server-side triggers or edge functions).

grant execute on function public.calculate_match_points(int)           to authenticated;
grant execute on function public.calculate_group_standing_points(text) to authenticated;
