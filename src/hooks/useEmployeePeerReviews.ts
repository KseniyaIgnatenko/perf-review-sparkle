import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeePeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  quality_score: number | null;
  collaboration_score: number | null;
  communication_score: number | null;
  score: number | null;
  comment: string | null;
  status: string;
  created_at: string;
  reviewer: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

export function useEmployeePeerReviews(employeeId: string | null) {
  const { data: peerReviews = [], isLoading } = useQuery({
    queryKey: ['employee-peer-reviews', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:profiles!peer_reviews_reviewer_id_fkey(
            id,
            full_name,
            role
          )
        `)
        .eq('reviewee_id', employeeId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeePeerReview[];
    },
    enabled: !!employeeId,
  });

  return {
    peerReviews,
    isLoading,
  };
}
