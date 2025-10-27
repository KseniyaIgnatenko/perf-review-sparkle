import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, TrendingUp, Target, Users } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useGoals } from "@/hooks/useGoals";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { reports, isLoading: reportsLoading } = useReports();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { reviewsReceived, isLoading: reviewsLoading } = usePeerReviews();

  const isLoading = reportsLoading || goalsLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
      </div>
    );
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const averageProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0;
  const submittedReviews = reviewsReceived.filter(r => r.status === 'submitted').length;

  const getTypeBadge = (type: string) => {
    const typeMap = {
      personal: { label: "Личный", variant: "default" as const },
      team: { label: "Командный", variant: "secondary" as const },
      company: { label: "Компания", variant: "outline" as const },
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, variant: "default" as const };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="flex items-center gap-2 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            Отчеты и результаты
          </h1>
          <p className="text-muted-foreground text-lg">
            Ваши результаты оценки и персональная статистика
          </p>
        </div>

        {/* Personal Summary */}
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Моя персональная сводка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Прогресс по целям</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{averageProgress}%</span>
                  <span className="text-sm text-muted-foreground">
                    {completedGoals}/{totalGoals} завершено
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Оценка коллег</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{submittedReviews}</span>
                  <span className="text-sm text-muted-foreground">отзывов</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Отчеты</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{reports.length}</span>
                  <span className="text-sm text-muted-foreground">доступно</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Доступные отчеты</h2>
          
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold mb-2">Отчеты пока недоступны</p>
                <p className="text-muted-foreground">
                  Отчеты будут созданы после завершения цикла оценки
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => {
                const typeBadge = getTypeBadge(report.type);
                return (
                  <Card key={report.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            Отчет: {typeBadge.label}
                            <Badge variant={typeBadge.variant}>
                              {typeBadge.label}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {report.period && `Период: ${report.period}`}
                            {report.period && ' • '}
                            Создан: {new Date(report.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                          {report.status === 'ready' ? 'Готов' : 'В процессе'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {report.status === 'ready' && (
                          <>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="w-4 h-4" />
                              Просмотр
                            </Button>
                            <Button size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Скачать
                            </Button>
                          </>
                        )}
                        {report.status === 'in_progress' && (
                          <span className="text-sm text-muted-foreground">
                            Отчет формируется, пожалуйста, подождите
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Development Recommendations */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Рекомендации по развитию</CardTitle>
            <CardDescription>
              Основано на результатах вашей оценки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm leading-relaxed">
                  Рекомендации будут доступны после завершения всех этапов оценки
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
