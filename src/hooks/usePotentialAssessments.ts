import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PotentialAssessment {
  id: string;
  employee_id: string;
  manager_id: string;
  period: string;
  status: string;
  q1_score: number | null;
  q2_score: number | null;
  q3_1_answer: boolean | null;
  q3_2_answer: boolean | null;
  q3_3_answer: number | null;
  q3_4_answer: boolean | null;
  q3_5_answer: number | null;
  q3_6_score: number | null;
  q3_7_score: number | null;
  q3_8_score: number | null;
  performance_score: number | null;
  potential_score: number | null;
  performance_category: number | null;
  potential_category: number | null;
  created_at: string;
  updated_at: string;
}

// Функция расчета баллов и категорий
export const calculateScores = (data: Partial<PotentialAssessment>) => {
  // Результативность = вопрос 1 (вес 1) + вопрос 2 (вес 1)
  const performanceScore = (data.q1_score || 0) + (data.q2_score || 0);
  
  // Категория результативности: 4-7=1, 8-11=2, 0-3=0 или другое
  let performanceCategory = 0;
  if (performanceScore >= 4 && performanceScore <= 7) performanceCategory = 1;
  else if (performanceScore >= 8 && performanceScore <= 11) performanceCategory = 2;
  else if (performanceScore >= 0 && performanceScore <= 3) performanceCategory = 0;
  
  // Потенциал
  let potentialScore = 0;
  
  // 3.1: Мотивация (0 или 1)
  if (data.q3_1_answer) potentialScore += 1;
  
  // 3.2: Дискоммуникация (0 или 1)
  if (data.q3_2_answer) potentialScore += 1;
  
  // 3.3: Желание развиваться (вес 2)
  // Варианты: 1=да (1 балл), 2=да но нужна помощь (1), 3=не уверен (0), 4=не хочет (0)
  if (data.q3_3_answer === 1) potentialScore += 1 * 2;
  else if (data.q3_3_answer === 2) potentialScore += 1 * 2;
  else if (data.q3_3_answer === 3) potentialScore += 0;
  else if (data.q3_3_answer === 4) potentialScore += 0;
  
  // 3.4: Преемник (1 или 0)
  if (data.q3_4_answer) potentialScore += 1;
  
  // 3.5: Срок готовности (вес 2)
  // 1-2 года = 2, 2-3 года = 1, 3+ лет = 0
  if (data.q3_5_answer === 1) potentialScore += 2 * 2; // 1-2 года
  else if (data.q3_5_answer === 2) potentialScore += 1 * 2; // 2-3 года
  else if (data.q3_5_answer === 3) potentialScore += 0; // 3+ лет
  
  // 3.6: Риск ухода (шкала 0-10, вес 2)
  // Инвертированная шкала: 0-2=3, 3-5=2, 6-7=1, 8-10=0
  const riskScore = data.q3_6_score || 0;
  if (riskScore >= 0 && riskScore <= 2) potentialScore += 3 * 2;
  else if (riskScore >= 3 && riskScore <= 5) potentialScore += 2 * 2;
  else if (riskScore >= 6 && riskScore <= 7) potentialScore += 1 * 2;
  else if (riskScore >= 8 && riskScore <= 10) potentialScore += 0 * 2;
  
  // 3.7 и 3.8: ОПЗ (вес 1 каждый)
  potentialScore += (data.q3_7_score || 0);
  potentialScore += (data.q3_8_score || 0);
  
  // Категория потенциала: 1-7=1, 8-12=2, 13-16=3, 0=0
  let potentialCategory = 0;
  if (potentialScore >= 1 && potentialScore <= 7) potentialCategory = 1;
  else if (potentialScore >= 8 && potentialScore <= 12) potentialCategory = 2;
  else if (potentialScore >= 13 && potentialScore <= 16) potentialCategory = 3;
  
  return {
    performance_score: performanceScore,
    potential_score: potentialScore,
    performance_category: performanceCategory,
    potential_category: potentialCategory
  };
};

export const usePotentialAssessments = () => {
  const queryClient = useQueryClient();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['potential-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('potential_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PotentialAssessment[];
    },
  });

  const createAssessment = useMutation({
    mutationFn: async (newAssessment: Partial<PotentialAssessment>) => {
      const scores = calculateScores(newAssessment);
      
      const insertData: any = {
        employee_id: newAssessment.employee_id!,
        manager_id: newAssessment.manager_id!,
        period: newAssessment.period!,
        status: newAssessment.status || 'draft',
        q1_score: newAssessment.q1_score,
        q2_score: newAssessment.q2_score,
        q3_1_answer: newAssessment.q3_1_answer,
        q3_2_answer: newAssessment.q3_2_answer,
        q3_3_answer: newAssessment.q3_3_answer,
        q3_4_answer: newAssessment.q3_4_answer,
        q3_5_answer: newAssessment.q3_5_answer,
        q3_6_score: newAssessment.q3_6_score,
        q3_7_score: newAssessment.q3_7_score,
        q3_8_score: newAssessment.q3_8_score,
        performance_score: scores.performance_score,
        potential_score: scores.potential_score,
        performance_category: scores.performance_category,
        potential_category: scores.potential_category
      };
      
      const { data, error } = await supabase
        .from('potential_assessments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potential-assessments'] });
      toast.success('Оценка потенциала создана');
    },
    onError: (error: any) => {
      toast.error('Ошибка создания оценки: ' + error.message);
    },
  });

  const updateAssessment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PotentialAssessment> & { id: string }) => {
      const scores = calculateScores(updates);
      
      const updateData: any = {
        ...updates,
        ...scores
      };
      
      const { data, error } = await supabase
        .from('potential_assessments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potential-assessments'] });
      toast.success('Оценка потенциала обновлена');
    },
    onError: (error: any) => {
      toast.error('Ошибка обновления оценки: ' + error.message);
    },
  });

  return {
    assessments,
    isLoading,
    createAssessment,
    updateAssessment,
  };
};
