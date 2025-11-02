-- Уникальность ответа на вопрос в рамках одной самооценки
CREATE UNIQUE INDEX IF NOT EXISTS idx_self_assessment_answers_unique
ON public.self_assessment_answers (self_assessment_id, question_text);

COMMENT ON INDEX idx_self_assessment_answers_unique IS
'Ensures one answer per question per self assessment and enables efficient upserts';