-- ============================================================
-- Migration 0002: matches table
-- ============================================================

create table if not exists public.matches (
  id           serial primary key,
  match_number int  not null unique,
  phase        text not null check (phase in ('groups', 'r16', 'qf', 'sf', 'third', 'final')),
  group_name   text check (group_name in ('A','B','C','D','E','F','G','H','I','J','K','L')),
  home_team    text not null,
  away_team    text not null,
  home_flag    text,
  away_flag    text,
  match_date   timestamptz not null,
  venue        text,
  home_score   int  check (home_score >= 0),
  away_score   int  check (away_score >= 0),
  status       text not null default 'scheduled'
               check (status in ('scheduled', 'live', 'finished')),
  api_match_id text,

  -- group matches must specify a group
  constraint group_match_needs_group
    check (phase != 'groups' or group_name is not null)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists matches_phase_idx    on public.matches (phase);
create index if not exists matches_status_idx   on public.matches (status);
create index if not exists matches_date_idx     on public.matches (match_date);
create index if not exists matches_group_idx    on public.matches (group_name) where group_name is not null;

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.matches enable row level security;

-- Everyone can read the fixture
create policy "matches: authenticated read all"
  on public.matches for select
  to authenticated
  using (true);

-- Only admins can create/edit/delete matches (also covers the API-Football sync path
-- which uses the service role key and bypasses RLS entirely)
create policy "matches: admins can insert"
  on public.matches for insert
  to authenticated
  with check (public.is_admin());

create policy "matches: admins can update"
  on public.matches for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

create policy "matches: admins can delete"
  on public.matches for delete
  to authenticated
  using (public.is_admin());

-- ── Grants ───────────────────────────────────────────────────────────────────

grant select, insert, update, delete on public.matches to authenticated;
grant usage on sequence public.matches_id_seq to authenticated;
