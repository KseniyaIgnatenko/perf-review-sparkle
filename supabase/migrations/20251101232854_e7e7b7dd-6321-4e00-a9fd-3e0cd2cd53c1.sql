-- Allow authenticated users to view basic colleague profiles for peer review requests
-- This enables users to see and request reviews from colleagues
CREATE POLICY "Authenticated users can view colleague profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true
);