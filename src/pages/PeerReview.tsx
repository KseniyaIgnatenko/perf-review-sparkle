import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, CheckCircle2, Clock, Plus, Send, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { useProfiles } from "@/hooks/useProfiles";
import { useGoals, useGoalTasks } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PeerReview() {
  const { user } = useAuth();
  const { reviewsToWrite, reviewsReceived, requestsSent, isLoading, requestReview, isRequesting, submitReview, isSubmitting } = usePeerReviews();
  const { profiles } = useProfiles();
  const { goals } = useGoals();
  const { toast } = useToast();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [scores, setScores] = useState({
    collaboration: 5,
    quality: 5,
    communication: 5,
  });
  const [comment, setComment] = useState("");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("none");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none");

  // Получаем задачи для выбранной цели
  const { tasks: tasksForSelectedGoal = [] } = useGoalTasks(
    selectedGoalId && selectedGoalId !== 'none' ? selectedGoalId : null
  );

  const handleRequestReview = () => {
    if (!selectedColleagueId) {
      toast({
        title: "Ошибка",
        description: "Выберите коллегу",
        variant: "destructive",
      });
      return;
    }

    requestReview(
      { 
        reviewerId: selectedColleagueId,
        goalId: selectedGoalId && selectedGoalId !== 'none' ? selectedGoalId : undefined,
        taskId: selectedTaskId && selectedTaskId !== 'none' ? selectedTaskId : undefined
      },
      {
        onSuccess: () => {
          setRequestDialogOpen(false);
          setSelectedColleagueId("");
          setSelectedGoalId("none");
          setSelectedTaskId("none");
        },
      }
    );
  };

  const handleSubmit = () => {
    if (!selectedRequest) return;

    if (!comment.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, оставьте комментарий",
        variant: "destructive",
      });
      return;
    }

    submitReview(
      { 
        id: selectedRequest, 
        collaboration_score: scores.collaboration,
        quality_score: scores.quality,
        communication_score: scores.communication,
        comment 
      },
      {
        onSuccess: () => {
          setSelectedRequest(null);
          setScores({ collaboration: 5, quality: 5, communication: 5 });
          setComment("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  const pendingReviews = reviewsToWrite.filter(r => r.status === 'pending');
  const completedReviews = reviewsToWrite.filter(r => r.status === 'submitted');

  // Фильтруем коллег - исключаем уже отправленные запросы и самого пользователя
  const requestedReviewerIds = reviewsReceived.map(r => r.reviewer_id);
  const availableColleagues = profiles.filter(
    p => !requestedReviewerIds.includes(p.id) && p.id !== user?.id
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="flex items-center gap-2 mb-2">
              <Users className="w-8 h-8 text-primary" />
              Оценка от коллег
            </h1>
            <p className="text-muted-foreground text-lg">
              Оцените работу коллег и просмотрите отзывы о вашей работе
            </p>
          </div>
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Запросить отзыв
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Запросить отзыв от коллеги</DialogTitle>
                <DialogDescription>
                  Выберите коллегу и укажите цель или задачу, по которой хотите получить обратную связь
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="colleague">Коллега *</Label>
                  <Select value={selectedColleagueId} onValueChange={setSelectedColleagueId}>
                    <SelectTrigger id="colleague">
                      <SelectValue placeholder="Выберите коллегу" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColleagues.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Нет доступных коллег
                        </div>
                      ) : (
                        availableColleagues.map((colleague) => (
                          <SelectItem key={colleague.id} value={colleague.id}>
                            {colleague.full_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Цель (опционально)</Label>
                  <Select 
                    value={selectedGoalId} 
                    onValueChange={(value) => {
                      setSelectedGoalId(value);
                      setSelectedTaskId("none"); // Сбрасываем выбранную задачу при смене цели
                    }}
                  >
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Выберите цель" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без привязки к цели</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGoalId && selectedGoalId !== 'none' && tasksForSelectedGoal.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="task">Задача (опционально)</Label>
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                      <SelectTrigger id="task">
                        <SelectValue placeholder="Выберите задачу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">На всю цель</SelectItem>
                        {tasksForSelectedGoal.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  className="w-full gap-2" 
                  onClick={handleRequestReview}
                  disabled={isRequesting || !selectedColleagueId}
                >
                  <Send className="w-4 h-4" />
                  Отправить запрос
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="reviewing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reviewing" className="gap-2">
              <Send className="w-4 h-4" />
              Я оцениваю ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="gap-2">
              <Users className="w-4 h-4" />
              Меня оценивают ({requestsSent.length + reviewsReceived.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviewing" className="space-y-4">
            {/* Инструкция для таба "Я оцениваю" */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>В этом разделе:</strong> вы пишете отзывы о работе коллег, которые запросили у вас обратную связь
                </p>
              </CardContent>
            </Card>

            {pendingReviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    Нет запросов на оценку
                  </p>
                  <p className="text-muted-foreground">
                    Когда коллеги запросят у вас отзыв, они появятся здесь
                  </p>
                </CardContent>
              </Card>
            ) : selectedRequest ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>
                    Оценка коллеги: {pendingReviews.find(r => r.id === selectedRequest)?.reviewee?.full_name || 'Коллега'}
                  </CardTitle>
                  <CardDescription>
                    Заполните все поля и оцените работу коллеги
                    {pendingReviews.find(r => r.id === selectedRequest)?.task ? (
                      <span className="flex items-center gap-2 mt-2 text-sm">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-medium">Задача:</span> {pendingReviews.find(r => r.id === selectedRequest)?.task?.title}
                      </span>
                    ) : pendingReviews.find(r => r.id === selectedRequest)?.goal ? (
                      <span className="flex items-center gap-2 mt-2 text-sm">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-medium">Цель:</span> {pendingReviews.find(r => r.id === selectedRequest)?.goal?.title}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Общая оценка работы
                        </Badge>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Сотрудничество ({scores.collaboration}/10)</Label>
                      <Slider
                        value={[scores.collaboration]}
                        onValueChange={([value]) =>
                          setScores({ ...scores, collaboration: value })
                        }
                        max={10}
                        min={1}
                        step={1}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Качество работы ({scores.quality}/10)</Label>
                      <Slider
                        value={[scores.quality]}
                        onValueChange={([value]) =>
                          setScores({ ...scores, quality: value })
                        }
                        max={10}
                        min={1}
                        step={1}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Коммуникация ({scores.communication}/10)</Label>
                      <Slider
                        value={[scores.communication]}
                        onValueChange={([value]) =>
                          setScores({ ...scores, communication: value })
                        }
                        max={10}
                        min={1}
                        step={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий *</Label>
                    <Textarea
                      id="comment"
                      placeholder="Поделитесь своими наблюдениями и рекомендациями..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(null);
                        setScores({ collaboration: 5, quality: 5, communication: 5 });
                        setComment("");
                      }}
                    >
                      Отменить
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      Отправить отзыв
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingReviews.map((request) => (
                  <Card key={request.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {request.reviewee?.full_name || 'Коллега'}
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Ожидает
                            </Badge>
                          </CardTitle>
                          {request.task ? (
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="font-medium">Задача:</span> {request.task.title}
                            </CardDescription>
                          ) : request.goal ? (
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="font-medium">Цель:</span> {request.goal.title}
                            </CardDescription>
                          ) : (
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Общая оценка работы
                              </Badge>
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        Начать оценку
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {completedReviews.length > 0 && !selectedRequest && (
              <>
                <h3 className="text-lg font-semibold mt-8">Отправленные отзывы</h3>
                <div className="grid gap-4">
                  {completedReviews.map((request) => (
                    <Card key={request.id} className="shadow-card opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {request.reviewee?.full_name || 'Коллега'}
                              <Badge variant="outline">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Отправлено
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {request.reviewee?.position?.name}
                            </CardDescription>
                            <div className="mt-3 space-y-1">
                              {request.goal ? (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">Цель:</span>
                                    <span>{request.goal.title}</span>
                                  </div>
                                  {request.task && (
                                    <div className="flex items-center gap-2 text-sm ml-6">
                                      <span className="text-muted-foreground">Задача:</span>
                                      <span>{request.task.title}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Общая оценка работы
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              Оценка: {request.score?.toFixed(1)}/10
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {/* Инструкция для таба "Меня оценивают" */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>В этом разделе:</strong> вы видите отправленные запросы и отзывы, которые коллеги оставили о вашей работе. Используйте кнопку "Запросить отзыв" выше, чтобы попросить обратную связь
                </p>
              </CardContent>
            </Card>

            {/* Отправленные запросы (ожидают оценки) */}
            {requestsSent.length > 0 && (
              <>
                <h3 className="text-lg font-semibold">Отправленные запросы</h3>
                <div className="grid gap-4">
                  {requestsSent.map((request) => (
                    <Card key={request.id} className="shadow-card border-primary/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {request.reviewer?.full_name || 'Коллега'}
                              <Badge variant="secondary" className="ml-2">
                                <Clock className="w-3 h-3 mr-1" />
                                Запрошено
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {request.reviewer?.position?.name && (
                                <span className="text-xs">{request.reviewer.position.name}</span>
                              )}
                            </CardDescription>
                            <div className="mt-3 space-y-1">
                              {request.goal ? (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">Цель:</span>
                                    <span>{request.goal.title}</span>
                                  </div>
                                  {request.task && (
                                    <div className="flex items-center gap-2 text-sm ml-6">
                                      <span className="text-muted-foreground">Задача:</span>
                                      <span>{request.task.title}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Общая оценка работы
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Полученные отзывы */}
            {reviewsReceived.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-8">Полученные отзывы</h3>
                <div className="grid gap-4">
                  {reviewsReceived.map((review) => (
                    <Card key={review.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {review.reviewer?.full_name || 'Коллега'}
                              <Badge variant="outline">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Оценен
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {review.reviewer?.position?.name}
                            </CardDescription>
                            <div className="mt-3 space-y-1">
                              {review.goal ? (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">Цель:</span>
                                    <span>{review.goal.title}</span>
                                  </div>
                                  {review.task && (
                                    <div className="flex items-center gap-2 text-sm ml-6">
                                      <span className="text-muted-foreground">Задача:</span>
                                      <span>{review.task.title}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Общая оценка работы
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Общая оценка</span>
                            <span className="text-2xl font-bold text-primary">
                              {review.score?.toFixed(1)}/10
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Сотрудничество</p>
                              <p className="font-medium">{review.collaboration_score}/10</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Качество</p>
                              <p className="font-medium">{review.quality_score}/10</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Коммуникация</p>
                              <p className="font-medium">{review.communication_score}/10</p>
                            </div>
                          </div>
                          {review.comment && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Комментарий:</p>
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {requestsSent.length === 0 && reviewsReceived.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    Отзывы пока не получены
                  </p>
                  <p className="text-muted-foreground">
                    Нажмите "Запросить отзыв" выше, чтобы получить обратную связь от коллег
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}