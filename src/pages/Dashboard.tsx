import { Navigation } from "@/components/Navigation";
import { StageIndicator } from "@/components/StageIndicator";
import { ProgressCard } from "@/components/ProgressCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ClipboardList, Users, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const stages = [
  { label: "Цели", status: "in-progress" as const },
  { label: "Самооценка", status: "not-started" as const },
  { label: "Оценка", status: "not-started" as const },
  { label: "Итоги", status: "not-started" as const },
];

const recentGoals = [
  { id: 1, title: "Повышение качества кода", progress: 75, approved: true },
  { id: 2, title: "Развитие лидерских навыков", progress: 50, approved: true },
  { id: 3, title: "Оптимизация процессов разработки", progress: 30, approved: false },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Добро пожаловать, Александр!</h1>
          <p className="text-muted-foreground text-lg">
            Отслеживайте прогресс и управляйте своим развитием
          </p>
        </div>

        {/* Stage Progress */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Прогресс цикла оценки</CardTitle>
          </CardHeader>
          <CardContent>
            <StageIndicator stages={stages} />
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Goals */}
          <ProgressCard
            title="Мои цели"
            icon={<Target className="w-5 h-5" />}
            progress={60}
            status="in-progress"
            className="lg:col-span-2"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">3 цели из 5</span>
                <Button size="sm" className="gap-2" asChild>
                  <Link to="/goals">
                    <Plus className="w-4 h-4" />
                    Добавить цель
                  </Link>
                </Button>
              </div>

              <div className="space-y-2">
                {recentGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-base cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{goal.title}</p>
                          {goal.approved && (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-smooth"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" className="w-full gap-2" asChild>
                <Link to="/goals">
                  Все цели
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </ProgressCard>

          {/* Self Assessment */}
          <ProgressCard
            title="Самооценка"
            icon={<ClipboardList className="w-5 h-5" />}
            progress={0}
            status="not-started"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Статус: Не начата
                </p>
                <p className="text-lg font-semibold">0/6 вопросов</p>
              </div>
              <Button className="w-full gap-2" asChild>
                <Link to="/self-assessment">
                  Начать самооценку
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </ProgressCard>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Оценка коллег
                </CardTitle>
                <Badge className="bg-destructive text-destructive-foreground">
                  2 новых
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <p className="font-medium">Петр Иванов просит оценить его работу</p>
                <p className="text-sm text-muted-foreground">Срок: до 15 декабря</p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/peer-review">Перейти к оценке</Link>
                </Button>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <p className="font-medium">Мария Смирнова запросила обратную связь</p>
                <p className="text-sm text-muted-foreground">Срок: до 18 декабря</p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/peer-review">Перейти к оценке</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Обратная связь от руководителя</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-muted/50 text-center space-y-2">
                <p className="text-muted-foreground">
                  Оценка руководителя будет доступна после завершения самооценки и оценки коллег
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
