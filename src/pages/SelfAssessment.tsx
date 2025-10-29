import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Send, CheckCircle2, FileText, Calendar, ListTodo, Clock, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGoals, useGoalTasks } from "@/hooks/useGoals";
import { useSelfAssessments, useSelfAssessmentAnswers } from "@/hooks/useSelfAssessments";
import { Skeleton } from "@/components/ui/skeleton";
import { StageIndicator } from "@/components/StageIndicator";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function SelfAssessment() {
  const { goals, isLoading: goalsLoading } = useGoals();
  const { assessments, createAssessment, updateAssessment } = useSelfAssessments();
  
  const [selectedGoal, setSelectedGoal] = useState("");
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  
  const { answers, saveAnswer } = useSelfAssessmentAnswers(currentAssessmentId);
  const { tasks } = useGoalTasks(selectedGoal || "");
  
  const [formData, setFormData] = useState({
    results: "",
    contribution: "",
    skills: "",
    improvements: "",
    teamworkScore: 5,
    satisfactionScore: 5,
  });
  const [openAccordion, setOpenAccordion] = useState<string>("");
  const { toast } = useToast();

  // Загружаем данные если есть существующая оценка
  useEffect(() => {
    if (selectedGoal && assessments) {
      const existingAssessment = assessments.find(a => a.goal_id === selectedGoal);
      if (existingAssessment) {
        setCurrentAssessmentId(existingAssessment.id);
      } else {
        // Создаем новую оценку
        createAssessment({ goal_id: selectedGoal }, {
          onSuccess: (data) => {
            setCurrentAssessmentId(data.id);
          }
        });
      }
    }
  }, [selectedGoal, assessments]);

  // Загружаем ответы
  useEffect(() => {
    if (answers && answers.length > 0) {
      const resultsAnswer = answers.find(a => a.question_text === 'results');
      const contributionAnswer = answers.find(a => a.question_text === 'contribution');
      const skillsAnswer = answers.find(a => a.question_text === 'skills');
      const improvementsAnswer = answers.find(a => a.question_text === 'improvements');
      const teamworkAnswer = answers.find(a => a.question_text === 'teamwork');
      const satisfactionAnswer = answers.find(a => a.question_text === 'satisfaction');

      setFormData({
        results: resultsAnswer?.answer_text || "",
        contribution: contributionAnswer?.answer_text || "",
        skills: skillsAnswer?.answer_text || "",
        improvements: improvementsAnswer?.answer_text || "",
        teamworkScore: teamworkAnswer?.score || 5,
        satisfactionScore: satisfactionAnswer?.score || 5,
      });
    }
  }, [answers]);

  // Определяем этапы заполнения
  const stages = [
    {
      label: "Результаты",
      status: formData.results ? "completed" as const : openAccordion === "results" ? "in-progress" as const : "not-started" as const,
    },
    {
      label: "Вклад",
      status: formData.contribution ? "completed" as const : openAccordion === "contribution" ? "in-progress" as const : "not-started" as const,
    },
    {
      label: "Навыки",
      status: formData.skills ? "completed" as const : openAccordion === "skills" ? "in-progress" as const : "not-started" as const,
    },
    {
      label: "Улучшения",
      status: formData.improvements ? "completed" as const : openAccordion === "improvements" ? "in-progress" as const : "not-started" as const,
    },
    {
      label: "Командная работа",
      status: "completed" as const,
    },
    {
      label: "Удовлетворенность",
      status: "completed" as const,
    },
  ];

  const calculateScore = (value: number) => {
    if (value >= 0 && value <= 7) return 1;
    if (value >= 8 && value <= 12) return 2;
    return 3;
  };

  const getScoreLabel = (value: number) => {
    if (value >= 0 && value <= 3) return "Низкое";
    if (value >= 4 && value <= 7) return "Среднее";
    return "Высокое";
  };

  const totalScore =
    calculateScore(formData.teamworkScore) + calculateScore(formData.satisfactionScore);

  const handleSaveDraft = () => {
    if (!currentAssessmentId) return;

    // Сохраняем все ответы
    const answersToSave = [
      { self_assessment_id: currentAssessmentId, question_text: 'results', answer_text: formData.results, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'contribution', answer_text: formData.contribution, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'skills', answer_text: formData.skills, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'improvements', answer_text: formData.improvements, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'teamwork', answer_text: '', score: formData.teamworkScore },
      { self_assessment_id: currentAssessmentId, question_text: 'satisfaction', answer_text: '', score: formData.satisfactionScore },
    ];

    answersToSave.forEach(answer => saveAnswer(answer));

    toast({
      title: "Черновик сохранен",
      description: "Ваши ответы автоматически сохранены",
    });
  };

  const handleSubmit = () => {
    if (!selectedGoal || !formData.results.trim() || !formData.contribution.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля",
      });
      return;
    }

    if (!currentAssessmentId) return;

    // Сохраняем все ответы
    const answersToSave = [
      { self_assessment_id: currentAssessmentId, question_text: 'results', answer_text: formData.results, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'contribution', answer_text: formData.contribution, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'skills', answer_text: formData.skills, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'improvements', answer_text: formData.improvements, score: null },
      { self_assessment_id: currentAssessmentId, question_text: 'teamwork', answer_text: '', score: formData.teamworkScore },
      { self_assessment_id: currentAssessmentId, question_text: 'satisfaction', answer_text: '', score: formData.satisfactionScore },
    ];

    answersToSave.forEach(answer => saveAnswer(answer));

    // Обновляем статус оценки
    updateAssessment({
      id: currentAssessmentId,
      status: 'submitted',
      total_score: totalScore,
    });

    toast({
      title: "Самооценка отправлена",
      description: "Ваша самооценка успешно отправлена",
    });
  };

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  // Доступны все цели кроме черновиков
  const approvedGoals = goals.filter(g => g.status !== 'draft');
  
  // Получаем информацию о существующих самооценках
  const goalsWithAssessments = approvedGoals.map(goal => {
    const assessment = assessments?.find(a => a.goal_id === goal.id);
    return {
      ...goal,
      assessment,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Самооценка</h1>
          <p className="text-muted-foreground text-lg">
            Оцените свою работу за отчетный период
          </p>
        </div>

        {/* Список целей с самооценками */}
        {goalsWithAssessments.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">
                Нет целей для самооценки
              </p>
              <p className="text-muted-foreground">
                Создайте цели и дождитесь их утверждения
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Выберите цель для оценки
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Нажмите на цель, чтобы заполнить самооценку
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {goalsWithAssessments.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  const isCompleted = goal.assessment?.status === 'submitted';
                  const isDraft = goal.assessment?.status === 'draft';
                  
                  return (
                    <div
                      key={goal.id}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all cursor-pointer",
                        isSelected && "border-primary bg-primary/5 shadow-md",
                        !isSelected && "border-border hover:border-primary/50 hover:shadow-sm"
                      )}
                      onClick={() => setSelectedGoal(goal.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {isCompleted && <CheckCircle2 className="w-5 h-5 text-success" />}
                            <h3 className="font-semibold">{goal.title}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {goal.period && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {goal.period}
                              </span>
                            )}
                            {goal.due_date && (
                              <span>
                                до {format(new Date(goal.due_date), "d MMMM yyyy", { locale: ru })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {isCompleted ? (
                            <>
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Отправлено
                              </Badge>
                              {goal.assessment?.total_score && (
                                <span className="text-sm font-semibold text-primary">
                                  Балл: {goal.assessment.total_score}
                                </span>
                              )}
                            </>
                          ) : isDraft ? (
                            <Badge variant="secondary" className="gap-1">
                              <FileEdit className="w-3 h-3" />
                              Черновик
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              Не заполнено
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t text-sm text-primary font-medium">
                          👇 Заполните форму ниже
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedGoal && (
          <>
            {/* Информация о выбранной цели */}
            <Card className="shadow-card bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5" />
                  Задачи по цели
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded border bg-background"
                      >
                        <CheckCircle2
                          className={cn(
                            "w-4 h-4",
                            task.is_done ? "text-success" : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm flex-1",
                            task.is_done && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </span>
                        {task.is_done && (
                          <Badge variant="outline" className="text-xs">
                            Выполнено
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Нет задач для этой цели
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Индикатор прогресса по шагам */}
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <StageIndicator stages={stages} />
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Вопросы для самооценки</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full"
                  value={openAccordion}
                  onValueChange={setOpenAccordion}
                >
                  <AccordionItem value="results">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        {formData.results && <CheckCircle2 className="w-4 h-4 text-success" />}
                        <span>1. Достижение результатов *</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Опишите, какие результаты были достигнуты по этой цели
                      </p>
                      <Textarea
                        placeholder="Опишите ваши достижения..."
                        value={formData.results}
                        onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                        rows={4}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="contribution">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        {formData.contribution && <CheckCircle2 className="w-4 h-4 text-success" />}
                        <span>2. Вклад в команду *</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Как ваша работа повлияла на команду и проект
                      </p>
                      <Textarea
                        placeholder="Опишите ваш вклад..."
                        value={formData.contribution}
                        onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                        rows={4}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="skills">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        {formData.skills && <CheckCircle2 className="w-4 h-4 text-success" />}
                        <span>3. Развитие навыков</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Какие навыки вы развили в течение периода
                      </p>
                      <Textarea
                        placeholder="Опишите развитые навыки..."
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        rows={4}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="improvements">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        {formData.improvements && <CheckCircle2 className="w-4 h-4 text-success" />}
                        <span>4. Области для улучшения</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Что можно улучшить в вашей работе
                      </p>
                      <Textarea
                        placeholder="Опишите области для улучшения..."
                        value={formData.improvements}
                        onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                        rows={4}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="teamwork">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>5. Командная работа</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Оцените вашу командную работу
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {formData.teamworkScore}
                        </span>
                      </div>
                      <Slider
                        value={[formData.teamworkScore]}
                        onValueChange={([value]) =>
                          setFormData({ ...formData, teamworkScore: value })
                        }
                        min={1}
                        max={10}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 - Требует улучшения</span>
                        <span>10 - Отлично</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="satisfaction">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>6. Удовлетворенность работой</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Насколько вы удовлетворены своей работой
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {formData.satisfactionScore}
                        </span>
                      </div>
                      <Slider
                        value={[formData.satisfactionScore]}
                        onValueChange={([value]) =>
                          setFormData({ ...formData, satisfactionScore: value })
                        }
                        min={1}
                        max={10}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 - Не удовлетворен</span>
                        <span>10 - Очень удовлетворен</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="shadow-card border-primary">
              <CardHeader>
                <CardTitle>Итоговая оценка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Общий балл:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">{totalScore}</span>
                    <Badge variant="outline">{getScoreLabel(totalScore)}</Badge>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
                    <Save className="w-4 h-4" />
                    Сохранить черновик
                  </Button>
                  <Button className="gap-2" onClick={handleSubmit}>
                    <Send className="w-4 h-4" />
                    Отправить самооценку
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
