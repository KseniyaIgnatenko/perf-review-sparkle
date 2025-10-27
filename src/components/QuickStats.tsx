import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { Skeleton } from "@/components/ui/skeleton";

export const QuickStats = () => {
  const { goals, isLoading: goalsLoading } = useGoals();
  const { reviewsReceived, isLoading: reviewsLoading } = usePeerReviews();

  if (goalsLoading || reviewsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const averageProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0;
  const totalReviews = reviewsReceived.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Выполнено целей</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedGoals}/{totalGoals}</div>
          <p className="text-xs text-muted-foreground mt-1">
            в текущем периоде
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Прогресс</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageProgress}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            средний по всем целям
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Обратная связь</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReviews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            отзывов получено
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
