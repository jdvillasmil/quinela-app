-- ============================================================
-- Migration 20260525000001: Fix RLS on group_predictions
--
-- Bug: the previous policies blocked INSERT/UPDATE on group_predictions
-- as soon as ANY single match in the group became 'finished'.
-- This fired during QA simulations and would affect real users the
-- moment the first group match ends (even though 5 more are pending).
--
-- Fix: allow writes until ALL 6 matches in the group are 'finished'.
-- The standings pick should only lock once the group phase is complete.
-- ============================================================

-- Drop the two policies that need to change
drop policy if exists "group_predictions: users can insert own (group not started)"
  on public.group_predictions;

drop policy if exists "group_predictions: users can update own (group not started)"
  on public.group_predictions;

-- Recreate INSERT policy: allow while fewer than 6 matches are finished
create policy "group_predictions: users can insert own (group not finished)"
  on public.group_predictions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      select count(*)
        from public.matches m
       where m.group_name = group_predictions.group_name
         and m.status = 'finished'
    ) < 6
  );

-- Recreate UPDATE policy: same condition
create policy "group_predictions: users can update own (group not finished)"
  on public.group_predictions for update
  to authenticated
  using  (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      select count(*)
        from public.matches m
       where m.group_name = group_predictions.group_name
         and m.status = 'finished'
    ) < 6
  );
