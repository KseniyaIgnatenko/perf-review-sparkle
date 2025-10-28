import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { useManagerFeedback } from "@/hooks/useManagerFeedback";
import { useProfile } from "@/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerFeedback() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const employeeName = searchParams.get('employeeName');
  const navigate = useNavigate();
  
  const [totalScore, setTotalScore] = useState<string>("");
  const [comment, setComment] = useState("");
  
  const { submitFeedback, isSubmitting } = useManagerFeedback();
  const { profile, isLoading: profileLoading } = useProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId || !totalScore) {
      return;
    }

    submitFeedback(
      {
        employeeId,
        totalScore: parseFloat(totalScore),
        comment,
      },
      {
        onSuccess: () => {
          navigate("/manager");
        },
      }
    );
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg font-semibold mb-2">Ошибка</p>
              <p className="text-muted-foreground">Не указан сотрудник для оценки</p>
              <Button className="mt-4" onClick={() => navigate("/manager")}>
                Вернуться к панели менеджера
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2" 
          onClick={() => navigate("/manager")}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к панели менеджера
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="w-6 h-6 text-primary" />
              Оценка сотрудника
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Оценка для: <span className="font-semibold">{employeeName || 'Сотрудник'}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="totalScore">
                  Итоговая оценка <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  placeholder="Введите оценку от 0 до 10"
                  required
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Оценка должна быть от 0 до 10
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  Комментарий
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите сильные стороны, области для развития и общие рекомендации..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Дайте развернутую обратную связь сотруднику
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/manager")}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !totalScore}
                  className="flex-1"
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить оценку"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
