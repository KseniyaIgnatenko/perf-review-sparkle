-- Add new fields to manager_feedbacks table for structured feedback
ALTER TABLE public.manager_feedbacks
ADD COLUMN IF NOT EXISTS strengths_feedback TEXT,
ADD COLUMN IF NOT EXISTS improvement_feedback TEXT,
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id);

-- Add comment for clarity
COMMENT ON COLUMN public.manager_feedbacks.strengths_feedback IS 'Feedback on personal qualities and contribution (questions 2-3)';
COMMENT ON COLUMN public.manager_feedbacks.improvement_feedback IS 'Recommendations for improvement (question 5)';
COMMENT ON COLUMN public.manager_feedbacks.comment IS 'General summary feedback';
COMMENT ON COLUMN public.manager_feedbacks.total_score IS 'Overall rating 0-10 (question 6)';