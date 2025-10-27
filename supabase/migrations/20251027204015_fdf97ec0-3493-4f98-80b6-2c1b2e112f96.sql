-- Удаление всех данных пользователя Игнатенко Ксения Викторовна
-- user_id: 850973fd-31e0-4756-b61a-0715701b6271

-- 1. Удаляем задачи целей
DELETE FROM goal_tasks 
WHERE goal_id IN (
  SELECT id FROM goals WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271'
);

-- 2. Удаляем ответы на самооценки
DELETE FROM self_assessment_answers 
WHERE self_assessment_id IN (
  SELECT id FROM self_assessments WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271'
);

-- 3. Удаляем самооценки
DELETE FROM self_assessments 
WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 4. Удаляем peer reviews (как reviewer и reviewee)
DELETE FROM peer_reviews 
WHERE reviewer_id = '850973fd-31e0-4756-b61a-0715701b6271' 
   OR reviewee_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 5. Удаляем отзывы менеджера
DELETE FROM manager_feedbacks 
WHERE employee_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 6. Удаляем уведомления
DELETE FROM notifications 
WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 7. Удаляем рекомендации по развитию
DELETE FROM development_recommendations 
WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 8. Удаляем отчеты
DELETE FROM reports 
WHERE owner_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 9. Удаляем запросы в поддержку
DELETE FROM support_requests 
WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 10. Удаляем цели
DELETE FROM goals 
WHERE user_id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 11. Удаляем профиль
DELETE FROM profiles 
WHERE id = '850973fd-31e0-4756-b61a-0715701b6271';

-- 12. Удаляем пользователя из auth (каскадно удалит связанные записи)
DELETE FROM auth.users 
WHERE id = '850973fd-31e0-4756-b61a-0715701b6271';