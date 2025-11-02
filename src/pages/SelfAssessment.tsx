import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
  const [selectedTask, setSelectedTask] = useState("");
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

  // Загружаем данные если есть существующая оценка для выбранной задачи
  useEffect(() => {
    if (selectedTask && assessments) {
      const existingAssessment = assessments.find(a => a.task_id === selectedTask);
      if (existingAssessment) {
        setCurrentAssessmentId(existingAssessment.id);
      } else {
        // Создаем новую оценку
        createAssessment({ task_id: selectedTask, goal_id: selectedGoal }, {
          onSuccess: (data) => {
            setCurrentAssessmentId(data.id);
          }
        });
      }
    }
  }, [selectedTask, assessments]);

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
    if (!selectedTask || !formData.results.trim() || !formData.contribution.trim()) {
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
        <main className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  // Доступны все цели с завершенными задачами
  const availableGoals = goals.filter(goal => goal.status !== 'draft');
  
  // Получаем информацию о существующих самооценках по задачам
  const currentGoal = availableGoals.find(g => g.id === selectedGoal);
  const tasksWithAssessments = tasks?.map(task => {
    const assessment = assessments?.find(a => a.task_id === task.id);
    return {
      ...task,
      assessment,
    };
  }) || [];
  
  // Проверяем статус текущей самооценки
  const currentAssessment = assessments?.find(a => a.id === currentAssessmentId);
  const isSubmitted = currentAssessment?.status === 'submitted';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Самооценка</h1>
          <p className="text-muted-foreground">
            Оцените свою работу за отчетный период
          </p>
        </div>

        {/* Инструкция */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-foreground">💡 Как проводить самооценку</p>
              <div className="space-y-2 text-muted-foreground">
                <p>Выберите цель и задачу из списка ниже. Самооценка проводится по каждой задаче отдельно.</p>
                <p>Опишите результат по задаче — что было достигнуто, какие улучшения реализованы и как это повлияло на показатели. Прикрепите ссылку на рабочее пространство (доску задач, репозиторий, документ и т. п.), где можно увидеть подтверждение прогресса.</p>
                <p>Укажите личный вклад и влияние на общий результат (желательно с конкретными метриками). Оцените себя по командной работе, вовлечённости и удовлетворённости результатом.</p>
                <p>Сохраните черновик и при необходимости вернитесь позже или отправьте готовую версию. После отправки самооценка будет учтена при общей оценке эффективности.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Выбор цели */}
        {availableGoals.length === 0 ? (
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
          <>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Шаг 1: Выберите цель
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableGoals.map((goal) => {
                    const isSelected = selectedGoal === goal.id;
                    
                    return (
                      <div
                        key={goal.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all cursor-pointer",
                          isSelected && "border-primary bg-primary/5 shadow-md",
                          !isSelected && "border-border hover:border-primary/50 hover:shadow-sm"
                        )}
                        onClick={() => {
                          setSelectedGoal(goal.id);
                          setSelectedTask("");
                          setCurrentAssessmentId(null);
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
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
                        </div>
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t text-sm text-primary font-medium">
                            👇 Выберите задачу ниже
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Выбор задачи */}
            {selectedGoal && tasksWithAssessments.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    Шаг 2: Выберите задачу для оценки
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Нажмите на задачу, чтобы заполнить самооценку
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasksWithAssessments.map((task) => {
                      const isSelected = selectedTask === task.id;
                      const isCompleted = task.assessment?.status === 'submitted';
                      const isDraft = task.assessment?.status === 'draft';
                      
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all cursor-pointer",
                            isSelected && "border-primary bg-primary/5 shadow-md",
                            !isSelected && "border-border hover:border-primary/50 hover:shadow-sm"
                          )}
                          onClick={() => setSelectedTask(task.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                {task.is_done && <CheckCircle2 className="w-5 h-5 text-success" />}
                                <h3 className="font-semibold">{task.title}</h3>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {isCompleted ? (
                                <>
                                  <Badge variant="default" className="gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Отправлено
                                  </Badge>
                                  {task.assessment?.total_score && (
                                    <span className="text-sm font-semibold text-primary">
                                      Балл: {task.assessment.total_score}
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
          </>
        )}

        {selectedTask && (
          <>
            {/* Индикатор прогресса по шагам */}
            {!isSubmitted && (
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <StageIndicator stages={stages} />
                </CardContent>
              </Card>
            )}

            {/* Уведомление об отправленной оценке */}
            {isSubmitted && (
              <Card className="shadow-card bg-success/5 border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-semibold text-foreground">Самооценка отправлена</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Эта самооценка уже отправлена и недоступна для редактирования. 
                        Выберите другую задачу для оценки.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Форма самооценки */}
            {!isSubmitted && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Анкета самооценки</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Заполните все разделы анкеты. Поля помеченные * обязательны для заполнения.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Accordion
                    type="single"
                    collapsible
                    value={openAccordion}
                    onValueChange={setOpenAccordion}
                  >
                    <AccordionItem value="results">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>1. Достигнутые результаты по задаче *</span>
                          {formData.results && (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Опишите, что вы сделали для выполнения этой задачи, какие результаты были достигнуты
                        </p>
                        <Textarea
                          value={formData.results}
                          onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                          placeholder="Опишите достигнутые результаты..."
                          rows={6}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="contribution">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>2. Вклад в команду *</span>
                          {formData.contribution && (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Расскажите, как ваша работа по этой задаче помогла команде, коллегам или проекту в целом
                        </p>
                        <Textarea
                          value={formData.contribution}
                          onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                          placeholder="Опишите ваш вклад..."
                          rows={6}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="skills">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>3. Развитие навыков</span>
                          {formData.skills && (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Какие новые навыки вы приобрели или развили в процессе выполнения этой задачи
                        </p>
                        <Textarea
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          placeholder="Опишите развитые навыки..."
                          rows={6}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="improvements">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>4. Планы по улучшению</span>
                          {formData.improvements && (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Что вы планируете улучшить в следующем периоде на основе опыта выполнения этой задачи
                        </p>
                        <Textarea
                          value={formData.improvements}
                          onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                          placeholder="Опишите планы по улучшению..."
                          rows={6}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="teamwork">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>5. Командная работа</span>
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Оцените качество взаимодействия с коллегами при выполнении задачи
                          </p>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[formData.teamworkScore]}
                              onValueChange={(value) =>
                                setFormData({ ...formData, teamworkScore: value[0] })
                              }
                              min={0}
                              max={10}
                              step={1}
                              className="flex-1"
                            />
                            <Badge variant="outline" className="min-w-[80px] justify-center">
                              {formData.teamworkScore}/10
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {getScoreLabel(formData.teamworkScore)}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="satisfaction">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>6. Удовлетворенность работой</span>
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Насколько вы удовлетворены результатами работы над этой задачей
                          </p>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[formData.satisfactionScore]}
                              onValueChange={(value) =>
                                setFormData({ ...formData, satisfactionScore: value[0] })
                              }
                              min={0}
                              max={10}
                              step={1}
                              className="flex-1"
                            />
                            <Badge variant="outline" className="min-w-[80px] justify-center">
                              {formData.satisfactionScore}/10
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {getScoreLabel(formData.satisfactionScore)}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                      Общий балл: <span className="font-semibold">{totalScore}/6</span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Сохранить черновик
                      </Button>
                      <Button onClick={handleSubmit} className="gap-2">
                        <Send className="w-4 h-4" />
                        Отправить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
