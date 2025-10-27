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
        <div className="space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold">Добро пожаловать, Александр!</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Отслеживайте прогресс и управляйте своим развитием
          </p>
        </div>

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

              <div className="space-y-3">
                {recentGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{goal.title}</p>
                          {goal.approved && (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary transition-smooth animate-progress-fill"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground min-w-[2.5rem] text-right">
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
            progress={0}
            status="not-started"
          >
            <div className="space-y-4">
              <div className="p-5 rounded-lg bg-gradient-subtle border border-border text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Статус: Не начата
                </p>
                <p className="text-xl font-bold">0/6 вопросов</p>
              </div>
              <Button className="w-full gap-2 gradient-primary hover:opacity-90 transition-smooth group" asChild>
                <Link to="/self-assessment">
                  Начать самооценку
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
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
                  Оценка коллег
                </CardTitle>
                <Badge className="bg-destructive text-destructive-foreground">
                  2 новых
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-gradient-subtle space-y-3 hover:border-primary/30 transition-smooth hover:shadow-sm">
                <p className="font-semibold">Петр Иванов просит оценить его работу</p>
                <p className="text-sm text-muted-foreground">Срок: до 15 декабря</p>
                <Button size="sm" variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth" asChild>
                  <Link to="/peer-review">Перейти к оценке</Link>
                </Button>
              </div>
              <div className="p-4 rounded-lg border border-border bg-gradient-subtle space-y-3 hover:border-primary/30 transition-smooth hover:shadow-sm">
                <p className="font-semibold">Мария Смирнова запросила обратную связь</p>
                <p className="text-sm text-muted-foreground">Срок: до 18 декабря</p>
                <Button size="sm" variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth" asChild>
                  <Link to="/peer-review">Перейти к оценке</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-smooth hover:shadow-hover hover-lift">
            <CardHeader>
              <CardTitle>Обратная связь от руководителя</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-gradient-subtle border border-border text-center space-y-2">
                <p className="text-muted-foreground leading-relaxed">
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
