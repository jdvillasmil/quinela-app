-- ============================================================
-- Migration 0004: group_predictions table
-- Stores the predicted 1st and 2nd place finisher per group.
--
-- Lock mechanism: blocked once ANY match in that specific group
-- is no longer 'scheduled' (the group phase has started).
-- ============================================================

create table if not exists public.group_predictions (
  id            serial primary key,
  user_id       uuid not null references public.profiles(id)  on delete cascade,
  group_name    text not null check (group_name in ('A','B','C','D','E','F','G','H','I','J','K','L')),
  first_place   text not null,
  second_place  text not null,
  points_earned int  not null default 0,
  unique (user_id, group_name),
  constraint different_places check (first_place <> second_place)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists group_predictions_user_id_idx
  on public.group_predictions (user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.group_predictions enable row level security;

create policy "group_predictions: users read own / admins read all"
  on public.group_predictions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Lock: group starts when any of its matches is no longer 'scheduled'
create policy "group_predictions: users can insert own (group not started)"
  on public.group_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.matches m
      where m.group_name = group_name   -- group_name = new row's column
        and m.status <> 'scheduled'
    )
  );

create policy "group_predictions: users can update own (group not started)"
  on public.group_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.matches m
      where m.group_name = group_name
        and m.status <> 'scheduled'
    )
  );

create policy "group_predictions: admins can update all"
  on public.group_predictions for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── Grants ───────────────────────────────────────────────────────────────────

grant select, insert, update on public.group_predictions to authenticated;
grant usage on sequence public.group_predictions_id_seq to authenticated;
