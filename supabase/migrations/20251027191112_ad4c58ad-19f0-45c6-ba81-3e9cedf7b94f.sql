-- Update RLS policies to explicitly require authentication
-- Drop old policies and recreate with TO authenticated

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Positions policies
DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
CREATE POLICY "Users can view positions" ON public.positions 
  FOR SELECT TO authenticated USING (true);

-- Departments policies
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
CREATE POLICY "Users can view departments" ON public.departments 
  FOR SELECT TO authenticated USING (true);

-- Goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;

CREATE POLICY "Users can view own goals" ON public.goals 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Goal tasks policies
DROP POLICY IF EXISTS "Users can view tasks of own goals" ON public.goal_tasks;
DROP POLICY IF EXISTS "Users can manage tasks of own goals" ON public.goal_tasks;

CREATE POLICY "Users can view tasks of own goals" ON public.goal_tasks 
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can manage tasks of own goals" ON public.goal_tasks 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_tasks.goal_id AND goals.user_id = auth.uid()));

-- Self assessments policies
DROP POLICY IF EXISTS "Users can view own assessments" ON public.self_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.self_assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON public.self_assessments;

CREATE POLICY "Users can view own assessments" ON public.self_assessments 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.self_assessments 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON public.self_assessments 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Self assessment answers policies
DROP POLICY IF EXISTS "Users can view own assessment answers" ON public.self_assessment_answers;
DROP POLICY IF EXISTS "Users can manage own assessment answers" ON public.self_assessment_answers;

CREATE POLICY "Users can view own assessment answers" ON public.self_assessment_answers 
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.self_assessments WHERE self_assessments.id = self_assessment_answers.self_assessment_id AND self_assessments.user_id = auth.uid()));
CREATE POLICY "Users can manage own assessment answers" ON public.self_assessment_answers 
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.self_assessments WHERE self_assessments.id = self_assessment_answers.self_assessment_id AND self_assessments.user_id = auth.uid()));

-- Peer reviews policies
DROP POLICY IF EXISTS "Users can view reviews they wrote or received" ON public.peer_reviews;
DROP POLICY IF EXISTS "Users can insert reviews as reviewer" ON public.peer_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.peer_reviews;

CREATE POLICY "Users can view reviews they wrote or received" ON public.peer_reviews 
  FOR SELECT TO authenticated
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "Users can insert reviews as reviewer" ON public.peer_reviews 
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.peer_reviews 
  FOR UPDATE TO authenticated
  USING (auth.uid() = reviewer_id);

-- Manager feedbacks policies
DROP POLICY IF EXISTS "Users can view own feedbacks" ON public.manager_feedbacks;
DROP POLICY IF EXISTS "Managers can insert feedbacks" ON public.manager_feedbacks;
DROP POLICY IF EXISTS "Managers can update own feedbacks" ON public.manager_feedbacks;

CREATE POLICY "Users can view own feedbacks" ON public.manager_feedbacks 
  FOR SELECT TO authenticated
  USING (auth.uid() = manager_id OR auth.uid() = employee_id);
CREATE POLICY "Managers can insert feedbacks" ON public.manager_feedbacks 
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Managers can update own feedbacks" ON public.manager_feedbacks 
  FOR UPDATE TO authenticated
  USING (auth.uid() = manager_id);

-- Reports policies
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can manage own reports" ON public.reports;

CREATE POLICY "Users can view own reports" ON public.reports 
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own reports" ON public.reports 
  FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Development recommendations policies
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.development_recommendations;

CREATE POLICY "Users can view own recommendations" ON public.development_recommendations 
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications 
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Support requests policies
DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create own support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Users can update own support requests" ON public.support_requests;

CREATE POLICY "Users can view own support requests" ON public.support_requests 
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own support requests" ON public.support_requests 
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support requests" ON public.support_requests 
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);