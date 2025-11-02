import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EmployeeWithStats {
  id: string;
  full_name: string;
  position_id: string | null;
  position_name: string | null;
  goalsCompleted: number;
  totalGoals: number;
  selfAssessmentScore: number | null;
  peerAverageScore: number | null;
  status: 'pending' | 'in-review' | 'completed';
}

export function useTeamMembers() {
  const { user } = useAuth();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Получаем всех сотрудников с их должностями
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          position_id,
          positions:position_id (name)
        `)
        .eq('is_active', true)
        .neq('id', user.id);
      
      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Для каждого сотрудника получаем статистику
      const membersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          // Цели
          const { data: goals } = await supabase
            .from('goals')
            .select('status, progress')
            .eq('user_id', profile.id);

          const totalGoals = goals?.length || 0;
          const goalsCompleted = goals?.filter(g => g.status === 'completed').length || 0;

          // Самооценка
          const { data: selfAssessments } = await supabase
            .from('self_assessments')
            .select('total_score')
            .eq('user_id', profile.id)
            .eq('status', 'submitted');

          const selfAssessmentScore = selfAssessments?.[0]?.total_score || null;

          // Peer reviews
          const { data: peerReviews } = await supabase
            .from('peer_reviews')
            .select('score')
            .eq('reviewee_id', profile.id)
            .eq('status', 'submitted');

          const peerAverageScore = peerReviews && peerReviews.length > 0
            ? peerReviews.reduce((sum, r) => sum + (r.score || 0), 0) / peerReviews.length
            : null;

          // Определяем статус
          let status: 'pending' | 'in-review' | 'completed' = 'pending';
          if (selfAssessmentScore && peerAverageScore) {
            status = 'completed';
          } else if (selfAssessmentScore || peerAverageScore) {
            status = 'in-review';
          }

          return {
            id: profile.id,
            full_name: profile.full_name,
            position_id: profile.position_id,
            position_name: (profile.positions as any)?.name || null,
            goalsCompleted,
            totalGoals,
            selfAssessmentScore,
            peerAverageScore,
            status,
          };
        })
      );

      return membersWithStats as EmployeeWithStats[];
    },
    enabled: !!user,
  });

  return {
    teamMembers,
    isLoading,
  };
}
