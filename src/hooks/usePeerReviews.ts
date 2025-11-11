import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  goal_id: string | null;
  task_id: string | null;
  score: number | null;
  comment: string | null;
  collaboration_score: number | null;
  quality_score: number | null;
  communication_score: number | null;
  status: 'pending' | 'submitted';
  created_at: string;
  updated_at: string;
  reviewer?: {
    full_name: string;
    position?: {
      name: string;
    };
  };
  reviewee?: {
    full_name: string;
    position?: {
      name: string;
    };
  };
  goal?: {
    title: string;
  };
  task?: {
    title: string;
  };
}

export function usePeerReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Отзывы, которые нужно написать (запросы от коллег)
  const { data: reviewsToWrite = [], isLoading: isLoadingToWrite } = useQuery({
    queryKey: ['peer-reviews-to-write', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewee:profiles!peer_reviews_reviewee_id_fkey(
            full_name,
            position:positions(name)
          ),
          goal:goals(title),
          task:goal_tasks(title)
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
          reviewer:profiles!peer_reviews_reviewer_id_fkey(
            full_name,
            position:positions(name)
          ),
          goal:goals(title),
          task:goal_tasks(title)
        `)
        .eq('reviewee_id', user.id)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Запросы, отправленные коллегам (ожидают оценки)
  const { data: requestsSent = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['peer-reviews-requests-sent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:profiles!peer_reviews_reviewer_id_fkey(
            full_name,
            position:positions(name)
          ),
          goal:goals(title),
          task:goal_tasks(title)
        `)
        .eq('reviewee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Запрос отзыва от коллеги
  const requestReview = useMutation({
    mutationFn: async ({ 
      reviewerId, 
      goalId, 
      taskId 
    }: { 
      reviewerId: string; 
      goalId?: string; 
      taskId?: string; 
    }) => {
      const { data, error } = await supabase
        .from('peer_reviews')
        .insert({
          reviewer_id: reviewerId,
          reviewee_id: user!.id,
          goal_id: goalId || null,
          task_id: taskId || null,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews-received'] });
      queryClient.invalidateQueries({ queryKey: ['peer-reviews-requests-sent'] });
      toast.success('Запрос на отзыв отправлен');
    },
    onError: (error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  const submitReview = useMutation({
    mutationFn: async ({ 
      id, 
      collaboration_score, 
      quality_score, 
      communication_score, 
      comment 
    }: { 
      id: string; 
      collaboration_score: number; 
      quality_score: number; 
      communication_score: number; 
      comment: string;
    }) => {
      const score = (collaboration_score + quality_score + communication_score) / 3;
      const { data, error } = await supabase
        .from('peer_reviews')
        .update({ 
          collaboration_score,
          quality_score,
          communication_score,
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
    requestsSent,
    isLoading: isLoadingToWrite || isLoadingReceived || isLoadingRequests,
    requestReview: requestReview.mutate,
    isRequesting: requestReview.isPending,
    submitReview: submitReview.mutate,
    isSubmitting: submitReview.isPending,
  };
}
