-- Обновляем функцию автоматической регистрации пользователей
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_department_id uuid;
BEGIN
  -- Находим первый департамент с менеджером
  SELECT id INTO v_department_id
  FROM public.departments
  WHERE manager_id IS NOT NULL
  LIMIT 1;

  -- Создаем профиль пользователя с привязкой к департаменту
  INSERT INTO public.profiles (id, full_name, role, department_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'),
    v_department_id
  );

  -- Автоматически назначаем роль 'employee' в таблице user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;