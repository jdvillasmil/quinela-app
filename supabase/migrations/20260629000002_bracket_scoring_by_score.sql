-- ============================================================
-- Migration 20260629000002: knockout scoring by scoreline
--
-- Replaces the predicted_winner-based knockout scoring with the
-- same +1/+1/+3 logic used for group predictions:
--   +1  correct 1X2 sign
--   +1  correct goal difference (only when sign is correct)
--   +3  exact scoreline
--
-- Points go to bracket_predictions.points_earned using
-- predicted_home / predicted_away (added in migration 20260629000001).
-- Rows without scores (predicted_home IS NULL) score 0.
--
-- The old exact-score bonus that was applied to the predictions
-- table for knockout matches is also removed — knockout matches
-- are now scored exclusively via bracket_predictions.
-- ============================================================

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
begin
  select * into v_match from public.matches where id = p_match_id;

  if not found then
    raise exception 'Match % not found', p_match_id;
  end if;

  if v_match.status <> 'finished'
     or v_match.home_score is null
     or v_match.away_score is null
  then
    return;
  end if;

  v_sign_actual := case
    when v_match.home_score > v_match.away_score then 'home'
    when v_match.home_score = v_match.away_score then 'draw'
    else 'away'
  end;
  v_diff_actual := v_match.home_score - v_match.away_score;

  -- ── Group-phase: score predictions ────────────────────────────────────────
  if v_match.phase = 'groups' then

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

  -- ── Knockout-phase: score bracket_predictions by scoreline ────────────────
  else

    update public.bracket_predictions
    set points_earned = (
      case when predicted_home is null or predicted_away is null then 0
      else
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
      end
    )
    where match_id = p_match_id;

  end if;
end;
$$;

grant execute on function public.calculate_match_points(int) to authenticated;
