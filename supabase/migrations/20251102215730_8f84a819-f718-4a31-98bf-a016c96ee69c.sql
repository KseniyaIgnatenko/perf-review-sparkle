-- Remove the problematic unique constraint
ALTER TABLE self_assessment_answers
DROP CONSTRAINT IF EXISTS self_assessment_answers_unique_question;

-- Delete any existing answers for the assessment to start fresh
DELETE FROM self_assessment_answers 
WHERE self_assessment_id IN (
  SELECT id FROM self_assessments 
  WHERE user_id = auth.uid() AND status = 'draft'
);