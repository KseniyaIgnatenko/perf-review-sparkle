import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createTestEmployee = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-test-employee', {
        body: {}
      });

      if (error) throw error;

      setResult(data);
      toast.success('Тестовый сотрудник успешно создан!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Ошибка при создании тестового сотрудника');
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Настройка тестовых данных</CardTitle>
            <CardDescription>
              Создайте тестового сотрудника с целями для проверки системы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Что будет создано:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Новый сотрудник: Сидоров Иван Петрович</li>
                  <li>Email: employee@wink.ru</li>
                  <li>Пароль: Test123!</li>
                  <li>Отдел: Отдел разработки (как у менеджера Петрова)</li>
                  <li>Тестовая цель "Освоение новых технологий" со статусом "На утверждении"</li>
                  <li>3 задачи к цели</li>
                </ul>
              </div>

              <Button 
                onClick={createTestEmployee} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Создать тестового сотрудника
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.success ? 'Успешно!' : 'Ошибка'}
                    </h4>
                    {result.success ? (
                      <div className="mt-2 text-sm text-green-800 space-y-2">
                        <p>{result.message}</p>
                        <div className="bg-white p-3 rounded border border-green-200 mt-2">
                          <p className="font-medium mb-1">Данные для входа:</p>
                          <p><strong>Email:</strong> {result.data.credentials.email}</p>
                          <p><strong>Пароль:</strong> {result.data.credentials.password}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-200 mt-2">
                          <p className="font-medium mb-1">Создано:</p>
                          <p>Пользователь: {result.data.user.full_name}</p>
                          <p>Цель: {result.data.goal.title} ({result.data.goal.tasks_count} задач)</p>
                          <p>Статус: {result.data.goal.status}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-red-800">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">Инструкция:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Нажмите кнопку для создания тестового сотрудника</li>
                <li>Войдите как менеджер (manager@wink.ru) и проверьте раздел "Панель менеджера"</li>
                <li>Вы должны увидеть цель сотрудника в разделе "Цели на утверждение"</li>
                <li>Также можете войти как сотрудник (employee@wink.ru / Test123!) для проверки</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
