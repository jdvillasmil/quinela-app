-- ============================================================
-- Migration 20260611000003: lock group stage at tournament start
--
-- Rule (announced to participants): ALL group-stage score
-- predictions and the 1°/2° standings picks close at the start of
-- the tournament — 2026-06-11 19:00:00 UTC — not at each match's
-- individual kickoff.
--
--   predictions (phase = 'groups'):  locked from 19:00 UTC on 11 jun
--   predictions (knockout phases):   unchanged — locked at own kickoff
--   group_predictions:               locked from 19:00 UTC on 11 jun
--
-- SELECT policies are untouched: users can still view everything.
-- ============================================================

-- ── predictions ──────────────────────────────────────────────────────────────

drop policy if exists "predictions: users can insert own (before kickoff)"
  on public.predictions;

drop policy if exists "predictions: users can update own (before kickoff)"
  on public.predictions;

create policy "predictions: users can insert own (before lock)"
  on public.predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and case
              when m.phase = 'groups'
                then now() < timestamptz '2026-06-11 19:00:00+00'
              else m.match_date > now()
            end
    )
  );

create policy "predictions: users can update own (before lock)"
  on public.predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and case
              when m.phase = 'groups'
                then now() < timestamptz '2026-06-11 19:00:00+00'
              else m.match_date > now()
            end
    )
  );

-- ── group_predictions ────────────────────────────────────────────────────────

drop policy if exists "group_predictions: users can insert own (group not finished)"
  on public.group_predictions;

drop policy if exists "group_predictions: users can update own (group not finished)"
  on public.group_predictions;

create policy "group_predictions: users can insert own (before tournament start)"
  on public.group_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and now() < timestamptz '2026-06-11 19:00:00+00'
  );

create policy "group_predictions: users can update own (before tournament start)"
  on public.group_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and now() < timestamptz '2026-06-11 19:00:00+00'
  );
