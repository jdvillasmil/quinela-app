-- ============================================================
-- Migration 0006: bracket_predictions table
-- Stores the predicted winner for each knockout-phase match.
--
-- Window: opens after group phase ends, closes before the
-- first R16 match goes 'live'. The RLS INSERT policy enforces
-- this by blocking inserts once any knockout match is non-scheduled.
-- ============================================================

create table if not exists public.bracket_predictions (
  id               serial primary key,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  match_id         int  not null references public.matches(id)  on delete cascade,
  predicted_winner text not null,
  points_earned    int  not null default 0,
  unique (user_id, match_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists bracket_predictions_user_id_idx
  on public.bracket_predictions (user_id);
create index if not exists bracket_predictions_match_id_idx
  on public.bracket_predictions (match_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.bracket_predictions enable row level security;

create policy "bracket_predictions: users read own / admins read all"
  on public.bracket_predictions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "bracket_predictions: users can insert own"
  on public.bracket_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    -- only for knockout rounds
    and exists (
      select 1 from public.matches
      where id = match_id and phase <> 'groups'
    )
    -- window is open: no knockout match has started yet
    and not exists (
      select 1 from public.matches
      where phase <> 'groups' and status <> 'scheduled'
    )
  );

create policy "bracket_predictions: users can update own"
  on public.bracket_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.matches
      where phase <> 'groups' and status <> 'scheduled'
    )
  );

create policy "bracket_predictions: admins can update all"
  on public.bracket_predictions for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── Grants ───────────────────────────────────────────────────────────────────

grant select, insert, update on public.bracket_predictions to authenticated;
grant usage on sequence public.bracket_predictions_id_seq to authenticated;
