-- Обновляем пароль для пользователя employee@wink.ru
-- Новый пароль: Employee123!
UPDATE auth.users
SET encrypted_password = crypt('Employee123!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'employee@wink.ru';