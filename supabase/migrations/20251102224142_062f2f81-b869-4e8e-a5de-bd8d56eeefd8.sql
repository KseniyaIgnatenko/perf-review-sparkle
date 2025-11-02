-- Добавляем уникальный индекс для предотвращения дублей самооценок
-- Один пользователь может иметь только одну самооценку на одну задачу
CREATE UNIQUE INDEX IF NOT EXISTS idx_self_assessments_user_task_unique 
ON public.self_assessments (user_id, task_id) 
WHERE task_id IS NOT NULL;

-- Также создадим частичный индекс для поиска черновиков
CREATE INDEX IF NOT EXISTS idx_self_assessments_draft 
ON public.self_assessments (user_id, status) 
WHERE status = 'draft';

-- Комментарии для документации
COMMENT ON INDEX idx_self_assessments_user_task_unique IS 
'Ensures one self-assessment per user per task';
COMMENT ON INDEX idx_self_assessments_draft IS 
'Optimizes queries for draft self-assessments';