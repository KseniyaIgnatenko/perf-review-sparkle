-- Таблица для оценок потенциала сотрудника
CREATE TABLE public.potential_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  manager_id UUID NOT NULL,
  period VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'draft',
  
  -- Вопрос 1: Профессиональные качества (1-5)
  q1_score NUMERIC,
  
  -- Вопрос 2: Личные качества (1-4)
  q2_score NUMERIC,
  
  -- Вопрос 3.1: Мотивация дополнительно (да/нет)
  q3_1_answer BOOLEAN,
  
  -- Вопрос 3.2: Дискоммуникация с коллегами (да/нет)
  q3_2_answer BOOLEAN,
  
  -- Вопрос 3.3: Желание развиваться (1-4)
  q3_3_answer INTEGER,
  
  -- Вопрос 3.4: Считает себя преемником (да/нет)
  q3_4_answer BOOLEAN,
  
  -- Вопрос 3.5: Срок готовности (1-4)
  q3_5_answer INTEGER,
  
  -- Вопрос 3.6: Риск ухода (0-10)
  q3_6_score NUMERIC,
  
  -- Вопросы 3.7-3.8: ОПЗ (1-10)
  q3_7_score NUMERIC,
  q3_8_score NUMERIC,
  
  -- Автоматические вычисления
  performance_score NUMERIC, -- Результативность
  potential_score NUMERIC,   -- Потенциал
  performance_category INTEGER, -- Категория результативности (1-3)
  potential_category INTEGER,   -- Категория потенциала (1-3)
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.potential_assessments ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Managers can create assessments for their employees"
ON public.potential_assessments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = manager_id 
  AND has_role(auth.uid(), 'manager'::app_role)
  AND EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN departments d ON p.department_id = d.id
    WHERE p.id = potential_assessments.employee_id 
    AND d.manager_id = auth.uid()
  )
);

CREATE POLICY "Managers can view and update their assessments"
ON public.potential_assessments
FOR ALL
TO authenticated
USING (auth.uid() = manager_id);

CREATE POLICY "Employees can view their own assessments"
ON public.potential_assessments
FOR SELECT
TO authenticated
USING (auth.uid() = employee_id);

CREATE POLICY "HR and admins can view all assessments"
ON public.potential_assessments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'hr'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Триггер для обновления updated_at
CREATE TRIGGER update_potential_assessments_updated_at
BEFORE UPDATE ON public.potential_assessments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();