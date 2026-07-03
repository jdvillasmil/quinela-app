-- ============================================================
-- Migration 20260703000001: scope bracket_predictions to r16 only
--
-- Only the r16 round is open for predictions right now (qf/sf/third/final
-- stay closed until their own windows open later). The previous policies
-- (migration 20260629000001) allowed any phase <> 'groups', so a direct API
-- call bypassing the UI could still insert/update predictions for qf, sf,
-- third or final. Scope the kickoff-gate check to phase = 'r16' so the DB
-- enforces the same restriction as the client's isMatchEditable().
-- ============================================================

drop policy if exists "bracket_predictions: users can insert own (before kickoff)"
  on public.bracket_predictions;

drop policy if exists "bracket_predictions: users can update own (before kickoff)"
  on public.bracket_predictions;

create policy "bracket_predictions: users can insert own (before kickoff)"
  on public.bracket_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id     = match_id
        and phase   = 'r16'
        and status  = 'scheduled'
        and match_date > now()
    )
  );

create policy "bracket_predictions: users can update own (before kickoff)"
  on public.bracket_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id     = match_id
        and phase   = 'r16'
        and status  = 'scheduled'
        and match_date > now()
    )
  );
