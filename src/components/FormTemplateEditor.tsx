import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { FormTemplate, FormQuestion, useFormTemplates, useFormQuestions } from '@/hooks/useFormTemplates';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface FormTemplateEditorProps {
  template?: FormTemplate;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FormTemplateEditor({ template, onSuccess, onCancel }: FormTemplateEditorProps) {
  const { createTemplate, updateTemplate, isCreating, isUpdating } = useFormTemplates();
  const { questions: existingQuestions, isLoading: isLoadingQuestions } = useFormQuestions(template?.id || null);
  
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      form_type: template?.form_type || 'custom',
      department_id: template?.department_id || '',
      period: template?.period || '',
      is_active: template?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (existingQuestions.length > 0) {
      setQuestions(existingQuestions);
    } else if (!template) {
      // Default question for new templates
      setQuestions([{
        question_text: '',
        question_type: 'text',
        order_index: 0,
        is_required: true,
        score_weight: 1,
      }]);
    }
  }, [existingQuestions, template]);

  const formType = watch('form_type');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        order_index: questions.length,
        is_required: true,
        score_weight: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Reindex
    newQuestions.forEach((q, i) => {
      q.order_index = i;
    });
    setQuestions(newQuestions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    
    // Reindex
    newQuestions.forEach((q, i) => {
      q.order_index = i;
    });
    
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof FormQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const onSubmit = (data: any) => {
    if (template) {
      // Update existing template and questions
      updateTemplate({ id: template.id, ...data });
      if (questions.length > 0) {
        const { updateQuestions } = useFormQuestions(template.id);
        updateQuestions({ templateId: template.id, questions });
      }
    } else {
      // Create new template with questions
      createTemplate({
        ...data,
        version: 1,
        questions,
      });
    }
    onSuccess();
  };

  const questionTypes = [
    { value: 'text', label: 'Текстовое поле' },
    { value: 'number', label: 'Числовое значение' },
    { value: 'scale', label: 'Шкала (1-5)' },
    { value: 'single_choice', label: 'Одиночный выбор' },
    { value: 'multiple_choice', label: 'Множественный выбор' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Название формы</Label>
          <Input id="name" {...register('name')} required />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" {...register('description')} rows={3} />
        </div>

        <div>
          <Label htmlFor="form_type">Тип формы</Label>
          <Select
            value={formType}
            onValueChange={(value) => setValue('form_type', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self_assessment">Самооценка</SelectItem>
              <SelectItem value="peer_review">Оценка коллег</SelectItem>
              <SelectItem value="potential_assessment">Оценка потенциала</SelectItem>
              <SelectItem value="manager_feedback">Обратная связь менеджера</SelectItem>
              <SelectItem value="custom">Пользовательская форма</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="period">Период</Label>
          <Input id="period" {...register('period')} placeholder="Например: Q1 2024" />
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">Форма активна</Label>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Вопросы формы</h3>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить вопрос
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm">Вопрос {index + 1}</CardTitle>
                    {question.is_required && (
                      <Badge variant="secondary" className="text-xs">Обязательный</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Текст вопроса</Label>
                  <Textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Тип вопроса</Label>
                    <Select
                      value={question.question_type}
                      onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Вес ответа</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={question.score_weight}
                      onChange={(e) => updateQuestion(index, 'score_weight', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                {(question.question_type === 'number' || question.question_type === 'scale') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Минимум</Label>
                      <Input
                        type="number"
                        value={question.min_value || ''}
                        onChange={(e) => updateQuestion(index, 'min_value', e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <Label>Максимум</Label>
                      <Input
                        type="number"
                        value={question.max_value || ''}
                        onChange={(e) => updateQuestion(index, 'max_value', e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                )}

                {(question.question_type === 'single_choice' || question.question_type === 'multiple_choice') && (
                  <div>
                    <Label>Варианты ответов (по одному на строку)</Label>
                    <Textarea
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => updateQuestion(index, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                      rows={3}
                      placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3"
                    />
                  </div>
                )}

                <div>
                  <Label>Подсказка</Label>
                  <Input
                    value={question.help_text || ''}
                    onChange={(e) => updateQuestion(index, 'help_text', e.target.value)}
                    placeholder="Дополнительная информация для пользователя"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={question.is_required}
                    onCheckedChange={(checked) => updateQuestion(index, 'is_required', checked)}
                  />
                  <Label>Обязательный вопрос</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isCreating || isUpdating}>
          {template ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
