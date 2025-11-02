import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SelfAssessment {
  id: string;
  user_id: string;
  goal_id: string | null;
  task_id: string | null;
  status: 'draft' | 'submitted' | 'reviewed';
  total_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface SelfAssessmentAnswer {
  id: string;
  self_assessment_id: string;
  question_text: string;
  answer_text: string | null;
  score: number | null;
}

export function useSelfAssessments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['self-assessments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('self_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SelfAssessment[];
    },
    enabled: !!user,
  });

  const createAssessment = useMutation({
    mutationFn: async (assessment: { task_id: string; goal_id?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('self_assessments')
        .insert({ 
          user_id: user.id, 
          task_id: assessment.task_id,
          goal_id: assessment.goal_id || null,
          status: 'draft'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-assessments'] });
      toast.success('Самооценка создана');
    },
    onError: (error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  const updateAssessment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SelfAssessment> & { id: string }) => {
      const { data, error } = await supabase
        .from('self_assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['self-assessments'] });
      toast.success('Самооценка обновлена');
    },
    onError: (error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  return {
    assessments,
    isLoading,
    createAssessment: createAssessment.mutate,
    updateAssessment: updateAssessment.mutate,
  };
}

export function useSelfAssessmentAnswers(assessmentId: string | null) {
  const queryClient = useQueryClient();

  const { data: answers = [], isLoading } = useQuery({
    queryKey: ['assessment-answers', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return [];
      const { data, error } = await supabase
        .from('self_assessment_answers')
        .select('*')
        .eq('self_assessment_id', assessmentId);
      
      if (error) throw error;
      return data as SelfAssessmentAnswer[];
    },
    enabled: !!assessmentId,
  });

  const saveAnswer = useMutation({
    mutationFn: async (answer: Omit<SelfAssessmentAnswer, 'id'>) => {
      const { data, error } = await supabase
        .from('self_assessment_answers')
        .upsert(answer, {
          onConflict: 'self_assessment_id,question_text'
        })
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-answers'] });
    },
  });

  return {
    answers,
    isLoading,
    saveAnswer: saveAnswer.mutate,
    saveAnswerAsync: saveAnswer.mutateAsync,
  };
}
