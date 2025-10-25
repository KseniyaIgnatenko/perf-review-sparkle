import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileOutput, Download, Eye, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Report {
  id: string;
  title: string;
  type: "personal" | "team" | "company";
  period: string;
  date: string;
  status: "ready" | "processing";
}

export default function Reports() {
  const [reports] = useState<Report[]>([
    {
      id: "1",
      title: "Личный отчет по целям Q4 2024",
      type: "personal",
      period: "Q4 2024",
      date: "2024-12-01",
      status: "ready",
    },
    {
      id: "2",
      title: "Итоги 360° оценки",
      type: "personal",
      period: "Q4 2024",
      date: "2024-12-15",
      status: "ready",
    },
    {
      id: "3",
      title: "Отчет по команде - Разработка",
      type: "team",
      period: "Q4 2024",
      date: "2024-12-20",
      status: "ready",
    },
    {
      id: "4",
      title: "Сводный отчет по компании",
      type: "company",
      period: "Q4 2024",
      date: "2024-12-25",
      status: "processing",
    },
  ]);

  const [personalStats] = useState({
    overallScore: 8.5,
    goalsCompleted: 4,
    totalGoals: 5,
    selfAssessment: 8.5,
    peerAverage: 8.2,
    managerScore: 8.7,
  });

  const getTypeBadge = (type: string) => {
    const typeMap = {
      personal: { label: "Личный", variant: "default" as const },
      team: { label: "Команда", variant: "secondary" as const },
      company: { label: "Компания", variant: "outline" as const },
    };
    return typeMap[type as keyof typeof typeMap];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-2">
            <FileOutput className="w-8 h-8 text-primary" />
            Отчеты
          </h1>
          <p className="text-muted-foreground text-lg">
            Просмотр и загрузка отчетов по оценке результативности
          </p>
        </div>

        {/* Personal Summary */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>Ваши результаты</CardTitle>
            <CardDescription>Сводка по итогам оценки за текущий период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Общий балл:</span>
                  <span className="text-3xl font-bold text-primary">
                    {personalStats.overallScore}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Выполнено целей:</span>
                    <span className="font-semibold">
                      {personalStats.goalsCompleted} из {personalStats.totalGoals}
                    </span>
                  </div>
                  <Progress
                    value={(personalStats.goalsCompleted / personalStats.totalGoals) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Самооценка:</span>
                  <span className="font-bold">{personalStats.selfAssessment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Оценка коллег:</span>
                  <span className="font-bold">{personalStats.peerAverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Оценка менеджера:</span>
                  <span className="font-bold">{personalStats.managerScore}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Доступные отчеты</h2>
          {reports.map((report) => (
            <Card key={report.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {report.period} • Создан {new Date(report.date).toLocaleDateString("ru-RU")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getTypeBadge(report.type).variant}>
                      {getTypeBadge(report.type).label}
                    </Badge>
                    {report.status === "processing" ? (
                      <Badge variant="secondary">Формируется</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success-light text-success-foreground border-success">
                        Готов
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  {report.status === "ready" ? (
                    <>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Просмотр
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Скачать PDF
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" disabled>
                      Формируется...
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Development Recommendations */}
        <Card className="shadow-card mt-8">
          <CardHeader>
            <CardTitle>Рекомендации по развитию</CardTitle>
            <CardDescription>
              На основе результатов оценки мы подготовили для вас следующие рекомендации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>
                  Рассмотрите участие в курсе по лидерству для развития навыков управления
                  командой
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>
                  Продолжайте работу над улучшением коммуникации в кроссфункциональных проектах
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>
                  Отличные результаты в техническом развитии - можете стать ментором для младших
                  коллег
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
