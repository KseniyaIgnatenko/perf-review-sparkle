import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, TrendingUp, Target, Users } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useGoals } from "@/hooks/useGoals";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { reports, isLoading: reportsLoading } = useReports();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { reviewsReceived, isLoading: reviewsLoading } = usePeerReviews();
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-development-recommendations');
      
      if (error) throw error;
      
      if (data?.recommendation) {
        setAiRecommendation(data.recommendation);
        toast({
          title: "Рекомендации сгенерированы",
          description: "AI анализ выполнен успешно",
        });
      }
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сгенерировать рекомендации",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Рекомендации по развитию
                </CardTitle>
                <CardDescription>
                  AI анализ на основе ваших целей, оценок коллег и самооценки
                </CardDescription>
              </div>
              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {aiRecommendation ? 'Обновить' : 'Получить рекомендации'}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!aiRecommendation && !isGenerating && (
              <div className="p-8 rounded-lg bg-muted text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Нажмите кнопку выше, чтобы получить персонализированные рекомендации на основе AI анализа
                </p>
              </div>
            )}
            
            {isGenerating && (
              <div className="p-8 rounded-lg bg-muted text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Анализируем ваши данные и генерируем рекомендации...
                </p>
              </div>
            )}
            
            {aiRecommendation && !isGenerating && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {aiRecommendation.split('\n').map((line, idx) => {
                      if (line.startsWith('#')) {
                        const level = line.match(/^#+/)?.[0].length || 1;
                        const text = line.replace(/^#+\s*/, '');
                        if (level === 1) {
                          return <h3 key={idx} className="text-xl font-bold mt-6 mb-3 first:mt-0">{text}</h3>;
                        }
                        return <h4 key={idx} className="text-lg font-semibold mt-4 mb-2">{text}</h4>;
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <li key={idx} className="ml-4 mb-2">
                            {line.substring(2)}
                          </li>
                        );
                      }
                      if (line.match(/^\d+\./)) {
                        return (
                          <li key={idx} className="ml-4 mb-2 list-decimal">
                            {line.replace(/^\d+\.\s*/, '')}
                          </li>
                        );
                      }
                      if (line.trim() === '') {
                        return <br key={idx} />;
                      }
                      return <p key={idx} className="mb-2">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
