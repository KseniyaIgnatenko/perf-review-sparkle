-- Добавляем политику для менеджеров, чтобы они могли видеть задачи целей своих сотрудников
CREATE POLICY "Managers can view department goal tasks"
ON public.goal_tasks
FOR SELECT
USING (
  -- Пользователь может видеть задачи своих целей
  (EXISTS (
    SELECT 1 
    FROM goals 
    WHERE goals.id = goal_tasks.goal_id 
    AND goals.user_id = auth.uid()
  ))
  OR
  -- Менеджер может видеть задачи целей сотрудников своего департамента
  (EXISTS (
    SELECT 1
    FROM goals
    JOIN profiles p ON p.id = goals.user_id
    JOIN departments d ON d.id = p.department_id
    WHERE goals.id = goal_tasks.goal_id
    AND d.manager_id = auth.uid()
  ))
);