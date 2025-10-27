-- Исправляем структуру таблицы peer_reviews для системы запросов отзывов

-- Добавляем foreign keys к profiles
ALTER TABLE public.peer_reviews 
  DROP CONSTRAINT IF EXISTS peer_reviews_reviewer_id_fkey,
  DROP CONSTRAINT IF EXISTS peer_reviews_reviewee_id_fkey;

ALTER TABLE public.peer_reviews
  ADD CONSTRAINT peer_reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT peer_reviews_reviewee_id_fkey 
    FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Делаем goal_id опциональным (отзыв может быть не привязан к конкретной цели)
ALTER TABLE public.peer_reviews 
  ALTER COLUMN goal_id DROP NOT NULL;

-- Добавляем поля для расширенной оценки
ALTER TABLE public.peer_reviews 
  ADD COLUMN IF NOT EXISTS collaboration_score numeric,
  ADD COLUMN IF NOT EXISTS quality_score numeric,
  ADD COLUMN IF NOT EXISTS communication_score numeric;

-- Добавляем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer_id ON public.peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewee_id ON public.peer_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_status ON public.peer_reviews(status);

-- Обновляем RLS политики для корректной работы запросов отзывов
DROP POLICY IF EXISTS "Users can view reviews they wrote or received" ON public.peer_reviews;
DROP POLICY IF EXISTS "Users can insert reviews as reviewer" ON public.peer_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.peer_reviews;

-- Пользователи могут просматривать отзывы, которые они написали или получили
CREATE POLICY "Users can view their reviews"
  ON public.peer_reviews
  FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

-- Reviewee может создавать запросы на отзыв (где он reviewee, а reviewer - коллега)
CREATE POLICY "Users can request reviews"
  ON public.peer_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = reviewee_id);

-- Reviewer может обновлять отзывы, которые ему назначены
CREATE POLICY "Reviewers can update assigned reviews"
  ON public.peer_reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Добавляем комментарии для документации
COMMENT ON COLUMN public.peer_reviews.collaboration_score IS 'Оценка навыков сотрудничества (1-10)';
COMMENT ON COLUMN public.peer_reviews.quality_score IS 'Оценка качества работы (1-10)';
COMMENT ON COLUMN public.peer_reviews.communication_score IS 'Оценка коммуникации (1-10)';
COMMENT ON COLUMN public.peer_reviews.goal_id IS 'Опциональная привязка к конкретной цели';
COMMENT ON COLUMN public.peer_reviews.score IS 'Общая оценка (вычисляется из отдельных оценок)';