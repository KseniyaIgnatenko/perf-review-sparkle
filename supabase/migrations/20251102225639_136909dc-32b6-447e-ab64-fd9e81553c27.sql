-- Функция для безопасного сохранения ответа самооценки (insert or update)
CREATE OR REPLACE FUNCTION public.upsert_self_assessment_answer(
  p_self_assessment_id uuid,
  p_question_text text,
  p_answer_text text,
  p_score numeric
)
RETURNS TABLE (
  id uuid,
  self_assessment_id uuid,
  question_text text,
  answer_text text,
  score numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Удаляем старый ответ если есть
  DELETE FROM public.self_assessment_answers
  WHERE self_assessment_answers.self_assessment_id = p_self_assessment_id
    AND self_assessment_answers.question_text = p_question_text;
  
  -- Вставляем новый
  RETURN QUERY
  INSERT INTO public.self_assessment_answers (
    self_assessment_id,
    question_text,
    answer_text,
    score
  ) VALUES (
    p_self_assessment_id,
    p_question_text,
    p_answer_text,
    p_score
  )
  RETURNING *;
END;
$$;