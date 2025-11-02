-- Добавляем поле task_id в таблицу peer_reviews для привязки к конкретной задаче
ALTER TABLE public.peer_reviews
ADD COLUMN task_id uuid REFERENCES public.goal_tasks(id) ON DELETE CASCADE;

-- Добавляем комментарий для пояснения
COMMENT ON COLUMN public.peer_reviews.task_id IS 'Опциональная привязка к конкретной задаче цели. Если NULL, то оценка на всю цель';

-- Добавляем индекс для быстрого поиска
CREATE INDEX idx_peer_reviews_task_id ON public.peer_reviews(task_id);