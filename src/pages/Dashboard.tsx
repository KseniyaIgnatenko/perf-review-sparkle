import { Navigation } from "@/components/Navigation";
import { StageIndicator } from "@/components/StageIndicator";
import { ProgressCard } from "@/components/ProgressCard";
import { QuickStats } from "@/components/QuickStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ClipboardList, Users, CheckCircle2, Plus, ArrowRight, Star, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProgressColor, getProgressBarColor } from "@/utils/progressHelpers";
import { useGoals } from "@/hooks/useGoals";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { useProfile, useProfiles } from "@/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelfAssessments } from "@/hooks/useSelfAssessments";
import { useManagerFeedback } from "@/hooks/useManagerFeedback";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Этапы оценочного цикла определяются динамически ниже в компоненте

export default function Dashboard() {
  const { user } = useAuth();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { reviewsToWrite, reviewsReceived, isLoading: reviewsLoading, requestReview, isRequesting } = usePeerReviews();
  const { profile, isLoading: profileLoading } = useProfile();
  const { profiles } = useProfiles();
  const { assessments, isLoading: assessmentsLoading } = useSelfAssessments();
  const { feedback: managerFeedback, isLoading: feedbackLoading } = useManagerFeedback();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const isLoading = goalsLoading || reviewsLoading || profileLoading || assessmentsLoading || feedbackLoading;

  // Считаем статистику по целям
  const approvedGoals = goals.filter(g => g.status === 'approved' || g.status === 'completed');
  const totalGoals = goals.length;
  const averageProgress = totalGoals > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
    : 0;

  // Отзывы со статусом pending
  const pendingReviews = reviewsToWrite.filter(r => r.status === 'pending');
  
  // Полученные оценки
  const completedReceivedReviews = reviewsReceived.filter(r => r.status === 'submitted');
  const averageRating = completedReceivedReviews.length > 0
    ? completedReceivedReviews.reduce((sum, r) => sum + (r.score || 0), 0) / completedReceivedReviews.length
    : 0;
  
  // Фильтруем коллег для запроса
  const requestedReviewerIds = reviewsReceived.map(r => r.reviewer_id);
  const availableColleagues = profiles.filter(
    p => !requestedReviewerIds.includes(p.id) && p.id !== user?.id
  );
  
  const handleRequestReview = (reviewerId: string) => {
    requestReview(reviewerId, {
      onSuccess: () => {
        setRequestDialogOpen(false);
      },
    });
  };
  
  // Статус самооценки
  const completedAssessment = assessments.find(a => a.status === 'submitted');
  const totalAssessmentQuestions = 6;
  const answeredQuestions = completedAssessment ? totalAssessmentQuestions : 0;

  // Динамический расчет этапов цикла оценки
  const hasApprovedGoals = approvedGoals.length > 0;
  const hasSelfAssessment = !!completedAssessment;
  const hasReceivedPeerReviews = completedReceivedReviews.length > 0;
  const hasManagerFeedback = !!managerFeedback;

  type StageStatus = "not-started" | "in-progress" | "completed";
  
  const getStageStatus = (condition: boolean, nextStageStarted: boolean, prevStageCompleted: boolean): StageStatus => {
    if (condition) return "completed";
    if (nextStageStarted || prevStageCompleted) return "in-progress";
    return "not-started";
  };

  const stages = [
    { 
      label: "Цели", 
      status: getStageStatus(hasApprovedGoals, false, totalGoals > 0)
    },
    { 
      label: "Самооценка", 
      status: getStageStatus(hasSelfAssessment, false, hasApprovedGoals)
    },
    { 
      label: "Оценка коллег", 
      status: getStageStatus(hasReceivedPeerReviews, false, hasSelfAssessment)
    },
    { 
      label: "Оценка руководителя", 
      status: getStageStatus(hasManagerFeedback, false, hasReceivedPeerReviews)
    },
  ];

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
            progress={completedAssessment ? 100 : 0}
            status={completedAssessment ? "completed" : "not-started"}
          >
            <div className="space-y-4">
              <div className="p-5 rounded-lg bg-gradient-subtle border border-border">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Статус: {completedAssessment ? 'Завершена' : 'Не начата'}
                  </p>
                  <p className="text-2xl font-bold">
                    {assessments.filter(a => a.status === 'submitted').length} / {approvedGoals.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {approvedGoals.length === 1 ? 'цель оценена' : 'целей оценено'}
                  </p>
                  {completedAssessment && completedAssessment.total_score && (
                    <p className="text-sm text-primary mt-2 pt-2 border-t border-border">
                      Средний балл: {(assessments
                        .filter(a => a.status === 'submitted' && a.total_score)
                        .reduce((sum, a) => sum + (a.total_score || 0), 0) / 
                        assessments.filter(a => a.status === 'submitted' && a.total_score).length
                      ).toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              {!completedAssessment && (
                <Button className="w-full gap-2 gradient-primary hover:opacity-90 transition-smooth group" asChild>
                  <Link to="/self-assessment">
                    Начать самооценку
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              {completedAssessment && approvedGoals.length > assessments.filter(a => a.status === 'submitted').length && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link to="/self-assessment">
                    Продолжить оценку целей
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
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
                  Оценка от коллег
                </CardTitle>
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Запросить
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Запросить отзыв от коллеги</DialogTitle>
                      <DialogDescription>
                        Выберите коллегу, у которого хотите запросить отзыв о вашей работе
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableColleagues.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Нет доступных коллег для запроса
                        </p>
                      ) : (
                        availableColleagues.map((colleague) => (
                          <Button
                            key={colleague.id}
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => handleRequestReview(colleague.id)}
                            disabled={isRequesting}
                          >
                            <Send className="w-4 h-4" />
                            {colleague.full_name}
                          </Button>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Средний рейтинг */}
              {completedReceivedReviews.length > 0 ? (
                <div className="p-5 rounded-lg bg-gradient-subtle border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Средний рейтинг:</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Получено отзывов: {completedReceivedReviews.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-lg bg-muted/30">
                  <Star className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm font-medium mb-1">Отзывы пока не получены</p>
                  <p className="text-xs text-muted-foreground">
                    Запросите отзыв у коллег выше
                  </p>
                </div>
              )}

              {/* Статистика "Я оценил" */}
              {reviewsToWrite.filter(r => r.status === 'submitted').length > 0 && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Я оценил коллег:</span>
                    <span className="font-semibold">
                      {reviewsToWrite.filter(r => r.status === 'submitted').length}
                    </span>
                  </div>
                </div>
              )}

              <Button variant="ghost" className="w-full gap-2 hover:bg-primary-light transition-smooth group" asChild>
                <Link to="/peer-review">
                  Все отзывы
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
            <CardHeader>
              <CardTitle>Обратная связь от руководителя</CardTitle>
            </CardHeader>
            <CardContent>
              {managerFeedback ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-lg bg-gradient-subtle border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Итоговая оценка:</span>
                      <span className="text-2xl font-bold text-primary">
                        {managerFeedback.total_score?.toFixed(1) || 'Н/Д'}
                      </span>
                    </div>
                    {managerFeedback.comment && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">Комментарий:</p>
                        <p className="text-sm leading-relaxed">{managerFeedback.comment}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Обновлено: {new Date(managerFeedback.updated_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-gradient-subtle border border-border text-center space-y-2">
                  <p className="text-muted-foreground leading-relaxed">
                    Оценка руководителя будет доступна после завершения самооценки и оценки коллег
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
