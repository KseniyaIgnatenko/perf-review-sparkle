-- Update existing goals with 'on_review' or 'approved' status to 'draft'
UPDATE public.goals 
SET status = 'draft' 
WHERE status IN ('on_review', 'approved');

-- Remove default value first
ALTER TABLE public.goals ALTER COLUMN status DROP DEFAULT;

-- Alter the column to use varchar temporarily
ALTER TABLE public.goals ALTER COLUMN status TYPE varchar(20);

-- Drop the old enum type with CASCADE
DROP TYPE IF EXISTS public.goal_status CASCADE;

-- Create the new enum type with only 'draft' and 'completed'
CREATE TYPE public.goal_status AS ENUM ('draft', 'completed');

-- Convert the column back to use the new enum type
ALTER TABLE public.goals ALTER COLUMN status TYPE public.goal_status USING status::public.goal_status;

-- Set default value again
ALTER TABLE public.goals ALTER COLUMN status SET DEFAULT 'draft'::goal_status;

-- Remove the trigger BEFORE removing the function
DROP TRIGGER IF EXISTS trg_restrict_non_owner_goal_updates ON public.goals;
DROP TRIGGER IF EXISTS restrict_goal_updates_trigger ON public.goals;

-- Now remove the function
DROP FUNCTION IF EXISTS public.restrict_non_owner_goal_updates();

-- Update RLS policies to remove manager approval logic
DROP POLICY IF EXISTS "Managers can update department goals" ON public.goals;

-- Simplified manager view policy - managers can still view department goals
-- but cannot modify them
DROP POLICY IF EXISTS "Managers can view department goals" ON public.goals;
CREATE POLICY "Managers can view department goals"
  ON public.goals
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM departments d
      JOIN profiles p ON p.department_id = d.id
      WHERE d.manager_id = auth.uid() AND p.id = goals.user_id
    )
  );