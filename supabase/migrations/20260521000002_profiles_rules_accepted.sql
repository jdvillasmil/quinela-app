-- Migration 20260521000002: add rules_accepted_at to profiles
-- Tracks when the user first acknowledged the quiniela rules.
-- NULL means the user has not yet accepted; show the mandatory rules modal.

alter table public.profiles
  add column if not exists rules_accepted_at timestamptz;
