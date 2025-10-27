import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Report {
  id: string;
  owner_id: string;
  type: 'personal' | 'team' | 'company';
  status: 'in_progress' | 'ready';
  period: string | null;
  file_url: string | null;
  created_at: string;
  department_id: string | null;
}

export function useReports() {
  const { user } = useAuth();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!user,
  });

  return {
    reports,
    isLoading,
  };
}
