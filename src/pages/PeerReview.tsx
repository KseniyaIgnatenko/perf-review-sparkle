import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Send, Clock, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PeerRequest {
  id: string;
  employeeName: string;
  goalTitle: string;
  status: "pending" | "completed";
  dueDate: string;
}

export default function PeerReview() {
  const { toast } = useToast();
  
  // Запросы, где я оцениваю других
  const [requestsToReview] = useState<PeerRequest[]>([
    {
      id: "1",
      employeeName: "Иванов Иван",
      goalTitle: "Разработка новой функции аналитики",
      status: "pending",
      dueDate: "2024-12-15",
    },
    {
      id: "2",
      employeeName: "Петрова Мария",
      goalTitle: "Оптимизация производительности системы",
      status: "pending",
      dueDate: "2024-12-20",
    },
  ]);

  // Запросы, где меня оценивают другие
  const [requestsForMe] = useState<PeerRequest[]>([
    {
      id: "3",
      employeeName: "Сидоров Петр",
      goalTitle: "Внедрение новой системы мониторинга",
      status: "completed",
      dueDate: "2024-12-10",
    },
    {
      id: "4",
      employeeName: "Козлова Анна",
      goalTitle: "Улучшение процессов команды",
      status: "pending",
      dueDate: "2024-12-18",
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<PeerRequest | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    quality: 5,
    teamwork: 5,
    initiative: 5,
    communication: 5,
  });
  const [comment, setComment] = useState("");

  const questions = [
    { key: "quality", label: "Качество выполнения работы", weight: 30 },
    { key: "teamwork", label: "Командная работа и взаимодействие", weight: 25 },
    { key: "initiative", label: "Инициативность и проактивность", weight: 25 },
    { key: "communication", label: "Коммуникация и обратная связь", weight: 20 },
  ];

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Добавьте комментарий к оценке",
      });
      return;
    }

    toast({
      title: "Оценка отправлена",
      description: `Ваша оценка для ${selectedRequest?.employeeName} успешно сохранена`,
    });
    setSelectedRequest(null);
    setComment("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Оценка коллег
          </h1>
          <p className="text-muted-foreground text-lg">
            Оцените работу ваших коллег по запросам на обратную связь
          </p>
        </div>

        {!selectedRequest ? (
          <Tabs defaultValue="to-review" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="to-review" className="gap-2">
                <Users className="w-4 h-4" />
                Я оцениваю
              </TabsTrigger>
              <TabsTrigger value="for-me" className="gap-2">
                <UserCheck className="w-4 h-4" />
                Меня оценивают
              </TabsTrigger>
            </TabsList>

            <TabsContent value="to-review" className="space-y-4">
              <h2 className="text-xl font-semibold">Коллеги, которых мне нужно оценить</h2>
              {requestsToReview.map((request) => (
                <Card key={request.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{request.employeeName}</CardTitle>
                        <CardDescription>{request.goalTitle}</CardDescription>
                      </div>
                      <Badge variant={request.status === "completed" ? "default" : "secondary"}>
                        {request.status === "completed" ? "Завершено" : "Ожидает"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Срок: {new Date(request.dueDate).toLocaleDateString("ru-RU")}
                      </div>
                      {request.status === "pending" && (
                        <Button onClick={() => setSelectedRequest(request)}>
                          Оценить
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="for-me" className="space-y-4">
              <h2 className="text-xl font-semibold">Коллеги, которые оценивают меня</h2>
              {requestsForMe.map((request) => (
                <Card key={request.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{request.employeeName}</CardTitle>
                        <CardDescription>{request.goalTitle}</CardDescription>
                      </div>
                      <Badge variant={request.status === "completed" ? "default" : "secondary"}>
                        {request.status === "completed" ? "Получена" : "Ожидается"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Срок: {new Date(request.dueDate).toLocaleDateString("ru-RU")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
              ← Назад к списку
            </Button>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Оценка: {selectedRequest.employeeName}</CardTitle>
                <CardDescription>{selectedRequest.goalTitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question) => (
                  <div key={question.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-medium">
                        {question.label}
                        <span className="text-sm text-muted-foreground ml-2">
                          (вес: {question.weight}%)
                        </span>
                      </label>
                      <span className="text-2xl font-bold text-primary">
                        {scores[question.key]}
                      </span>
                    </div>
                    <Slider
                      value={[scores[question.key]]}
                      onValueChange={([value]) =>
                        setScores({ ...scores, [question.key]: value })
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 - Не соответствует</span>
                      <span>10 - Превосходно</span>
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="font-medium">Комментарий и рекомендации</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Опишите ваше мнение о работе коллеги, сильные стороны и области для развития..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Отправить оценку
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
