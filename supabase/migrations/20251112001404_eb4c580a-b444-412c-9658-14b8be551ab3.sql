-- Create enum for form types
CREATE TYPE public.form_type AS ENUM (
  'self_assessment',
  'peer_review',
  'potential_assessment',
  'manager_feedback',
  'custom'
);

-- Create enum for question types
CREATE TYPE public.question_type AS ENUM (
  'text',
  'number',
  'scale',
  'single_choice',
  'multiple_choice'
);

-- Create enum for form submission status
CREATE TYPE public.form_submission_status AS ENUM (
  'draft',
  'submitted',
  'reviewed'
);

-- Create form_templates table
CREATE TABLE public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  form_type form_type NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  period VARCHAR,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES public.form_templates(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form_questions table
CREATE TABLE public.form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.form_templates(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  order_index INTEGER NOT NULL,
  options JSONB, -- For choice questions: ["Option 1", "Option 2"]
  is_required BOOLEAN DEFAULT true,
  score_weight NUMERIC DEFAULT 1.0,
  min_value NUMERIC, -- For number/scale questions
  max_value NUMERIC, -- For number/scale questions
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form_calculation_rules table
CREATE TABLE public.form_calculation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.form_templates(id) ON DELETE CASCADE NOT NULL,
  rule_name VARCHAR NOT NULL,
  formula TEXT NOT NULL, -- JavaScript-like formula: "avg(q1, q2, q3)"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.form_templates(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Person being evaluated
  submitted_by UUID REFERENCES auth.users(id), -- Person who submitted (can be different for peer reviews)
  reviewee_id UUID REFERENCES auth.users(id), -- For peer reviews
  goal_id UUID REFERENCES public.goals(id),
  task_id UUID REFERENCES public.goal_tasks(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  status form_submission_status DEFAULT 'draft',
  total_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form_answers table
CREATE TABLE public.form_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.form_questions(id) NOT NULL,
  answer_value TEXT, -- Text/number as string
  answer_numeric NUMERIC, -- Numeric value for calculations
  answer_json JSONB, -- For multiple choice answers
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_calculation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_templates
CREATE POLICY "HR and admins can manage templates"
  ON public.form_templates
  FOR ALL
  USING (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view active templates"
  ON public.form_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for form_questions
CREATE POLICY "HR and admins can manage questions"
  ON public.form_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.form_templates
      WHERE form_templates.id = form_questions.template_id
      AND (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "All authenticated users can view questions"
  ON public.form_questions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.form_templates
      WHERE form_templates.id = form_questions.template_id
      AND form_templates.is_active = true
    )
  );

-- RLS Policies for form_calculation_rules
CREATE POLICY "HR and admins can manage calculation rules"
  ON public.form_calculation_rules
  FOR ALL
  USING (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view calculation rules"
  ON public.form_calculation_rules
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for form_submissions
CREATE POLICY "Users can view own submissions"
  ON public.form_submissions
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.uid() = submitted_by
    OR auth.uid() = reviewee_id
  );

CREATE POLICY "Users can create own submissions"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid() = submitted_by
  );

CREATE POLICY "Users can update own submissions"
  ON public.form_submissions
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.uid() = submitted_by
  );

CREATE POLICY "Managers can view department submissions"
  ON public.form_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN departments d ON p.department_id = d.id
      WHERE p.id = form_submissions.user_id
      AND d.manager_id = auth.uid()
    )
  );

CREATE POLICY "HR and admins can view all submissions"
  ON public.form_submissions
  FOR SELECT
  USING (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for form_answers
CREATE POLICY "Users can manage answers for own submissions"
  ON public.form_answers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.form_submissions
      WHERE form_submissions.id = form_answers.submission_id
      AND (
        form_submissions.user_id = auth.uid()
        OR form_submissions.submitted_by = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can view department answers"
  ON public.form_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM form_submissions fs
      JOIN profiles p ON p.id = fs.user_id
      JOIN departments d ON p.department_id = d.id
      WHERE fs.id = form_answers.submission_id
      AND d.manager_id = auth.uid()
    )
  );

CREATE POLICY "HR and admins can view all answers"
  ON public.form_answers
  FOR SELECT
  USING (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_form_templates_type ON public.form_templates(form_type);
CREATE INDEX idx_form_templates_active ON public.form_templates(is_active);
CREATE INDEX idx_form_questions_template ON public.form_questions(template_id);
CREATE INDEX idx_form_questions_order ON public.form_questions(template_id, order_index);
CREATE INDEX idx_form_submissions_user ON public.form_submissions(user_id);
CREATE INDEX idx_form_submissions_template ON public.form_submissions(template_id);
CREATE INDEX idx_form_answers_submission ON public.form_answers(submission_id);

-- Create trigger for updated_at
CREATE TRIGGER update_form_templates_updated_at
  BEFORE UPDATE ON public.form_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_form_answers_updated_at
  BEFORE UPDATE ON public.form_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();