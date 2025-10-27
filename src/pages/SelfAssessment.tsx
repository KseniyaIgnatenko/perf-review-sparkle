import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Send, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const goals = [
  "Повышение качества кода",
  "Развитие лидерских навыков",
  "Оптимизация процессов разработки",
  "Другая задача",
];

export default function SelfAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [formData, setFormData] = useState({
    results: "",
    contribution: "",
    skills: "",
    improvements: "",
    teamworkScore: 5,
    satisfactionScore: 5,
  });
  const { toast } = useToast();

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const steps = [
    { title: "Выбор задачи", description: "Выберите задачу для оценки" },
    { title: "Достижения", description: "Каких результатов удалось достичь?" },
    { title: "Вклад", description: "Какой личный вклад в результат?" },
    { title: "Навыки", description: "Что забрал с собой?" },
    { title: "Рефлексия", description: "Что сделаю по-другому?" },
    { title: "Оценка", description: "Оцените свою работу" },
  ];

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

  const handleNext = () => {
    if (currentStep === 0 && !selectedGoal) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите задачу для продолжения",
      });
      return;
    }
    if (currentStep === 1 && !formData.results.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните поле достижений",
      });
      return;
    }
    if (currentStep === 2 && !formData.contribution.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните поле вклада",
      });
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="shadow-card animate-fade-in">
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
        );

      case 1:
        return (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                Каких результатов удалось достичь?
                <span className="text-destructive ml-1">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Выявил возможность оптимизации процесса, что привело к сокращению времени на 30%..."
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                maxLength={1000}
                rows={8}
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
        );

      case 2:
        return (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                Какой личный вклад в результат?
                <span className="text-destructive ml-1">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Опишите ваш личный вклад..."
                value={formData.contribution}
                onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                maxLength={500}
                rows={6}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.contribution.length}/500
              </p>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                Что забрал с собой (навыки)?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Например: прокачался в микросервисах, научился эффективно работать с командой..."
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                maxLength={500}
                rows={6}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.skills.length}/500
              </p>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                Что сделаю по-другому?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Рефлексия: что бы вы изменили в своем подходе..."
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                maxLength={500}
                rows={6}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.improvements.length}/500
              </p>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Оценка взаимодействия с коллегами (0-10)
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

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Удовлетворенность выполнением (0-10)
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
          </div>
        );

      default:
        return null;
    }
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

        {/* Progress Indicator */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{steps[currentStep].title}</h3>
                  <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                </div>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {currentStep + 1}/{totalSteps}
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
              
              {/* Step dots */}
              <div className="flex items-center justify-between gap-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${
                        index <= currentStep
                          ? "bg-primary scale-110 shadow-sm"
                          : "bg-muted"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground hidden sm:block text-center">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Сохранить
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1 gap-2 gradient-primary"
            >
              Далее
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 gap-2 gradient-primary"
            >
              <Send className="w-4 h-4" />
              Отправить
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Автосохранение происходит каждые 30 секунд
        </p>
      </main>
    </div>
  );
}
