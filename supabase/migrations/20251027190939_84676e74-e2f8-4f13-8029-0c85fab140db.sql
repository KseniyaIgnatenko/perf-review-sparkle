-- Create enum types
CREATE TYPE public.user_role AS ENUM ('employee', 'manager', 'hr', 'admin');
CREATE TYPE public.goal_status AS ENUM ('draft', 'on_review', 'approved', 'completed');
CREATE TYPE public.assessment_status AS ENUM ('draft', 'submitted', 'reviewed');
CREATE TYPE public.review_status AS ENUM ('pending', 'submitted', 'received');
CREATE TYPE public.report_type AS ENUM ('personal', 'team', 'company');
CREATE TYPE public.report_status AS ENUM ('ready', 'in_progress');
CREATE TYPE public.support_status AS ENUM ('open', 'in_progress', 'closed');

-- Create positions table
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  period VARCHAR(50),
  due_date DATE,
  status goal_status DEFAULT 'draft',
  progress NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goal_tasks table
CREATE TABLE public.goal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create self_assessments table
CREATE TABLE public.self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  total_score NUMERIC,
  status assessment_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create self_assessment_answers table
CREATE TABLE public.self_assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  self_assessment_id UUID REFERENCES public.self_assessments(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create peer_reviews table
CREATE TABLE public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  comment TEXT,
  score NUMERIC,
  status review_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create manager_feedbacks table
CREATE TABLE public.manager_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_score NUMERIC,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type report_type NOT NULL,
  period VARCHAR(50),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  file_url TEXT,
  status report_status DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create development_recommendations table
CREATE TABLE public.development_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create support_requests table
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  status support_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create login_attempts table
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  is_success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for positions (read-only for all)
CREATE POLICY "Anyone can view positions" ON public.positions FOR SELECT USING (true);

-- RLS Policies for departments (read-only for all)
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for goal_tasks
CREATE POLICY "Users can view tasks of own goals" ON public.goal_tasks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can manage tasks of own goals" ON public.goal_tasks FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));

-- RLS Policies for self_assessments
CREATE POLICY "Users can view own assessments" ON public.self_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.self_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON public.self_assessments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for self_assessment_answers
CREATE POLICY "Users can view own assessment answers" ON public.self_assessment_answers FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.self_assessments WHERE self_assessments.id = self_assessment_answers.self_assessment_id AND self_assessments.user_id = auth.uid()));
CREATE POLICY "Users can manage own assessment answers" ON public.self_assessment_answers FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.self_assessments WHERE self_assessments.id = self_assessment_answers.self_assessment_id AND self_assessments.user_id = auth.uid()));

-- RLS Policies for peer_reviews
CREATE POLICY "Users can view reviews they wrote or received" ON public.peer_reviews FOR SELECT 
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "Users can insert reviews as reviewer" ON public.peer_reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.peer_reviews FOR UPDATE 
  USING (auth.uid() = reviewer_id);

-- RLS Policies for manager_feedbacks
CREATE POLICY "Users can view own feedbacks" ON public.manager_feedbacks FOR SELECT 
  USING (auth.uid() = manager_id OR auth.uid() = employee_id);
CREATE POLICY "Managers can insert feedbacks" ON public.manager_feedbacks FOR INSERT 
  WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Managers can update own feedbacks" ON public.manager_feedbacks FOR UPDATE 
  USING (auth.uid() = manager_id);

-- RLS Policies for reports
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own reports" ON public.reports FOR ALL USING (auth.uid() = owner_id);

-- RLS Policies for development_recommendations
CREATE POLICY "Users can view own recommendations" ON public.development_recommendations FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for support_requests
CREATE POLICY "Users can view own support requests" ON public.support_requests FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own support requests" ON public.support_requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support requests" ON public.support_requests FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for login_attempts (admin only, but allowing inserts for tracking)
CREATE POLICY "Anyone can insert login attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_self_assessments_updated_at BEFORE UPDATE ON public.self_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_peer_reviews_updated_at BEFORE UPDATE ON public.peer_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_manager_feedbacks_updated_at BEFORE UPDATE ON public.manager_feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_support_requests_updated_at BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();