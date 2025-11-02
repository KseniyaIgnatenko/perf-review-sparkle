-- Добавляем новые статусы в enum goal_status
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'not_started';
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'in_progress';