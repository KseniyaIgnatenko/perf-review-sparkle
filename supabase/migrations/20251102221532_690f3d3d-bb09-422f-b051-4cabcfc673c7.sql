-- Ensure RLS and allow inserting/deleting answers only for owner
ALTER TABLE public.self_assessment_answers ENABLE ROW LEVEL SECURITY;

-- Allow users to insert answers for their own assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'self_assessment_answers' 
      AND policyname = 'Users can insert answers for own assessments'
  ) THEN
    CREATE POLICY "Users can insert answers for own assessments"
    ON public.self_assessment_answers
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.self_assessments sa
        WHERE sa.id = self_assessment_answers.self_assessment_id
          AND sa.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Allow users to delete answers for their own assessments (needed for our delete-then-insert flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'self_assessment_answers' 
      AND policyname = 'Users can delete answers for own assessments'
  ) THEN
    CREATE POLICY "Users can delete answers for own assessments"
    ON public.self_assessment_answers
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1
        FROM public.self_assessments sa
        WHERE sa.id = self_assessment_answers.self_assessment_id
          AND sa.user_id = auth.uid()
      )
    );
  END IF;
END $$;