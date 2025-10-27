import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'hr' | 'manager' | 'employee';

export function useUserRoles() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []).map(r => r.role as AppRole);
    },
    enabled: !!user,
  });

  const hasRole = (role: AppRole) => roles.includes(role);
  
  const isManager = hasRole('manager');
  const isHR = hasRole('hr');
  const isAdmin = hasRole('admin');
  const isEmployee = hasRole('employee');

  return {
    roles,
    hasRole,
    isManager,
    isHR,
    isAdmin,
    isEmployee,
    isLoading,
  };
}
