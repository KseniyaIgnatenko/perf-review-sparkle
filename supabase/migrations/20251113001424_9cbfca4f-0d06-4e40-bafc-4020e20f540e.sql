-- Добавляем политики для менеджеров на управление формами

-- Менеджеры могут создавать формы для своих департаментов
CREATE POLICY "Managers can create templates for their department"
ON public.form_templates
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role) 
  AND (
    department_id IS NULL 
    OR department_id IN (
      SELECT d.id 
      FROM departments d 
      WHERE d.manager_id = auth.uid()
    )
  )
);

-- Менеджеры могут обновлять формы своих департаментов
CREATE POLICY "Managers can update own department templates"
ON public.form_templates
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND (
    department_id IS NULL 
    OR department_id IN (
      SELECT d.id 
      FROM departments d 
      WHERE d.manager_id = auth.uid()
    )
  )
);

-- Менеджеры могут управлять вопросами форм своих департаментов
CREATE POLICY "Managers can manage questions for department templates"
ON public.form_questions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM form_templates ft
    WHERE ft.id = form_questions.template_id
    AND has_role(auth.uid(), 'manager'::app_role)
    AND (
      ft.department_id IS NULL 
      OR ft.department_id IN (
        SELECT d.id 
        FROM departments d 
        WHERE d.manager_id = auth.uid()
      )
    )
  )
);