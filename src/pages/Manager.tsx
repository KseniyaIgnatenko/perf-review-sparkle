import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClipboardCheck, TrendingUp, Users, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTeamMembers } from "@/hooks/useManager";
import { Skeleton } from "@/components/ui/skeleton";

export default function Manager() {
  const { teamMembers, isLoading } = useTeamMembers();

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
                      <Button variant="outline" size="sm">
                        Просмотр деталей
                      </Button>
                      {employee.status === "in-review" && (
                        <Button size="sm">Провести оценку</Button>
                      )}
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
                        <Button variant="outline" size="sm">
                          Просмотр деталей
                        </Button>
                        {employee.status === "in-review" && (
                          <Button size="sm">Провести оценку</Button>
                        )}
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
