import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Briefcase, Building2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfiles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useProfile();

  const { data: department } = useQuery({
    queryKey: ['department', profile?.department_id],
    queryFn: async () => {
      if (!profile?.department_id) return null;
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', profile.department_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.department_id,
  });

  const { data: position } = useQuery({
    queryKey: ['position', profile?.position_id],
    queryFn: async () => {
      if (!profile?.position_id) return null;
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('id', profile.position_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.position_id,
  });

  const roleLabels = {
    employee: 'Сотрудник',
    manager: 'Менеджер',
    hr: 'HR специалист',
    admin: 'Администратор',
  };

  const roleVariants = {
    employee: 'secondary',
    manager: 'default',
    hr: 'outline',
    admin: 'destructive',
  } as const;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 mb-2">
            <User className="w-8 h-8 text-primary" />
            Мой профиль
          </h1>
          <p className="text-muted-foreground text-lg">
            Информация о вашем аккаунте и роли в системе
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
                  <CardDescription className="mt-2">
                    Личная информация и контактные данные
                  </CardDescription>
                </div>
                <Badge variant={roleVariants[profile?.role || 'employee']}>
                  <Shield className="w-3 h-3 mr-1" />
                  {roleLabels[profile?.role || 'employee']}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Департамент</p>
                    <p className="font-medium">
                      {department?.name || 'Не назначен'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Должность</p>
                    <p className="font-medium">
                      {position?.name || 'Не назначена'}
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
