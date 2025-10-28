-- Fix infinite recursion in profiles RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Managers can view department profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can view department goals" ON goals;
DROP POLICY IF EXISTS "Managers can update department goals" ON goals;

-- Recreate simplified manager policies for profiles
CREATE POLICY "Managers can view department profiles"
ON profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- User can see own profile
    id = auth.uid()
    OR
    -- Managers can see profiles in their department (simplified without has_role)
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.manager_id = auth.uid()
      AND profiles.department_id = d.id
    )
    OR
    -- HR and admins can see all (direct check in user_roles)
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Recreate manager policies for goals (simplified)
CREATE POLICY "Managers can view department goals"
ON goals
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM departments d
    JOIN profiles p ON p.department_id = d.id
    WHERE d.manager_id = auth.uid()
    AND p.id = goals.user_id
  )
);

CREATE POLICY "Managers can update department goals"
ON goals
FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM departments d
    JOIN profiles p ON p.department_id = d.id
    WHERE d.manager_id = auth.uid()
    AND p.id = goals.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM departments d
    JOIN profiles p ON p.department_id = d.id
    WHERE d.manager_id = auth.uid()
    AND p.id = goals.user_id
  )
);