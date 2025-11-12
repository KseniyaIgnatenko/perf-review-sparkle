import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FormQuestion {
  id?: string;
  template_id?: string;
  question_text: string;
  question_type: 'text' | 'number' | 'scale' | 'single_choice' | 'multiple_choice';
  order_index: number;
  options?: string[];
  is_required: boolean;
  score_weight: number;
  min_value?: number;
  max_value?: number;
  help_text?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  form_type: 'self_assessment' | 'peer_review' | 'potential_assessment' | 'manager_feedback' | 'custom';
  department_id?: string;
  period?: string;
  is_active: boolean;
  version: number;
  parent_template_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  questions?: FormQuestion[];
  department?: {
    name: string;
  };
}

export function useFormTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['form-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_templates')
        .select(`
          *,
          department:departments(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FormTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<FormTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { questions: FormQuestion[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create template
      const { data: newTemplate, error: templateError } = await supabase
        .from('form_templates')
        .insert({
          name: template.name,
          description: template.description,
          form_type: template.form_type,
          department_id: template.department_id,
          period: template.period,
          is_active: template.is_active,
          version: template.version,
          created_by: user.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create questions
      if (template.questions.length > 0) {
        const questionsToInsert = template.questions.map(q => ({
          template_id: newTemplate.id,
          question_text: q.question_text,
          question_type: q.question_type,
          order_index: q.order_index,
          options: q.options,
          is_required: q.is_required,
          score_weight: q.score_weight,
          min_value: q.min_value,
          max_value: q.max_value,
          help_text: q.help_text,
        }));

        const { error: questionsError } = await supabase
          .from('form_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
      toast({
        title: 'Шаблон создан',
        description: 'Форма успешно создана',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FormTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('form_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
      toast({
        title: 'Шаблон обновлен',
        description: 'Изменения сохранены',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createVersion = useMutation({
    mutationFn: async (templateId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get original template with questions
      const { data: originalTemplate, error: fetchError } = await supabase
        .from('form_templates')
        .select(`
          *,
          questions:form_questions(*)
        `)
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Deactivate old version
      await supabase
        .from('form_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      // Create new version
      const { data: newTemplate, error: templateError } = await supabase
        .from('form_templates')
        .insert({
          name: originalTemplate.name,
          description: originalTemplate.description,
          form_type: originalTemplate.form_type,
          department_id: originalTemplate.department_id,
          period: originalTemplate.period,
          is_active: true,
          version: originalTemplate.version + 1,
          parent_template_id: templateId,
          created_by: user.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Copy questions
      if (originalTemplate.questions && originalTemplate.questions.length > 0) {
        const questionsToInsert = originalTemplate.questions.map((q: any) => ({
          template_id: newTemplate.id,
          question_text: q.question_text,
          question_type: q.question_type,
          order_index: q.order_index,
          options: q.options,
          is_required: q.is_required,
          score_weight: q.score_weight,
          min_value: q.min_value,
          max_value: q.max_value,
          help_text: q.help_text,
        }));

        const { error: questionsError } = await supabase
          .from('form_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
      toast({
        title: 'Версия создана',
        description: 'Новая версия формы успешно создана',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    createVersion: createVersion.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
  };
}

export function useFormQuestions(templateId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['form-questions', templateId],
    queryFn: async () => {
      if (!templateId) return [];

      const { data, error } = await supabase
        .from('form_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index');

      if (error) throw error;
      return data as FormQuestion[];
    },
    enabled: !!templateId,
  });

  const updateQuestions = useMutation({
    mutationFn: async ({ templateId, questions }: { templateId: string; questions: FormQuestion[] }) => {
      // Delete existing questions
      await supabase
        .from('form_questions')
        .delete()
        .eq('template_id', templateId);

      // Insert new questions
      if (questions.length > 0) {
        const { error } = await supabase
          .from('form_questions')
          .insert(
            questions.map(q => ({
              template_id: templateId,
              question_text: q.question_text,
              question_type: q.question_type,
              order_index: q.order_index,
              options: q.options,
              is_required: q.is_required,
              score_weight: q.score_weight,
              min_value: q.min_value,
              max_value: q.max_value,
              help_text: q.help_text,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['form-questions', variables.templateId] });
      toast({
        title: 'Вопросы обновлены',
        description: 'Изменения сохранены',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    questions,
    isLoading,
    updateQuestions: updateQuestions.mutate,
    isUpdating: updateQuestions.isPending,
  };
}
