-- Добавляем новые поля для дополнительных вопросов в анкете менеджера
ALTER TABLE public.manager_feedbacks
ADD COLUMN result_achievement_score numeric CHECK (result_achievement_score >= 0 AND result_achievement_score <= 10),
ADD COLUMN collaboration_quality_score numeric CHECK (collaboration_quality_score >= 0 AND collaboration_quality_score <= 10);