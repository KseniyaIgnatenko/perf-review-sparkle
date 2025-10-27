-- ============================================
-- CRITICAL SECURITY FIX: Proper Role-Based Access Control
-- ============================================

-- 1. Create app_role enum (keeping compatibility with existing user_role)
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'manager', 'employee');

-- 2. Create user_roles table with strict security
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create SECURITY DEFINER function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Drop the old "Users can update own profile" policy and recreate without role updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile (no role changes)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent role changes - role must remain unchanged
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- 6. Update profiles SELECT policy to be more restrictive
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Managers can view profiles in their department
CREATE POLICY "Managers can view department profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager') AND
  department_id IN (SELECT department_id FROM public.profiles WHERE id = auth.uid())
);

-- HR can view all profiles
CREATE POLICY "HR can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Fix manager_feedbacks policies - verify actual manager role
DROP POLICY IF EXISTS "Managers can insert feedbacks" ON public.manager_feedbacks;

CREATE POLICY "Only verified managers can insert feedback"
ON public.manager_feedbacks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = manager_id AND
  public.has_role(auth.uid(), 'manager') AND
  -- Verify manager of employee's department
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.departments d ON p.department_id = d.id
    WHERE p.id = employee_id AND d.manager_id = auth.uid()
  )
);

-- 8. Add RLS policies for user_roles table
-- Only admins and HR can view user roles
CREATE POLICY "Admins and HR can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'hr')
);

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert/update/delete roles (via backend functions)
CREATE POLICY "Service role manages roles"
ON public.user_roles
FOR ALL
USING (false);

-- 9. Update peer_reviews policy to include proper validation
-- Note: Keeping the current policy as peer reviews are user-initiated
-- but adding a comment that this should be enhanced with assignments table
COMMENT ON POLICY "Users can request reviews" ON public.peer_reviews IS 
  'Users can request peer reviews. For production, consider implementing peer_review_assignments table for stricter control.';