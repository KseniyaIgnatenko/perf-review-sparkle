import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  text: string;
}

interface Goal {
  id: number;
  title: string;
  deadline: string;
  results: string;
  tasks: Task[];
  status: "draft" | "pending" | "approved";
}

const existingGoals: Goal[] = [
  {
    id: 1,
    title: "Повышение качества кода",
    deadline: "Q4 2024",
    results: "Снижение количества багов на 30%, улучшение покрытия тестами до 80%",
    tasks: [
      { id: "1", text: "Внедрить code review процесс" },
      { id: "2", text: "Настроить автоматические тесты" },
      { id: "3", text: "Провести рефакторинг legacy кода" },
    ],
    status: "approved",
  },
  {
    id: 2,
    title: "Развитие лидерских навыков",
    deadline: "до 31 декабря",
    results: "Успешно провести 2 воркшопа, менторить 2 junior разработчиков",
    tasks: [
      { id: "1", text: "Подготовить материалы для воркшопов" },
      { id: "2", text: "Составить план менторства" },
      { id: "3", text: "Получить обратную связь от команды" },
    ],
    status: "approved",
  },
  {
    id: 3,
    title: "Оптимизация процессов разработки",
    deadline: "Q1 2025",
    results: "Сократить время деплоя на 40%, автоматизировать рутинные задачи",
    tasks: [
      { id: "1", text: "Настроить CI/CD пайплайн" },
      { id: "2", text: "Внедрить автоматизацию тестирования" },
    ],
    status: "pending",
  },
];

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(existingGoals);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    results: "",
    tasks: [
      { id: "1", text: "" },
      { id: "2", text: "" },
      { id: "3", text: "" },
    ],
  });

  const statusConfig = {
    draft: { label: "Черновик", color: "bg-warning text-warning-foreground", icon: FileEdit },
    pending: { label: "На проверке", color: "bg-primary text-primary-foreground", icon: Clock },
    approved: { label: "Утверждена", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  };

  const handleAddTask = () => {
    if (formData.tasks.length < 10) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, { id: Date.now().toString(), text: "" }],
      });
    }
  };

  const handleRemoveTask = (id: string) => {
    if (formData.tasks.length > 3) {
      setFormData({
        ...formData,
        tasks: formData.tasks.filter((task) => task.id !== id),
      });
    }
  };

  const handleTaskChange = (id: string, text: string) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.map((task) =>
        task.id === id ? { ...task, text } : task
      ),
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Черновик сохранен",
      description: "Цель сохранена как черновик",
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.deadline.trim() || !formData.results.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля",
      });
      return;
    }

    const emptyTasks = formData.tasks.filter((task) => !task.text.trim());
    if (emptyTasks.length > 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все задачи или удалите пустые",
      });
      return;
    }

    toast({
      title: "Цель отправлена",
      description: "Цель отправлена руководителю на утверждение",
    });
    setIsCreating(false);
    setFormData({
      title: "",
      deadline: "",
      results: "",
      tasks: [
        { id: "1", text: "" },
        { id: "2", text: "" },
        { id: "3", text: "" },
      ],
    });
  };

  if (isCreating || editingId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingId ? "Редактирование цели" : "Создание новой цели"}
                </CardTitle>
                <Badge variant="outline">Цель {goals.length + 1} из 5</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Название цели <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Например: Повышение качества кода"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/100
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Сроки <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadline"
                  placeholder="Например: Q2 2024, до 31 декабря"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">
                  Ожидаемые результаты <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="results"
                  placeholder="Опишите конкретные измеримые результаты..."
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.results.length}/500
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    Ключевые задачи <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTask}
                    disabled={formData.tasks.length >= 10}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить задачу
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.tasks.map((task, index) => (
                    <div key={task.id} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={`Задача ${index + 1}`}
                          value={task.text}
                          onChange={(e) => handleTaskChange(task.id, e.target.value)}
                        />
                      </div>
                      {formData.tasks.length > 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTask(task.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Минимум 3 задачи, максимум 10
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveDraft}
                  className="flex-1"
                >
                  Сохранить черновик
                </Button>
                <Button onClick={handleSubmit} className="flex-1 gradient-primary">
                  Отправить руководителю
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
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Мои цели</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Управление целями на текущий период оценки
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            disabled={goals.length >= 5}
            className="gap-2 gradient-primary"
          >
            <Plus className="w-5 h-5" />
            Добавить цель
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-base px-4 py-2">
            {goals.length} из 5 целей
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Все</Button>
            <Button variant="ghost" size="sm">Черновики</Button>
            <Button variant="ghost" size="sm">На проверке</Button>
            <Button variant="ghost" size="sm">Утвержденные</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const config = statusConfig[goal.status];
            const StatusIcon = config.icon;
            
            return (
              <Card key={goal.id} className="shadow-card transition-smooth hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Срок:</span>
                      <span className="font-medium">{goal.deadline}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ожидаемые результаты:</p>
                    <p className="text-sm text-muted-foreground">{goal.results}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ключевые задачи:</p>
                    <ul className="space-y-1">
                      {goal.tasks.map((task) => (
                        <li key={task.id} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{task.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Редактировать
                    </Button>
                    {goal.status === "draft" && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Удалить
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto text-muted-foreground mb-4 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Пока нет целей</h3>
              <p className="text-muted-foreground mb-6">
                Создайте свою первую цель для начала работы
              </p>
              <Button onClick={() => setIsCreating(true)} className="gap-2 gradient-primary">
                <Plus className="w-5 h-5" />
                Создать цель
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
