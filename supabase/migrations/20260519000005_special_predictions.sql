-- ============================================================
-- Migration 0005: special_predictions table
-- One row per user; all fields optional.
--
-- Lock mechanism: blocked once ANY match in the tournament
-- is no longer 'scheduled' (i.e., tournament has begun).
-- Admins can write points_earned at tournament end.
-- ============================================================

create table if not exists public.special_predictions (
  id                serial primary key,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  top_scorer        text,                        -- Bota de Oro
  best_player       text,                        -- Balón de Oro
  best_keeper       text,                        -- Guante de Oro
  total_goals       int  check (total_goals >= 0),
  most_red_cards    text,
  most_goals_match  text,                        -- e.g. "Argentina 4-1 Francia"
  fastest_goal_team text,
  points_earned     int  not null default 0,
  created_at        timestamptz not null default now(),
  unique (user_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists special_predictions_user_id_idx
  on public.special_predictions (user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.special_predictions enable row level security;

create policy "special_predictions: users read own / admins read all"
  on public.special_predictions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Locked once the first match of the tournament is no longer 'scheduled'
create policy "special_predictions: users can insert own (tournament not started)"
  on public.special_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not exists (select 1 from public.matches where status <> 'scheduled')
  );

create policy "special_predictions: users can update own (tournament not started)"
  on public.special_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and not exists (select 1 from public.matches where status <> 'scheduled')
  );

-- Admins resolve specials at end of tournament
create policy "special_predictions: admins can update all"
  on public.special_predictions for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── Grants ───────────────────────────────────────────────────────────────────

grant select, insert, update on public.special_predictions to authenticated;
grant usage on sequence public.special_predictions_id_seq to authenticated;
