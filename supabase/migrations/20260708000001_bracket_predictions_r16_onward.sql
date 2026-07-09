-- ============================================================
-- Migration 20260708000001: open bracket_predictions to r16 onward
--
-- Migration 20260703000001 scoped inserts/updates to phase = 'r16' only,
-- since qf/sf/third/final weren't open yet. Those rounds now have their own
-- kickoff windows, so widen the DB check to match the client's
-- isMatchEditable() (BracketClient.tsx): any of r16/qf/sf/final/third,
-- still scheduled, with kickoff in the future. r32 stays excluded — those
-- slots come from group standings, not this form.
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
        and phase   in ('r16', 'qf', 'sf', 'final', 'third')
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
        and phase   in ('r16', 'qf', 'sf', 'final', 'third')
        and status  = 'scheduled'
        and match_date > now()
    )
  );
