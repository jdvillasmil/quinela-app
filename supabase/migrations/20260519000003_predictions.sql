-- ============================================================
-- Migration 0003: predictions table (group-phase match scores)
--
-- Lock mechanism: INSERT and UPDATE are blocked by RLS when the
-- target match is no longer 'scheduled' (i.e., 'live' or 'finished').
-- The CRON job changes match status → the DB enforces the deadline
-- automatically without any date-checking logic in application code.
-- ============================================================

create table if not exists public.predictions (
  id             serial primary key,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  match_id       int  not null references public.matches(id)  on delete cascade,
  predicted_home int  not null check (predicted_home >= 0),
  predicted_away int  not null check (predicted_away >= 0),
  points_earned  int  not null default 0,
  created_at     timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists predictions_user_id_idx  on public.predictions (user_id);
create index if not exists predictions_match_id_idx on public.predictions (match_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.predictions enable row level security;

-- Users see only their own predictions; admins see all
create policy "predictions: users read own / admins read all"
  on public.predictions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Users can only predict matches that haven't started yet
create policy "predictions: users can insert own (match scheduled)"
  on public.predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id = match_id and status = 'scheduled'
    )
  );

-- Same lock for updates
create policy "predictions: users can update own (match scheduled)"
  on public.predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches
      where id = match_id and status = 'scheduled'
    )
  );

-- Admins (and the scoring function via service-role key) can write points_earned
create policy "predictions: admins can update all"
  on public.predictions for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── Grants ───────────────────────────────────────────────────────────────────

grant select, insert, update on public.predictions to authenticated;
grant usage on sequence public.predictions_id_seq to authenticated;
