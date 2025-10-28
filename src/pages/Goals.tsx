import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Plus, X, CheckCircle2, Clock, FileEdit, ListTodo, Archive, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoals, useGoalTasks } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { getProgressColor, getProgressBarColor } from "@/utils/progressHelpers";

const GoalTasks = ({ goalId, status }: { goalId: string; status: string }) => {
  const { tasks, isLoading, addTask, updateTask } = useGoalTasks(goalId);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ goalId, title: newTaskTitle });
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleToggleTask = async (taskId: string, isDone: boolean) => {
    await updateTask({ id: taskId, goalId, is_done: !isDone });
  };

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }

  const isDraft = status === 'draft';

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Задачи</p>
      {tasks.length === 0 && !isAddingTask && (
        <p className="text-sm text-muted-foreground">Нет задач</p>
      )}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 p-2 rounded border">
            <Checkbox
              checked={task.is_done}
              onCheckedChange={() => handleToggleTask(task.id, task.is_done)}
              disabled={!isDraft}
            />
            <span className={cn("text-sm flex-1", task.is_done && "line-through text-muted-foreground")}>
              {task.title}
            </span>
          </div>
        ))}
        {isAddingTask && (
          <div className="flex gap-2">
            <Input
              placeholder="Название задачи"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button size="sm" onClick={handleAddTask}>
              Добавить
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setIsAddingTask(false);
              setNewTaskTitle("");
            }}>
              Отмена
            </Button>
          </div>
        )}
      </div>
      {isDraft && !isAddingTask && tasks.length < 10 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTask(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить задачу
        </Button>
      )}
    </div>
  );
};

type GoalStatus = 'draft' | 'on_review' | 'approved' | 'completed';

