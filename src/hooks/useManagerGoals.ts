import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TeamMemberGoal {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'on_review' | 'approved' | 'completed';
  due_date: string | null;
  period: string | null;
  progress: number;
  user_id: string;
  employee_name: string;
  created_at: string;
}

export function useManagerGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['manager-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get manager's profile to find their department
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', user.id)
        .single();

      if (!managerProfile?.department_id) return [];

      // Get all employees in the same department
      const { data: teamMembers } = await supabase
        .from('profiles')
        .select('id')
        .eq('department_id', managerProfile.department_id)
        .eq('is_active', true)
        .neq('id', user.id);

      if (!teamMembers || teamMembers.length === 0) return [];

      const teamMemberIds = teamMembers.map((m) => m.id);

      // Get all goals from team members
      const { data: goalsData, error } = await supabase
        .from('goals')
        .select(`
          *,
          profiles!goals_user_id_fkey (
            full_name
          )
        `)
        .in('user_id', teamMemberIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return goalsData.map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        due_date: goal.due_date,
        period: goal.period,
        progress: goal.progress,
        user_id: goal.user_id,
        employee_name: goal.profiles?.full_name || 'Unknown',
        created_at: goal.created_at,
      })) as TeamMemberGoal[];
    },
    enabled: !!user,
  });

  const approveGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .update({ status: 'approved' })
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Успешно',
        description: 'Цель утверждена',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось утвердить цель',
        variant: 'destructive',
      });
      console.error('Error approving goal:', error);
    },
  });

  const rejectGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .update({ status: 'draft' })
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Успешно',
        description: 'Цель отправлена на доработку',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить цель',
        variant: 'destructive',
      });
      console.error('Error rejecting goal:', error);
    },
  });

  return {
    goals,
    isLoading,
    approveGoal: approveGoalMutation.mutate,
    rejectGoal: rejectGoalMutation.mutate,
    isApproving: approveGoalMutation.isPending,
    isRejecting: rejectGoalMutation.isPending,
  };
}
