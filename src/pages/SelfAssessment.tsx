import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const goals = [
  "Повышение качества кода",
  "Развитие лидерских навыков",
  "Оптимизация процессов разработки",
  "Другая задача",
];

export default function SelfAssessment() {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [formData, setFormData] = useState({
    results: "",
    contribution: "",
    skills: "",
    improvements: "",
    teamworkScore: 5,
    satisfactionScore: 5,
  });
  const [completedQuestions, setCompletedQuestions] = useState(0);
  const { toast } = useToast();

  const totalQuestions = 6;
  const progress = (completedQuestions / totalQuestions) * 100;

  const calculateScore = (value: number) => {
    if (value >= 0 && value <= 7) return 1;
    if (value >= 8 && value <= 12) return 2;
    return 3;
  };

  const getScoreLabel = (value: number) => {
    if (value >= 0 && value <= 3) return "Низкое";
    if (value >= 4 && value <= 7) return "Среднее";
    return "Высокое";
  };

  const totalScore =
    calculateScore(formData.teamworkScore) + calculateScore(formData.satisfactionScore);

  const handleSaveDraft = () => {
    toast({
      title: "Черновик сохранен",
      description: "Ваши ответы автоматически сохранены",
    });
  };

  const handleSubmit = () => {
    if (!selectedGoal || !formData.results.trim() || !formData.contribution.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля",
      });
      return;
    }

    toast({
      title: "Самооценка отправлена",
      description: "Ваша самооценка успешно отправлена",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Самооценка</h1>
          <p className="text-muted-foreground text-lg">
            Оцените свою работу за отчетный период
          </p>
        </div>

        {/* Progress */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прогресс заполнения</span>
              <Badge variant="outline">{completedQuestions}/{totalQuestions} вопросов</Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Select Goal */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Выберите задачу для оценки</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите задачу из ваших целей" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedGoal && (
          <>
            {/* Question 1 */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  1. Каких результатов удалось достичь?
                  <span className="text-destructive ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Выявил возможность оптимизации процесса, что привело к сокращению времени на 30%..."
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  maxLength={1000}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.results.length}/1000
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Подсказка:</strong> Опишите конкретные измеримые результаты, используя цифры и факты
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Question 2 */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  2. Какой личный вклад в результат?
                  <span className="text-destructive ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Опишите ваш личный вклад..."
                  value={formData.contribution}
                  onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.contribution.length}/500
                </p>
              </CardContent>
            </Card>

            {/* Question 3 */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  3. Что забрал с собой (навыки)?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Например: прокачался в микросервисах, научился эффективно работать с командой..."
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.skills.length}/500
                </p>
              </CardContent>
            </Card>

            {/* Question 4 */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  4. Что сделаю по-другому?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Рефлексия: что бы вы изменили в своем подходе..."
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.improvements.length}/500
                </p>
              </CardContent>
            </Card>

            {/* Question 5 */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  5. Оценка взаимодействия с коллегами (0-10)
                  <span className="text-destructive ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Slider
                    value={[formData.teamworkScore]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teamworkScore: value[0] })
                    }
                    max={10}
                    step={1}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formData.teamworkScore}
                    </span>
                    <Badge variant="outline">
                      {getScoreLabel(formData.teamworkScore)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0-3: Низкое</span>
                    <span>4-7: Среднее</span>
                    <span>8-10: Высокое</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question 6 */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  6. Удовлетворенность выполнением (0-10)
                  <span className="text-destructive ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Slider
                    value={[formData.satisfactionScore]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, satisfactionScore: value[0] })
                    }
                    max={10}
                    step={1}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formData.satisfactionScore}
                    </span>
                    <Badge variant="outline">
                      {getScoreLabel(formData.satisfactionScore)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0-3: Низкое</span>
                    <span>4-7: Среднее</span>
                    <span>8-10: Высокое</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Summary */}
            <Card className="shadow-card bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Итоговый балл
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Рассчитывается автоматически на основе ваших ответов
                    </p>
                    <p className="text-xs text-muted-foreground">
                      0-7 = 1 балл • 8-12 = 2 балла • 13-20 = 3 балла
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">{totalScore}</div>
                    <p className="text-sm text-muted-foreground">баллов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex-1 gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить черновик
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 gap-2 gradient-primary"
              >
                <Send className="w-4 h-4" />
                Отправить
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Автосохранение происходит каждые 30 секунд
            </p>
          </>
        )}
      </main>
    </div>
  );
}
