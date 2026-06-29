-- ============================================================
-- Migration 20260629000001: bracket_predictions score columns
--
-- Adds predicted_home / predicted_away so knockout predictions
-- work exactly like group predictions (score inputs instead of
-- picking a winner). predicted_winner is kept for existing rows
-- but is no longer used for scoring or required on new inserts.
--
-- RLS is updated from the old global window (no knockout match
-- non-scheduled) to a per-match time-gate (same pattern as the
-- predictions table): insert/update is allowed as long as the
-- specific match is scheduled AND its kickoff is in the future.
-- ============================================================

-- ── Schema changes ────────────────────────────────────────────────────────────

alter table public.bracket_predictions
  add column if not exists predicted_home int,
  add column if not exists predicted_away int;

-- Allow null so rows inserted via the new score-based UI don't need to
-- provide predicted_winner (old rows keep their existing non-null value).
alter table public.bracket_predictions
  alter column predicted_winner drop not null;

-- ── RLS: drop old window-based policies ──────────────────────────────────────

drop policy if exists "bracket_predictions: users can insert own"
  on public.bracket_predictions;

drop policy if exists "bracket_predictions: users can update own"
  on public.bracket_predictions;

-- ── RLS: new per-match kickoff-gated policies ─────────────────────────────────

create policy "bracket_predictions: users can insert own (before kickoff)"
  on public.bracket_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id     = match_id
        and phase <> 'groups'
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
        and phase <> 'groups'
        and status  = 'scheduled'
        and match_date > now()
    )
  );
