-- ============================================================
-- Migration 0001: profiles table
-- Includes: table, is_admin() helper, auto-create trigger, RLS
-- ============================================================

-- ── Table ────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  username    text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  first_name  text not null,
  last_name   text not null,
  role        text not null default 'user' check (role in ('user', 'admin')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ── Helper: admin check ───────────────────────────────────────────────────────
-- security definer runs as the function owner (postgres), bypassing RLS —
-- this prevents infinite recursion when policies on profiles call is_admin().

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Trigger: auto-create profile on signup ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username   text;
  v_first_name text;
  v_last_name  text;
begin
  v_username := lower(coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    -- fallback: "user_" + first 8 hex chars of the UUID
    'user_' || left(replace(new.id::text, '-', ''), 8)
  ));

  v_first_name := coalesce(nullif(trim(new.raw_user_meta_data->>'first_name'), ''), '');
  v_last_name  := coalesce(nullif(trim(new.raw_user_meta_data->>'last_name'),  ''), '');

  insert into public.profiles (id, email, username, first_name, last_name)
  values (new.id, new.email, v_username, v_first_name, v_last_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- All authenticated users can read profiles (needed for leaderboard + username display)
create policy "profiles: authenticated read all"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can insert their own profile row (covers the /auth/callback upsert path)
create policy "profiles: users can insert own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Users can update their own non-sensitive fields; role column is frozen for self-updates
create policy "profiles: users can update own (no role escalation)"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- role must stay the same (prevents self-promotion)
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Admins can update any profile, including role changes
create policy "profiles: admins can update any"
  on public.profiles for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());

-- ── Grants ───────────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
