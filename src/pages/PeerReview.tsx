import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Users, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePeerReviews } from "@/hooks/usePeerReviews";
import { Skeleton } from "@/components/ui/skeleton";

export default function PeerReview() {
  const { reviewsToWrite, reviewsReceived, isLoading, submitReview, isSubmitting } = usePeerReviews();
  const { toast } = useToast();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [scores, setScores] = useState({
    collaboration: 5,
    quality: 5,
    communication: 5,
  });
  const [comment, setComment] = useState("");

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

    const averageScore = (scores.collaboration + scores.quality + scores.communication) / 3;

    submitReview(
      { id: selectedRequest, score: averageScore, comment },
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 mb-2">
            <Users className="w-8 h-8 text-primary" />
            Peer Review
          </h1>
          <p className="text-muted-foreground text-lg">
            Оцените работу коллег и просмотрите полученные отзывы
          </p>
        </div>

        <Tabs defaultValue="reviewing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reviewing">
              Я оцениваю ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Меня оценивают ({reviewsReceived.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviewing" className="space-y-4">
            {pendingReviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
                  <p className="text-lg font-semibold mb-2">
                    Все отзывы отправлены!
                  </p>
                  <p className="text-muted-foreground">
                    У вас нет активных запросов на оценку
                  </p>
                </CardContent>
              </Card>
            ) : selectedRequest ? (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Оценка коллеги</CardTitle>
                  <CardDescription>
                    Заполните все поля и оцените работу коллеги
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
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {(request as any).reviewee?.full_name || 'Коллега'}
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Ожидает
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Цель: {(request as any).goal?.title || 'Без названия'}
                          </CardDescription>
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
                              {(request as any).reviewee?.full_name || 'Коллега'}
                              <Badge variant="outline">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Отправлено
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Оценка: {request.score?.toFixed(1)}/10
                            </CardDescription>
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
            {reviewsReceived.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    Отзывы пока не получены
                  </p>
                  <p className="text-muted-foreground">
                    Здесь будут отображаться отзывы от ваших коллег
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reviewsReceived.map((review) => (
                  <Card key={review.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            От: {(review as any).reviewer?.full_name || 'Коллега'}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Оценка: <span className="font-semibold text-primary">{review.score?.toFixed(1)}/10</span>
                          </CardDescription>
                        </div>
                        <Badge>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Комментарий:
                        </p>
                        <p className="text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
