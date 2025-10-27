-- Drop old policies if exist and create new ones
DROP POLICY IF EXISTS "Managers can view department goals" ON public.goals;
DROP POLICY IF EXISTS "Managers can update department goals" ON public.goals;

-- 1) Allow managers to view goals of employees in their department
CREATE POLICY "Managers can view department goals"
ON public.goals
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p_manager
    JOIN public.profiles p_employee ON p_employee.id = goals.user_id
    WHERE p_manager.id = auth.uid()
      AND p_manager.role = 'manager'
      AND p_manager.department_id = p_employee.department_id
  )
);

-- 2) Allow managers to update department goals status only
CREATE POLICY "Managers can update department goals"
ON public.goals
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p_manager
    JOIN public.profiles p_employee ON p_employee.id = goals.user_id
    WHERE p_manager.id = auth.uid()
      AND p_manager.role = 'manager'
      AND p_manager.department_id = p_employee.department_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p_manager
    JOIN public.profiles p_employee ON p_employee.id = goals.user_id
    WHERE p_manager.id = auth.uid()
      AND p_manager.role = 'manager'
      AND p_manager.department_id = p_employee.department_id
  )
);

-- 3) Trigger: restrict non-owners to only update status field
CREATE OR REPLACE FUNCTION public.restrict_non_owner_goal_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if no auth (e.g., backend service role) or owner
  IF auth.uid() IS NULL OR NEW.user_id = auth.uid() THEN
    RETURN NEW;
  END IF;

  -- If updater is not the owner, only allow changing status
  IF (NEW.title IS DISTINCT FROM OLD.title)
     OR (NEW.description IS DISTINCT FROM OLD.description)
     OR (NEW.due_date IS DISTINCT FROM OLD.due_date)
     OR (NEW.period IS DISTINCT FROM OLD.period)
     OR (NEW.progress IS DISTINCT FROM OLD.progress)
     OR (NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
     RAISE EXCEPTION 'Only status can be updated by managers';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_restrict_non_owner_goal_updates ON public.goals;
CREATE TRIGGER trg_restrict_non_owner_goal_updates
BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.restrict_non_owner_goal_updates();