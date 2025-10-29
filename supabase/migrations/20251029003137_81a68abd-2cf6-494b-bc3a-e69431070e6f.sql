-- Добавляем политику для просмотра профилей reviewer'ов
-- Это позволит пользователям видеть имена коллег, которые их оценили
CREATE POLICY "Users can view reviewer profiles"
ON public.profiles
FOR SELECT
USING (
  -- Разрешаем видеть профили тех, кто оценил текущего пользователя
  EXISTS (
    SELECT 1
    FROM public.peer_reviews
    WHERE peer_reviews.reviewer_id = profiles.id
      AND peer_reviews.reviewee_id = auth.uid()
  )
  OR
  -- Разрешаем видеть профили тех, кого оценивает текущий пользователь
  EXISTS (
    SELECT 1
    FROM public.peer_reviews
    WHERE peer_reviews.reviewee_id = profiles.id
      AND peer_reviews.reviewer_id = auth.uid()
  )
);