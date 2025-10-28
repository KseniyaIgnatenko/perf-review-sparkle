import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, TrendingUp, Users, AlertCircle, CheckCircle, XCircle, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTeamMembers } from "@/hooks/useManager";
import { useManagerGoals } from "@/hooks/useManagerGoals";
import { useGoalTasks } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const GoalTasksView = ({ goalId }: { goalId: string }) => {
  const { tasks, isLoading } = useGoalTasks(goalId);

  if (isLoading) {
    return <Skeleton className="h-16" />;
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">Нет задач</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Задачи:</p>
      <div className="space-y-1">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={task.is_done} disabled />
            <span className={cn(task.is_done && "line-through text-muted-foreground")}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Manager() {
  const { teamMembers, isLoading } = useTeamMembers();
  const { goals, isLoading: isLoadingGoals, approveGoal, rejectGoal, isApproving, isRejecting } = useManagerGoals();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Ожидает", variant: "secondary" as const },
      "in-review": { label: "На проверке", variant: "default" as const },
      completed: { label: "Завершено", variant: "outline" as const },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  const completedCount = teamMembers.filter((e) => e.status === "completed").length;
  const inReviewCount = teamMembers.filter((e) => e.status === "in-review").length;
  const goalsToReviewCount = goals.filter((g) => g.status === "on_review").length;

  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const },
    on_review: { label: "На проверке", variant: "default" as const },
    approved: { label: "Утверждена", variant: "outline" as const },
    completed: { label: "Завершена", variant: "outline" as const },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            Панель менеджера
          </h1>
          <p className="text-muted-foreground text-lg">
            Управление оценкой и развитием вашей команды
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">в вашей команде</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Завершили оценку</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">
                из {teamMembers.length} сотрудников
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inReviewCount}</div>
              <p className="text-xs text-muted-foreground">на проверке</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Approval Section */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Цели на утверждение
                </CardTitle>
                <CardDescription className="mt-1">
                  {goalsToReviewCount === 0 
                    ? 'Нет целей, ожидающих утверждения' 
                    : `${goalsToReviewCount} ${goalsToReviewCount === 1 ? 'цель требует' : 'целей требуют'} вашего утверждения`
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingGoals ? (
              <Skeleton className="h-32" />
            ) : goalsToReviewCount === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Все цели проверены
                </p>
              </div>
            ) : (
              goals
                .filter((goal) => goal.status === "on_review")
                .map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <Badge variant={statusConfig[goal.status].variant}>
                            {statusConfig[goal.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Сотрудник: {goal.employee_name}
                        </p>
                        {goal.description && (
                          <p className="text-sm leading-relaxed mb-2">{goal.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                          {goal.period && <span>Период: {goal.period}</span>}
                          {goal.due_date && (
                            <span>Срок: {new Date(goal.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        <GoalTasksView goalId={goal.id} />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectGoal(goal.id)}
                        disabled={isRejecting || isApproving}
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        На доработку
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveGoal(goal.id)}
                        disabled={isApproving || isRejecting}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Утвердить
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Employees List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="pending">Ожидают</TabsTrigger>
            <TabsTrigger value="in-review">На проверке</TabsTrigger>
            <TabsTrigger value="completed">Завершено</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {teamMembers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">Нет сотрудников</p>
                  <p className="text-muted-foreground">
                    В вашей команде пока нет сотрудников для оценки
                  </p>
                </CardContent>
              </Card>
            ) : (
              teamMembers.map((employee) => (
                <Card key={employee.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(employee.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{employee.full_name}</CardTitle>
                          <CardDescription>Сотрудник</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(employee.status).variant}>
                        {getStatusBadge(employee.status).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Самооценка:</span>
                          <span className="font-semibold">
                            {employee.selfAssessmentScore?.toFixed(1) || 'Н/Д'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Оценка коллег:</span>
                          <span className="font-semibold">
                            {employee.peerAverageScore?.toFixed(1) || 'Н/Д'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Выполнено целей:</span>
                          <span className="font-semibold">
                            {employee.goalsCompleted} из {employee.totalGoals}
                          </span>
                        </div>
                        <Progress
                          value={employee.totalGoals > 0 ? (employee.goalsCompleted / employee.totalGoals) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a href={`/manager/feedback?employeeId=${employee.id}&employeeName=${encodeURIComponent(employee.full_name)}`}>
                          Оценить сотрудника
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {["pending", "in-review", "completed"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {teamMembers
                .filter((e) => e.status === status)
                .map((employee) => (
                  <Card key={employee.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(employee.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{employee.full_name}</CardTitle>
                            <CardDescription>Сотрудник</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Самооценка:</span>
                            <span className="font-semibold">
                              {employee.selfAssessmentScore?.toFixed(1) || 'Н/Д'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Оценка коллег:</span>
                            <span className="font-semibold">
                              {employee.peerAverageScore?.toFixed(1) || 'Н/Д'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Выполнено целей:</span>
                            <span className="font-semibold">
                              {employee.goalsCompleted} из {employee.totalGoals}
                            </span>
                          </div>
                          <Progress
                            value={employee.totalGoals > 0 ? (employee.goalsCompleted / employee.totalGoals) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <a href={`/manager/feedback?employeeId=${employee.id}&employeeName=${encodeURIComponent(employee.full_name)}`}>
                            Оценить сотрудника
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
