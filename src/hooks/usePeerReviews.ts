import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  goal_id: string;
  score: number | null;
  comment: string | null;
  status: 'pending' | 'submitted';
  created_at: string;
  updated_at: string;
}

export function usePeerReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Отзывы, которые нужно написать
  const { data: reviewsToWrite = [], isLoading: isLoadingToWrite } = useQuery({
    queryKey: ['peer-reviews-to-write', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewee:profiles!peer_reviews_reviewee_id_fkey(full_name),
          goal:goals(title)
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Отзывы, которые написали о пользователе
  const { data: reviewsReceived = [], isLoading: isLoadingReceived } = useQuery({
    queryKey: ['peer-reviews-received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:profiles!peer_reviews_reviewer_id_fkey(full_name)
        `)
        .eq('reviewee_id', user.id)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const submitReview = useMutation({
    mutationFn: async ({ id, score, comment }: { id: string; score: number; comment: string }) => {
      const { data, error } = await supabase
        .from('peer_reviews')
        .update({ 
          score, 
          comment, 
          status: 'submitted' 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews-to-write'] });
      toast.success('Отзыв успешно отправлен');
    },
    onError: (error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  return {
    reviewsToWrite,
    reviewsReceived,
    isLoading: isLoadingToWrite || isLoadingReceived,
    submitReview: submitReview.mutate,
    isSubmitting: submitReview.isPending,
  };
}
