import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, CheckCircle2, Clock, FileEdit, ListTodo, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoals, useGoalTasks } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { getProgressColor, getProgressBarColor } from "@/utils/progressHelpers";

type GoalStatus = 'draft' | 'on_review' | 'approved' | 'completed';

export default function Goals() {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, isCreating, isUpdating } = useGoals();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | GoalStatus>("all");
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

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Прогресс</span>
                        <span className={cn("font-bold", getProgressColor(goal.progress))}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-smooth animate-progress-fill",
                            getProgressBarColor(goal.progress)
                          )}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
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