export default function Goals() {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, isCreating, isUpdating } = useGoals();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | GoalStatus>("all");
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    description: "",
    period: "",
  });

  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const, icon: FileEdit },
    on_review: { label: "На проверке", variant: "default" as const, icon: Clock },
    approved: { label: "Утверждена", variant: "outline" as const, icon: CheckCircle2 },
    completed: { label: "Завершена", variant: "outline" as const, icon: Archive },
  };

  const filteredGoals = filter === "all" ? goals : goals.filter((g) => g.status === filter);

  const statusCounts = {
    all: goals.length,
    draft: goals.filter((g) => g.status === "draft").length,
    on_review: goals.filter((g) => g.status === "on_review").length,
    approved: goals.filter((g) => g.status === "approved").length,
    completed: goals.filter((g) => g.status === "completed").length,
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните название цели",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateGoal({
        id: editingId,
        title: formData.title,
        description: formData.description,
        due_date: formData.deadline || null,
        period: formData.period || null,
        status: 'draft',
      });
    } else {
      createGoal({
        title: formData.title,
        description: formData.description,
        due_date: formData.deadline || null,
        period: formData.period || null,
        status: 'draft',
      });
    }

    setFormData({ title: "", deadline: "", description: "", period: "" });
    setIsCreatingNew(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateGoal({
        id: editingId,
        title: formData.title,
        description: formData.description,
        due_date: formData.deadline || null,
        period: formData.period || null,
        status: 'on_review',
      });
    } else {
      createGoal({
        title: formData.title,
        description: formData.description,
        due_date: formData.deadline || null,
        period: formData.period || null,
        status: 'on_review',
      });
    }

    setFormData({ title: "", deadline: "", description: "", period: "" });
    setIsCreatingNew(false);
    setEditingId(null);
  };

  const handleEdit = (goal: typeof goals[0]) => {
    setEditingId(goal.id);
    setFormData({
      title: goal.title,
      deadline: goal.due_date || "",
      description: goal.description || "",
      period: goal.period || "",
    });
    setIsCreatingNew(true);
  };

  const handleCancel = () => {
    setFormData({ title: "", deadline: "", description: "", period: "" });
    setIsCreatingNew(false);
    setEditingId(null);
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    updateGoal({
      id: goalId,
      progress,
    });
    setEditingProgress(null);
  };

  const handleCompleteGoal = (goalId: string) => {
    updateGoal({
      id: goalId,
      status: 'completed',
      progress: 100,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
      </div>
    );
  }

  if (isCreatingNew || editingId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {editingId ? "Редактировать цель" : "Создание новой цели"}
            </h1>
            <p className="text-muted-foreground">
              {editingId ? "Внесите изменения в вашу цель" : "Определите ваши цели на период оценки"}
            </p>
          </div>

          <Card className="shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Название цели *</Label>
                <Input
                  id="title"
                  placeholder="Например: Повышение качества кода"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Срок выполнения</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Период</Label>
                  <Input
                    id="period"
                    placeholder="Например: Q4 2024"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание и ожидаемые результаты *</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите цель и результаты, которых хотите достичь..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={handleCancel}>
                  Отменить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft}
                  disabled={isCreating || isUpdating}
                >
                  Сохранить черновик
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                >
                  Отправить на утверждение
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="flex items-center gap-2 mb-2">
              <ListTodo className="w-8 h-8 text-primary" />
              Мои цели
            </h1>
            <p className="text-muted-foreground text-lg">
              Управление вашими целями и задачами
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreatingNew(true)}>
            <Plus className="w-4 h-4" />
            Добавить цель
          </Button>
        </div>

        {/* Инструкция */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-foreground">💡 Как работает прогресс целей:</p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>• <strong>Добавьте задачи</strong> к вашей цели для автоматического расчета прогресса</li>
                <li>• Отмечайте задачи как выполненные ✓ - прогресс обновится автоматически</li>
                <li>• Или используйте кнопку <TrendingUp className="w-3 h-3 inline" /> для ручного обновления прогресса</li>
                <li>• При 100% прогресса появится кнопка "Отметить как завершенную"</li>
                <li>• Завершенные цели будут доступны для самооценки на соответствующей странице</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="all">
              Все ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Черновики ({statusCounts.draft})
            </TabsTrigger>
            <TabsTrigger value="on_review">
              На проверке ({statusCounts.on_review})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Утверждены ({statusCounts.approved})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Завершены ({statusCounts.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredGoals.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="w-8 h-8" />}
            title="Нет целей"
            description={
              filter === "all"
                ? "Создайте свою первую цель, чтобы начать"
                : `Нет целей со статусом "${statusConfig[filter as GoalStatus]?.label}"`
            }
            onAction={filter === "all" ? () => setIsCreatingNew(true) : undefined}
            actionLabel={filter === "all" ? "Создать цель" : undefined}
          />
        ) : (
          <div className="grid gap-6">
            {filteredGoals.map((goal) => {
              const config = statusConfig[goal.status];
              const Icon = config.icon;

              return (
                <Card key={goal.id} className="shadow-card hover:shadow-hover transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <CardTitle className="text-xl">{goal.title}</CardTitle>
                        </div>
                        {(goal.period || goal.due_date) && (
                          <div className="flex gap-3 text-sm text-muted-foreground">
                            {goal.period && <span>Период: {goal.period}</span>}
                            {goal.due_date && <span>Срок: {new Date(goal.due_date).toLocaleDateString()}</span>}
                          </div>
                        )}
                      </div>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {goal.description && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Описание
                        </p>
                        <p className="text-sm leading-relaxed">{goal.description}</p>
                      </div>
                    )}

                    <GoalTasks goalId={goal.id} status={goal.status} />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Прогресс выполнения</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", getProgressColor(goal.progress))}>
                            {goal.progress}%
                          </span>
                          {(goal.status === 'approved' || goal.status === 'draft') && editingProgress !== goal.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProgress(goal.id);
                                setTempProgress(goal.progress);
                              }}
                              className="h-6 px-2"
                            >
                              <TrendingUp className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {editingProgress === goal.id ? (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Slider
                              value={[tempProgress]}
                              onValueChange={([value]) => setTempProgress(value)}
                              max={100}
                              step={5}
                              className="flex-1"
                            />
                            <span className="text-sm font-semibold min-w-[3rem] text-right">
                              {tempProgress}%
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProgress(null)}
                            >
                              Отмена
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateProgress(goal.id, tempProgress)}
                            >
                              Сохранить
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-smooth animate-progress-fill",
                              getProgressBarColor(goal.progress)
                            )}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      )}

                      {goal.progress === 100 && goal.status !== 'completed' && (
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleCompleteGoal(goal.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Отметить как завершенную
                        </Button>
                      )}
                    </div>

                    {goal.status === 'draft' && (
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
