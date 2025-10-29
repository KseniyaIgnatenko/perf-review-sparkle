import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Generating recommendations for user: ${user.id}`);

    // Собираем данные пользователя
    const [
      { data: profile },
      { data: peerReviews },
      { data: goals },
      { data: selfAssessments },
      { data: managerFeedback }
    ] = await Promise.all([
      supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
      supabase.from('peer_reviews')
        .select('score, comment, collaboration_score, communication_score, quality_score, status')
        .eq('reviewee_id', user.id)
        .eq('status', 'submitted'),
      supabase.from('goals')
        .select('title, description, status, progress, due_date')
        .eq('user_id', user.id),
      supabase.from('self_assessments')
        .select('total_score, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('manager_feedbacks')
        .select('total_score, comment, created_at')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
    ]);

    console.log('Data collected:', {
      peerReviews: peerReviews?.length || 0,
      goals: goals?.length || 0,
      selfAssessments: selfAssessments?.length || 0,
      managerFeedback: managerFeedback?.length || 0
    });

    // Формируем промпт для AI
    const systemPrompt = `Ты - эксперт по развитию персонала. Проанализируй данные сотрудника и предоставь персонализированные рекомендации по профессиональному развитию на русском языке.

Структурируй ответ в следующем формате:
1. Сильные стороны (2-3 пункта)
2. Области для развития (3-4 пункта с конкретными рекомендациями)
3. Рекомендуемые действия (3-5 конкретных шагов)
4. Приоритетные навыки для развития (топ-3)

Будь конкретным, практичным и мотивирующим. Основывайся только на предоставленных данных.`;

    const userData = `
ДАННЫЕ СОТРУДНИКА:
Имя: ${profile?.full_name || 'Не указано'}
Роль: ${profile?.role || 'employee'}

ОЦЕНКИ ОТ КОЛЛЕГ (${peerReviews?.length || 0} отзывов):
${peerReviews?.map(r => `
- Общая оценка: ${r.score || 'N/A'}/5
  Сотрудничество: ${r.collaboration_score || 'N/A'}/5
  Коммуникация: ${r.communication_score || 'N/A'}/5
  Качество работы: ${r.quality_score || 'N/A'}/5
  ${r.comment ? `Комментарий: ${r.comment}` : ''}
`).join('\n') || 'Нет данных'}

ЦЕЛИ (${goals?.length || 0}):
${goals?.map(g => `
- ${g.title} (${g.status})
  Прогресс: ${g.progress}%
  ${g.description ? `Описание: ${g.description}` : ''}
`).join('\n') || 'Нет данных'}

САМООЦЕНКИ (последние ${selfAssessments?.length || 0}):
${selfAssessments?.map(s => `
- Оценка: ${s.total_score || 'N/A'}/5 (${s.status})
`).join('\n') || 'Нет данных'}

ОБРАТНАЯ СВЯЗЬ ОТ МЕНЕДЖЕРА (последние ${managerFeedback?.length || 0}):
${managerFeedback?.map(f => `
- Оценка: ${f.total_score || 'N/A'}/5
  ${f.comment ? `Комментарий: ${f.comment}` : ''}
`).join('\n') || 'Нет данных'}
`;

    console.log('Calling Lovable AI...');

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userData }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Превышен лимит запросов. Попробуйте позже.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Необходимо пополнить баланс Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const recommendation = aiData.choices[0].message.content;

    console.log('Recommendation generated successfully');

    return new Response(
      JSON.stringify({ recommendation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-development-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
