import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ManagerFeedback {
  id: string;
  employee_id: string;
  manager_id: string;
  total_score: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export function useManagerFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Получить оценку от менеджера для текущего пользователя
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['manager-feedback', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('manager_feedbacks')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as ManagerFeedback | null;
    },
    enabled: !!user,
  });

  // Создать или обновить оценку
  const submitFeedback = useMutation({
    mutationFn: async ({ 
      employeeId, 
      totalScore, 
      comment 
    }: { 
      employeeId: string; 
      totalScore: number; 
      comment: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Проверяем, есть ли уже оценка
      const { data: existing } = await supabase
        .from('manager_feedbacks')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('manager_id', user.id)
        .single();

      if (existing) {
        // Обновляем существующую
        const { error } = await supabase
          .from('manager_feedbacks')
          .update({
            total_score: totalScore,
            comment: comment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Создаем новую
        const { error } = await supabase
          .from('manager_feedbacks')
          .insert({
            employee_id: employeeId,
            manager_id: user.id,
            total_score: totalScore,
            comment: comment,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Успешно",
        description: "Оценка сохранена",
      });
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить оценку",
      });
    },
  });

  return {
    feedback,
    isLoading,
    submitFeedback: submitFeedback.mutate,
    isSubmitting: submitFeedback.isPending,
  };
}

// Хук для менеджера - получить все оценки, которые он дал
export function useManagerGivenFeedbacks() {
  const { user } = useAuth();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['manager-given-feedbacks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('manager_feedbacks')
        .select(`
          *,
          employee:profiles!manager_feedbacks_employee_id_fkey(
            id,
            full_name
          )
        `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    feedbacks,
    isLoading,
  };
}
