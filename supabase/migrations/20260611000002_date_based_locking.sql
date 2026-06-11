-- ============================================================
-- Migration 20260611000002: date-based prediction locking
--
-- Problem: every prediction lock depended exclusively on
-- matches.status, which is only advanced by the CRON job. If the
-- CRON fails (as it did on day 1), predictions remain editable
-- after kickoff.
--
-- Fix: RLS now also requires the kickoff time to be in the future,
-- so the deadline is enforced by the database clock regardless of
-- whether the CRON updated the status.
--
--   predictions:          locked per match at its own kickoff
--   special_predictions:  locked at the first kickoff of the
--                          tournament (min match_date), matching the
--                          announced rule "se bloquean el 11 de junio"
-- ============================================================

-- ── predictions ──────────────────────────────────────────────────────────────

drop policy if exists "predictions: users can insert own (match scheduled)"
  on public.predictions;

drop policy if exists "predictions: users can update own (match scheduled)"
  on public.predictions;

create policy "predictions: users can insert own (before kickoff)"
  on public.predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id = match_id
        and status = 'scheduled'
        and match_date > now()
    )
  );

create policy "predictions: users can update own (before kickoff)"
  on public.predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id = match_id
        and status = 'scheduled'
        and match_date > now()
    )
  );

-- ── special_predictions ──────────────────────────────────────────────────────

drop policy if exists "special_predictions: users can insert own (tournament not started)"
  on public.special_predictions;

drop policy if exists "special_predictions: users can update own (tournament not started)"
  on public.special_predictions;

create policy "special_predictions: users can insert own (before tournament)"
  on public.special_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.matches
      where status <> 'scheduled' or match_date <= now()
    )
  );

create policy "special_predictions: users can update own (before tournament)"
  on public.special_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.matches
      where status <> 'scheduled' or match_date <= now()
    )
  );
