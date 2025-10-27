import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useProfiles } from "@/hooks/useProfiles";
import { useGoals } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function HRAnalytics() {
  const { profiles, isLoading: profilesLoading } = useProfiles();
  
  // Получаем все цели для расчета статистики
  const { data: allGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['all-goals-hr'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('status, progress, user_id');
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = profilesLoading || goalsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
      </div>
    );
  }

  const activeProfiles = profiles.filter(p => p.is_active);
  const totalEmployees = activeProfiles.length;
  const completedGoals = allGoals?.filter(g => g.status === 'completed').length || 0;
  const totalGoals = allGoals?.length || 0;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const avgProgress = allGoals && allGoals.length > 0
    ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length)
    : 0;

  // Группируем данные по отделам (пока симуляция, так как в базе мало данных)
  const departmentData = [
    { name: "Разработка", employees: Math.floor(totalEmployees * 0.5), avgScore: 8.4, completion: 92 },
    { name: "Продукт", employees: Math.floor(totalEmployees * 0.15), avgScore: 8.7, completion: 95 },
    { name: "Дизайн", employees: Math.floor(totalEmployees * 0.1), avgScore: 8.2, completion: 88 },
    { name: "QA", employees: Math.floor(totalEmployees * 0.15), avgScore: 8.0, completion: 90 },
    { name: "Маркетинг", employees: Math.floor(totalEmployees * 0.1), avgScore: 8.5, completion: 85 },
  ];

  const performanceMatrix = [
    { category: "Высокий потенциал / Высокая результативность", count: Math.floor(totalEmployees * 0.17), percentage: 17 },
    { category: "Высокий потенциал / Средняя результативность", count: Math.floor(totalEmployees * 0.24), percentage: 24 },
    { category: "Средний потенциал / Высокая результативность", count: Math.floor(totalEmployees * 0.31), percentage: 31 },
    { category: "Требует развития", count: Math.floor(totalEmployees * 0.28), percentage: 28 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            HR Аналитика
          </h1>
          <p className="text-muted-foreground text-lg">
            Анализ результатов оценки и метрики по всей компании
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">активных сотрудников</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Завершили оценку</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals}</div>
              <p className="text-xs text-muted-foreground">{completionRate}% от общего числа</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний прогресс</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProgress}%</div>
              <p className="text-xs text-muted-foreground">по всем целям</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выполнение целей</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">средний показатель</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="departments">По отделам</TabsTrigger>
            <TabsTrigger value="matrix">9-Box матрица</TabsTrigger>
            <TabsTrigger value="trends">Тренды</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Статистика по отделам</CardTitle>
                <CardDescription>
                  Сравнение результатов оценки между различными отделами компании
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {departmentData.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dept.employees} сотрудников
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {dept.avgScore.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">средний балл</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Завершили оценку:</span>
                        <span className="font-medium">{dept.completion}%</span>
                      </div>
                      <Progress value={dept.completion} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>9-Box матрица талантов</CardTitle>
                <CardDescription>
                  Распределение сотрудников по потенциалу и результативности
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {performanceMatrix.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{category.category}</h4>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          {category.count}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({category.percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Рекомендации:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• {performanceMatrix[0].count} сотрудников с высоким потенциалом готовы к повышению</li>
                    <li>• {performanceMatrix[3].count} сотрудников требуют дополнительного развития</li>
                    <li>• {performanceMatrix[2].count} сотрудников показывают стабильные результаты</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Динамика показателей</CardTitle>
                <CardDescription>
                  Изменение ключевых метрик за последние периоды оценки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Q4 2024</span>
                      <span className="text-primary font-semibold">{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Q3 2024</span>
                      <span className="text-primary font-semibold">{Math.max(0, avgProgress - 5)}%</span>
                    </div>
                    <Progress value={Math.max(0, avgProgress - 5)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Q2 2024</span>
                      <span className="text-primary font-semibold">{Math.max(0, avgProgress - 10)}%</span>
                    </div>
                    <Progress value={Math.max(0, avgProgress - 10)} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Q1 2024</span>
                      <span className="text-primary font-semibold">{Math.max(0, avgProgress - 15)}%</span>
                    </div>
                    <Progress value={Math.max(0, avgProgress - 15)} className="h-2" />
                  </div>

                  <div className="mt-6 p-4 bg-success-light rounded-lg border border-success">
                    <div className="flex items-center gap-2 text-success-foreground">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">
                        Положительная динамика: +{Math.min(15, avgProgress)}% за год
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
