import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  period: string | null;
  status: 'draft' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface GoalTask {
  id: string;
  goal_id: string;
  title: string;
  is_done: boolean;
}

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'progress'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user.id, progress: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Цель успешно создана');
    },
    onError: (error) => {
      toast.error('Ошибка при создании цели: ' + error.message);
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Цель успешно обновлена');
    },
    onError: (error) => {
      toast.error('Ошибка при обновлении цели: ' + error.message);
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Цель успешно удалена');
    },
    onError: (error) => {
      toast.error('Ошибка при удалении цели: ' + error.message);
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
  };
}

export function useGoalTasks(goalId: string | null) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['goal-tasks', goalId],
    queryFn: async () => {
      if (!goalId) return [];
      const { data, error } = await supabase
        .from('goal_tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as GoalTask[];
    },
    enabled: !!goalId,
  });

  const addTask = useMutation({
    mutationFn: async ({ goalId, title }: { goalId: string; title: string }) => {
      const { data, error } = await supabase
        .from('goal_tasks')
        .insert({ goal_id: goalId, title, is_done: false })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, goalId, ...updates }: Partial<GoalTask> & { id: string; goalId?: string }) => {
      const { data, error } = await supabase
        .from('goal_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Если обновляем статус задачи, пересчитываем прогресс цели
      if (updates.is_done !== undefined && goalId) {
        const { data: allTasks } = await supabase
          .from('goal_tasks')
          .select('*')
          .eq('goal_id', goalId);
        
        if (allTasks && allTasks.length > 0) {
          const completedTasks = allTasks.filter(t => t.is_done).length;
          const progress = Math.round((completedTasks / allTasks.length) * 100);
          
          await supabase
            .from('goals')
            .update({ progress })
            .eq('id', goalId);
        }
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal-tasks'] });
      if (variables.goalId) {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      }
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goal_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    addTask: addTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
  };
}
