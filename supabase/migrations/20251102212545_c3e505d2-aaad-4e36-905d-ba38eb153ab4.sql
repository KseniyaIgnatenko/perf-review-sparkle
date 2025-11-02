-- Функция для получения email пользователя по ФИО
CREATE OR REPLACE FUNCTION get_email_by_full_name(p_full_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
BEGIN
  -- Находим user_id по ФИО в profiles
  SELECT id INTO v_user_id
  FROM profiles
  WHERE LOWER(full_name) = LOWER(p_full_name)
  AND is_active = true
  LIMIT 1;
  
  -- Если пользователь не найден, возвращаем null
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Получаем email из auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  RETURN v_email;
END;
$$;