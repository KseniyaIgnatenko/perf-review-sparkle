import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare, ArrowLeft, Users, Target, CheckCircle2 } from "lucide-react";
import { useManagerFeedback } from "@/hooks/useManagerFeedback";
import { useProfile } from "@/hooks/useProfiles";
import { useEmployeePeerReviews } from "@/hooks/useEmployeePeerReviews";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ManagerFeedback() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const employeeName = searchParams.get('employeeName');
  const navigate = useNavigate();
  
  const [resultAchievementScore, setResultAchievementScore] = useState<string>("");
  const [personalQualities, setPersonalQualities] = useState("");
  const [personalContribution, setPersonalContribution] = useState("");
  const [collaborationQualityScore, setCollaborationQualityScore] = useState<string>("");
  const [improvementFeedback, setImprovementFeedback] = useState("");
  const [totalScore, setTotalScore] = useState<string>("");
  const [comment, setComment] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  
  const { submitFeedback, isSubmitting } = useManagerFeedback();
  const { profile, isLoading: profileLoading } = useProfile();
  const { peerReviews, isLoading: reviewsLoading } = useEmployeePeerReviews(employeeId);
  
  // Fetch employee's goals with tasks
  const { data: employeeGoals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['employee-goals', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          goal_tasks (
            id,
            title,
            is_done
          )
        `)
        .eq('user_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Set default goal if only one exists
  useEffect(() => {
    if (employeeGoals.length === 1) {
      setSelectedGoalId(employeeGoals[0].id);
    }
  }, [employeeGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !resultAchievementScore || !collaborationQualityScore || !totalScore) {
      return;
    }

    const combinedFeedback = `Личные качества: ${personalQualities}\n\nЛичный вклад: ${personalContribution}`;
    
    submitFeedback(
      {
        employeeId,
        totalScore: parseFloat(totalScore),
        resultAchievementScore: parseFloat(resultAchievementScore),
        collaborationQualityScore: parseFloat(collaborationQualityScore),
        strengthsFeedback: combinedFeedback,
        improvementFeedback,
        comment,
        goalId: selectedGoalId || undefined,
      },
      {
        onSuccess: () => {
          navigate("/manager");
        },
      }
    );
  };

  const getRatingLabel = (score: number) => {
    if (score >= 0 && score <= 2) return "Нет результата";
    if (score >= 3 && score <= 5) return "Низкий результат";
    if (score >= 6 && score <= 8) return "Хороший результат";
    if (score >= 9 && score <= 10) return "Сверхрезультат";
    return "";
  };

  if (profileLoading || reviewsLoading || goalsLoading) {
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

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg font-semibold mb-2">Ошибка</p>
              <p className="text-muted-foreground">Не указан сотрудник для оценки</p>
              <Button className="mt-4" onClick={() => navigate("/manager")}>
                Вернуться к панели менеджера
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2" 
          onClick={() => navigate("/manager")}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к панели менеджера
        </Button>

        <div className="space-y-6">
          {/* Instructions */}
          <Card className="shadow-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageSquare className="w-6 h-6 text-primary" />
                Оценка сотрудника: {employeeName || 'Сотрудник'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription className="text-base leading-relaxed">
                  <p className="mb-3">
                    Сотрудник работал над задачами в течение периода оценки, по результатам выполнения которых коллеги делились обратной связью.
                  </p>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Ознакомьтесь с обратной связью от коллег</li>
                    <li>Сформируйте общую обратную связь, которая содержит обратную связь коллег и вашу личную обратную связь</li>
                    <li>Поделитесь обратной связью по формату, указанному ниже</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Employee's Goals and Tasks */}
          {employeeGoals.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Цели и задачи сотрудника
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employeeGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedGoalId === goal.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                        )}
                        
                        {/* Goal Tasks */}
                        {goal.goal_tasks && goal.goal_tasks.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Задачи:</p>
                            <ul className="space-y-1.5">
                              {goal.goal_tasks.map((task: any) => (
                                <li key={task.id} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 
                                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                      task.is_done ? 'text-green-600' : 'text-muted-foreground'
                                    }`}
                                  />
                                  <span className={task.is_done ? 'line-through text-muted-foreground' : ''}>
                                    {task.title}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedGoalId === goal.id ? "default" : "outline"}
                        onClick={() => setSelectedGoalId(goal.id)}
                      >
                        {selectedGoalId === goal.id ? "Выбрано" : "Выбрать"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Peer Reviews */}
          {peerReviews.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Обратная связь от коллег
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {peerReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {review.reviewer?.full_name || 'Аноним'}
                      </p>
                      <div className="flex gap-2 text-sm">
                        {review.quality_score && (
                          <span className="px-2 py-1 bg-primary/10 rounded">
                            Качество: {review.quality_score}/10
                          </span>
                        )}
                        {review.collaboration_score && (
                          <span className="px-2 py-1 bg-primary/10 rounded">
                            Сотрудничество: {review.collaboration_score}/10
                          </span>
                        )}
                        {review.communication_score && (
                          <span className="px-2 py-1 bg-primary/10 rounded">
                            Коммуникация: {review.communication_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Feedback Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Обратная связь руководителя</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resultAchievementScore" className="text-base">
                    Вопрос 1: Насколько сотруднику удалось достичь результатов, которые были запланированы по задаче? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="resultAchievementScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={resultAchievementScore}
                    onChange={(e) => setResultAchievementScore(e.target.value)}
                    placeholder="Введите оценку от 0 до 10"
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Шкала: 0 - результаты не достигнуты, 10 - все результаты полностью достигнуты
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalQualities" className="text-base">
                    Вопрос 2: Прокомментируйте, какие личные качества помогли сотруднику достичь результата
                  </Label>
                  <Textarea
                    id="personalQualities"
                    value={personalQualities}
                    onChange={(e) => setPersonalQualities(e.target.value)}
                    placeholder="Опишите личные качества сотрудника, которые помогли достичь результата"
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalContribution" className="text-base">
                    Вопрос 3: Какой личный вклад вы можете выделить в результатах сотрудника
                  </Label>
                  <Textarea
                    id="personalContribution"
                    value={personalContribution}
                    onChange={(e) => setPersonalContribution(e.target.value)}
                    placeholder="Опишите конкретный вклад сотрудника в достижение результатов"
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collaborationQualityScore" className="text-base">
                    Вопрос 4: Оцените качество взаимодействия по общей оценке коллег <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="collaborationQualityScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={collaborationQualityScore}
                    onChange={(e) => setCollaborationQualityScore(e.target.value)}
                    placeholder="Введите оценку от 0 до 10"
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Шкала: 0 - низкое качество взаимодействия, 10 - отличное взаимодействие
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvementFeedback" className="text-base">
                    Вопрос 5: Что вы порекомендуете улучшить сотруднику в следующем цикле
                  </Label>
                  <Textarea
                    id="improvementFeedback"
                    value={improvementFeedback}
                    onChange={(e) => setImprovementFeedback(e.target.value)}
                    placeholder="Укажите рекомендации по улучшению работы сотрудника"
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalScore" className="text-base">
                    Вопрос 6: Общий рейтинг <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="totalScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={totalScore}
                    onChange={(e) => setTotalScore(e.target.value)}
                    placeholder="Введите оценку от 0 до 10"
                    required
                    className="text-lg"
                  />
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium">Шкала рейтинга:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>0-2 - Нет результата</li>
                      <li>3-5 - Низкий результат</li>
                      <li>6-8 - Хороший результат</li>
                      <li>9-10 - Сверхрезультат</li>
                    </ul>
                    {totalScore && (
                      <p className="font-semibold text-primary mt-2">
                        Выбранная оценка: {getRatingLabel(parseFloat(totalScore))}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-base">
                    Общая обратная связь (опционально)
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Дополнительные комментарии и общие рекомендации..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    <p className="font-semibold mb-2">Следующие шаги:</p>
                    <p>
                      После заполнения формы обсудите с сотрудником обратную связь в формате 1:1. Вместе проговорите полученные результаты и запланируйте шаги для развития.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/manager")}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !resultAchievementScore || !collaborationQualityScore || !totalScore}
                    className="flex-1"
                  >
                    {isSubmitting ? "Сохранение..." : "Сохранить оценку"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
