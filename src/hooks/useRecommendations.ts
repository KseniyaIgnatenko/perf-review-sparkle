import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Recommendation {
  id: string;
  user_id: string;
  recommendation_text: string;
  created_at: string;
}

export function useRecommendations() {
  const { user } = useAuth();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('development_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data as Recommendation[];
    },
    enabled: !!user,
  });

  const latestRecommendation = recommendations[0] || null;

  return {
    latestRecommendation,
    isLoading,
  };
}
