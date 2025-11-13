import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useProfiles } from '@/hooks/useProfiles';
import { usePotentialAssessments, calculateScores } from '@/hooks/usePotentialAssessments';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Navigation } from '@/components/Navigation';

export default function PotentialAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profiles } = useProfiles();
  const { createAssessment, updateAssessment } = usePotentialAssessments();

  // Получаем employeeId из URL параметров
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedEmployeeId = searchParams.get('employeeId');

  const [formData, setFormData] = useState({
    employee_id: preselectedEmployeeId || '',
    manager_id: user?.id || '',
    period: '',
    status: 'draft',
    q1_score: null as number | null,
    q2_score: null as number | null,
    q3_1_answer: false,
    q3_2_answer: false,
    q3_3_answer: null as number | null,
    q3_4_answer: false,
    q3_5_answer: null as number | null,
    q3_6_score: 5,
    q3_7_score: null as number | null,
    q3_8_score: null as number | null,
  });

  const [calculatedScores, setCalculatedScores] = useState({
    performance_score: 0,
    potential_score: 0,
    performance_category: 0,
    potential_category: 0
  });

  // Пересчет баллов при изменении формы
  useEffect(() => {
    const scores = calculateScores(formData);
    setCalculatedScores(scores);
  }, [formData]);

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!formData.employee_id || !formData.period) {
      return;
    }

    await createAssessment.mutateAsync({
      ...formData,
      status,
    });
  };

  const employees = profiles?.filter(p => p.id !== user?.id) || [];
  const managers = profiles?.filter(p => p.role === 'manager' || p.role === 'hr') || [];

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-6 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/manager')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к команде
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Оценка потенциала сотрудника</h1>
          <p className="text-muted-foreground mt-2">
            Данный раздел необходим для общей оценки потенциала сотрудника.
            Две шкалы: потенциал-результативность
          </p>
        </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1 text-sm">
            <p><strong>Оценка складывается из следующих зон:</strong></p>
            <p>1. Результативность</p>
            <p className="ml-4">1.1. Профессиональные качества</p>
            <p className="ml-4">1.2. Личные качества</p>
            <p>2. Потенциал</p>
            <p className="ml-4">2.1. Стремление развиваться и расти</p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Форма оценки</CardTitle>
          <CardDescription>Заполните все поля для расчета итоговых баллов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Сотрудник *</Label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Руководитель *</Label>
              <Select value={formData.manager_id} onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите руководителя" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map(mgr => (
                    <SelectItem key={mgr.id} value={mgr.id}>{mgr.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Период оценки *</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                  <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                  <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                  <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Раздел 1: Результативность */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Раздел 1: Результативность</h3>
            
            {/* Вопрос 1 */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">
                1. Какие профессиональные качества проявил сотрудник за последний период работы
              </Label>
              <p className="text-sm text-muted-foreground">
                Выпадающий список: Ответственность, Ориентация на результат, Проактивность, 
                Открытое обсуждение, Командный игрок
              </p>
              <Select 
                value={formData.q1_score?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, q1_score: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите балл (1-5)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 балл</SelectItem>
                  <SelectItem value="2">2 балла</SelectItem>
                  <SelectItem value="3">3 балла</SelectItem>
                  <SelectItem value="4">4 балла</SelectItem>
                  <SelectItem value="5">5 баллов</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Шкала 1-5, вес = 1</p>
            </div>

            {/* Вопрос 2 */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">
                2. Какие личные качества проявил сотрудник за последний период работы
              </Label>
              <p className="text-sm text-muted-foreground">
                Не боялся брать на себя большие ответственности, Выстраивал открытую коммуникацию,
                Оперативно делился информацией, Выстраивал работу по задаче
              </p>
              <Select 
                value={formData.q2_score?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, q2_score: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите балл (1-4)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 балл</SelectItem>
                  <SelectItem value="2">2 балла</SelectItem>
                  <SelectItem value="3">3 балла</SelectItem>
                  <SelectItem value="4">4 балла</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Шкала 1-4, вес = 1</p>
            </div>
          </div>

          <Separator />

          {/* Раздел 2: Потенциал */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Раздел 2: Потенциал (Стремление развиваться и расти)</h3>

            {/* Вопрос 3.1 */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="text-base">3.1. Приходилось ли тебе мотивировать сотрудника дополнительно?</Label>
                <p className="text-xs text-muted-foreground">Да/Нет, вес 0/1</p>
              </div>
              <Switch 
                checked={formData.q3_1_answer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, q3_1_answer: checked }))}
              />
            </div>

            {/* Вопрос 3.2 */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="text-base">3.2. Знаешь ли ты о случаях дискоммуникации с другими коллегами?</Label>
                <p className="text-xs text-muted-foreground">Да/Нет, вес 0/1</p>
              </div>
              <Switch 
                checked={formData.q3_2_answer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, q3_2_answer: checked }))}
              />
            </div>

            {/* Вопрос 3.3 */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">
                3.3. Знаешь ли ты о желании сотрудника развиваться дальше?
              </Label>
              <Select 
                value={formData.q3_3_answer?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, q3_3_answer: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вариант" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Да, хочет развиваться и проактивно себя ведет</SelectItem>
                  <SelectItem value="2">Да, хочет развиваться, но нужна помощь менеджера/HR</SelectItem>
                  <SelectItem value="3">Не уверен, что есть желание развиваться</SelectItem>
                  <SelectItem value="4">Не хочет</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Шкала 0-1, вес = 2</p>
            </div>

            {/* Вопрос 3.4 */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="text-base">3.4. Считаешь ли ты сотрудника своим преемником?</Label>
                <p className="text-xs text-muted-foreground">Да/Нет, вес 1/0</p>
              </div>
              <Switch 
                checked={formData.q3_4_answer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, q3_4_answer: checked }))}
              />
            </div>

            {/* Вопрос 3.5 */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">3.5. Если да, когда он будет готов?</Label>
              <Select 
                value={formData.q3_5_answer?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, q3_5_answer: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите срок" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Через 1-2 года</SelectItem>
                  <SelectItem value="2">Через 2-3 года</SelectItem>
                  <SelectItem value="3">Через 3 и более лет</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">1-2 года=2, 2-3 года=1, 3+ года=0, вес = 2</p>
            </div>

            {/* Вопрос 3.6 */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">
                3.6. Как ты оцениваешь степень риска ухода сотрудника?
              </Label>
              <p className="text-sm text-muted-foreground">где 0 - нет риска, 10 - высокая степень риска ухода</p>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.q3_6_score || 5]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, q3_6_score: value[0] }))}
                  max={10}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline" className="w-12 justify-center">
                  {formData.q3_6_score}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Шкала от 0 до 10: 0-2=3б, 3-5=2б, 6-7=1б, 8-10=0б, вес = 2
              </p>
            </div>

            {/* Вопросы 3.7 и 3.8 */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">3.7. Подтянуть из ОПЗ - выбрать 10 приоритет</Label>
              <Select 
                value={formData.q3_7_score?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, q3_7_score: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите балл" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} балл</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">вес = 1</p>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label className="text-base font-medium">3.8. Подтянуть из ОПЗ - выбрать 10 приоритет</Label>
              <Select 
                value={formData.q3_8_score?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, q3_8_score: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите балл" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} балл</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">вес = 1</p>
            </div>
          </div>

          <Separator />

          {/* Итоговые результаты */}
          <div className="space-y-4 p-6 border-2 border-primary rounded-lg bg-primary/5">
            <h3 className="text-lg font-semibold">Итоговые результаты</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Результативность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Общий балл:</span>
                      <Badge variant="secondary" className="text-lg">
                        {calculatedScores.performance_score}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Категория:</span>
                      <Badge 
                        variant={calculatedScores.performance_category === 2 ? "default" : "outline"}
                        className="text-lg"
                      >
                        {calculatedScores.performance_category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      4-7 → 1, 8-11 → 2, 0-3 → 0
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Потенциал</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Общий балл:</span>
                      <Badge variant="secondary" className="text-lg">
                        {calculatedScores.potential_score}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Категория:</span>
                      <Badge 
                        variant={calculatedScores.potential_category >= 2 ? "default" : "outline"}
                        className="text-lg"
                      >
                        {calculatedScores.potential_category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      1-7 → 1, 8-12 → 2, 13-16 → 3
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={!formData.employee_id || !formData.period}
            >
              Сохранить как черновик
            </Button>
            <Button
              onClick={() => handleSubmit('submitted')}
              disabled={!formData.employee_id || !formData.period}
            >
              Отправить оценку
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
