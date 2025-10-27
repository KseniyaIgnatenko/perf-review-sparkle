-- Убедимся что enum типы правильно определены
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assessment_status') THEN
    CREATE TYPE assessment_status AS ENUM ('draft', 'submitted', 'reviewed');
  END IF;
END $$;

-- Убедимся что у self_assessments есть триггер для updated_at
DROP TRIGGER IF EXISTS handle_self_assessments_updated_at ON public.self_assessments;

CREATE TRIGGER handle_self_assessments_updated_at
  BEFORE UPDATE ON public.self_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Добавляем unique constraint для корректной работы upsert в self_assessment_answers
-- Это позволяет обновлять ответы на вопросы без создания дубликатов
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'self_assessment_answers_assessment_question_unique'
  ) THEN
    ALTER TABLE public.self_assessment_answers
    ADD CONSTRAINT self_assessment_answers_assessment_question_unique 
    UNIQUE (self_assessment_id, question_text);
  END IF;
END $$;

-- Добавляем индексы для улучшения производительности запросов
CREATE INDEX IF NOT EXISTS idx_self_assessments_user_id 
  ON public.self_assessments(user_id);

CREATE INDEX IF NOT EXISTS idx_self_assessments_goal_id 
  ON public.self_assessments(goal_id);

CREATE INDEX IF NOT EXISTS idx_self_assessments_status 
  ON public.self_assessments(status);

CREATE INDEX IF NOT EXISTS idx_self_assessment_answers_assessment_id 
  ON public.self_assessment_answers(self_assessment_id);

-- Комментарии для документации схемы
COMMENT ON TABLE public.self_assessments IS 'Хранит самооценки сотрудников по целям';
COMMENT ON TABLE public.self_assessment_answers IS 'Хранит ответы на вопросы самооценки';

COMMENT ON COLUMN public.self_assessments.status IS 'draft - черновик, submitted - отправлено, reviewed - проверено менеджером';
COMMENT ON COLUMN public.self_assessments.total_score IS 'Общий балл самооценки, вычисляется из оценок по вопросам';
COMMENT ON COLUMN public.self_assessment_answers.question_text IS 'Идентификатор вопроса (results, contribution, skills, improvements, teamwork, satisfaction)';
COMMENT ON COLUMN public.self_assessment_answers.answer_text IS 'Текстовый ответ на вопрос (для описательных вопросов)';
COMMENT ON COLUMN public.self_assessment_answers.score IS 'Числовая оценка (для вопросов со шкалой 1-10)';