import { Navigation } from "@/components/Navigation";
import { StageIndicator } from "@/components/StageIndicator";
import { ProgressCard } from "@/components/ProgressCard";
import { QuickStats } from "@/components/QuickStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ClipboardList, Users, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProgressColor, getProgressBarColor } from "@/utils/progressHelpers";
import { useGoals } from "@/hooks/useGoals";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { useProfile } from "@/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";

const stages = [
  { label: "Цели", status: "in-progress" as const },
  { label: "Самооценка", status: "not-started" as const },
  { label: "Оценка", status: "not-started" as const },
  { label: "Итоги", status: "not-started" as const },
];

export default function Dashboard() {
  const { goals, isLoading: goalsLoading } = useGoals();
  const { reviewsToWrite, isLoading: reviewsLoading } = usePeerReviews();
  const { profile, isLoading: profileLoading } = useProfile();

  const isLoading = goalsLoading || reviewsLoading || profileLoading;

  // Считаем статистику по целям
  const approvedGoals = goals.filter(g => g.status === 'approved' || g.status === 'completed');
  const totalGoals = goals.length;
  const averageProgress = totalGoals > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0;

  // Отзывы со статусом pending
  const pendingReviews = reviewsToWrite.filter(r => r.status === 'pending');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold">
            Добро пожаловать, {profile?.full_name || 'Пользователь'}!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Отслеживайте прогресс и управляйте своим развитием
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Stage Progress */}
        <Card className="shadow-card transition-smooth hover:shadow-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Прогресс цикла оценки</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <StageIndicator stages={stages} />
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* My Goals */}
          <ProgressCard
            title="Мои цели"
            icon={<Target className="w-5 h-5" />}
            progress={averageProgress}
            status={totalGoals > 0 ? "in-progress" : "not-started"}
            className="lg:col-span-2"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {approvedGoals.length} {approvedGoals.length === 1 ? 'цель' : 'целей'} утверждено
                </span>
                <Button size="sm" className="gap-2" asChild>
                  <Link to="/goals">
                    <Plus className="w-4 h-4" />
                    Добавить цель
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {approvedGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{goal.title}</p>
                          {goal.status === 'approved' && (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-smooth animate-progress-fill",
                                getProgressBarColor(goal.progress)
                              )}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-xs font-bold min-w-[2.5rem] text-right",
                            getProgressColor(goal.progress)
                          )}>
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {totalGoals === 0 && (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>У вас пока нет целей</p>
                  </div>
                )}
              </div>

              <Button variant="ghost" className="w-full gap-2 hover:bg-primary-light transition-smooth group" asChild>
                <Link to="/goals">
                  Все цели
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </ProgressCard>

          {/* Self Assessment */}
          <ProgressCard
            title="Самооценка"
            icon={<ClipboardList className="w-5 h-5" />}
            progress={0}
            status="not-started"
          >
            <div className="space-y-4">
              <div className="p-5 rounded-lg bg-gradient-subtle border border-border text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Статус: Не начата
                </p>
                <p className="text-xl font-bold">0/6 вопросов</p>
              </div>
              <Button className="w-full gap-2 gradient-primary hover:opacity-90 transition-smooth group" asChild>
                <Link to="/self-assessment">
                  Начать самооценку
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </ProgressCard>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Оценка коллег
                </CardTitle>
                {pendingReviews.length > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {pendingReviews.length} {pendingReviews.length === 1 ? 'новый' : 'новых'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingReviews.length > 0 ? (
                pendingReviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border border-border bg-gradient-subtle space-y-3 hover:border-primary/30 transition-smooth hover:shadow-sm">
                    <p className="font-semibold">
                      {(review as any).reviewee?.full_name} просит оценить работу
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Цель: {(review as any).goal?.title}
                    </p>
                    <Button size="sm" variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth" asChild>
                      <Link to="/peer-review">Перейти к оценке</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>Нет запросов на оценку</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
            <CardHeader>
              <CardTitle>Обратная связь от руководителя</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-gradient-subtle border border-border text-center space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  Оценка руководителя будет доступна после завершения самооценки и оценки коллег
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
