-- Add unique constraint on self_assessment_answers to enable proper upsert
ALTER TABLE self_assessment_answers
ADD CONSTRAINT self_assessment_answers_unique_question 
UNIQUE (self_assessment_id, question_text);