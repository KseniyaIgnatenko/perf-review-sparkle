import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TeamMemberGoal {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'completed';
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
        .select('*')
        .in('user_id', teamMemberIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for team members
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', teamMemberIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);

      return goalsData?.map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        due_date: goal.due_date,
        period: goal.period,
        progress: goal.progress,
        user_id: goal.user_id,
        employee_name: profilesMap.get(goal.user_id) || 'Unknown',
        created_at: goal.created_at,
      })) as TeamMemberGoal[] || [];
    },
    enabled: !!user,
  });

  return {
    goals,
    isLoading,
  };
}
