
-- Добавляем поле task_id в таблицу self_assessments
ALTER TABLE self_assessments ADD COLUMN task_id uuid REFERENCES goal_tasks(id);

-- Делаем goal_id необязательным (можно вычислить из task_id)
ALTER TABLE self_assessments ALTER COLUMN goal_id DROP NOT NULL;

-- Добавляем constraint: должен быть либо task_id, либо goal_id
ALTER TABLE self_assessments ADD CONSTRAINT self_assessments_task_or_goal_check 
CHECK (task_id IS NOT NULL OR goal_id IS NOT NULL);

-- Обновляем RLS политики для работы с задачами
DROP POLICY IF EXISTS "Users can view own assessments" ON self_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON self_assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON self_assessments;

-- Политика для просмотра собственных самооценок (учитываем задачи)
CREATE POLICY "Users can view own assessments" ON self_assessments
FOR SELECT
USING (
  auth.uid() = user_id OR
  (task_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM goal_tasks gt
    JOIN goals g ON g.id = gt.goal_id
    WHERE gt.id = self_assessments.task_id 
    AND g.user_id = auth.uid()
  ))
);

-- Политика для создания самооценок
CREATE POLICY "Users can insert own assessments" ON self_assessments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    task_id IS NULL OR EXISTS (
      SELECT 1 FROM goal_tasks gt
      JOIN goals g ON g.id = gt.goal_id
      WHERE gt.id = task_id 
      AND g.user_id = auth.uid()
    )
  )
);

-- Политика для обновления самооценок
CREATE POLICY "Users can update own assessments" ON self_assessments
FOR UPDATE
USING (auth.uid() = user_id);
